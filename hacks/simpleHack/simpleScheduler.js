import { getAllKnownServers } from "/lib/findAllServersDFS.js";
import { freeRam, getLargestRamUsage, hackAnalyzeMaxThreads, getScriptRam } from "/lib/MemoryProcs.js";
import { totalSystemsCouldBuy, buyServers } from "/lib/PurchaseServers.js";
import { getServersWithBestRates } from "/lib/algorithem.js";
import { Logger } from "/lib/Logger.js"
import { handleBuyServers } from "/lib/PurchaseServers.js"


var logger;
var metaData;

/** @param {NS} ns */
export async function main(ns) {
    // simpleInstructor.js <targetSystem> [destination] [ignoreHome] [minMoneyPercent] [freeRam] [killExisting] [buySystems]
    //ns.disableLog("ALL");

    //Command Line Arguments
    let args = ns.flags([
        ['dest', null],
        ['target', null],
        ['minMoneyPercent', 0.75],
        ['ignoreHome', false],
        ['killExisting', false],
        ['buySystems', false],
        ['daemon', false]
    ]);

    // Create logger, and set output to logs if daemon, to terminal if not.
    logger = new Logger(ns, !args.daemon, true);

    //Information on hacking scripts, and args tp pass to the next one.
    let scriptInfo = {
        entryPoint: '/hacks/simpleHack/simpleHack.js',
        args: {
            target: args.target,
            moneyThresh: null,
            sercurityThresh: null,
            delay: 0
        },
        files: ['/hacks/simpleHack/simpleHack.js'],
        meta: {
            minMoneyPercent: args.minMoneyPercent,
        }
    };

    //Data collection on server deployment pass/fail
    metaData = {
        pidCount: 0,
        RAMIssues: { 'count': 0, 'servers': [] },
        rootIssues: { 'count': 0, 'servers': [] }
    }

    logger.info(`Starting simple scheduler, as deamon ${args.daemon}`)
    do {
        // If destination provided, only push script to that system
        if (args.dest) {
            let serversOfInterest = getServersWithBestRates(ns, await getAllKnownServers(ns, logger))
            logger.info(`Setting up script at one location, ${args.dest}`)
            await startDeployment(ns, args.dest, scriptInfo, args.killExisting, args.target, serversOfInterest);
            printResults(1);
        } else {
            logger.info(`Setting up script on all servers.`)
            // Get All Known Servers, push to those
            let serverList = await getAllKnownServers(ns, logger);
            let serversOfInterest = getServersWithBestRates(ns, serverList)
            logger.debug(`List of servers found: ${serverList}`)
            logger.debug(`List of servers of interest ${serversOfInterest}`)
            for (let server of serverList) {
                await startDeployment(ns, server, scriptInfo, args.killExisting, args.target, serversOfInterest);
            }

            // Buy more Purchased Servers, if told
            if (args.buySystems) {
                logger.info("Buying Servers")
                handleBuyServers(ns, ns.getServerMoneyAvailable('home'))
            }

            logger.info(`Setting up script on all purchased servers.`)
            // Get All Purchased Servers, deploy to those too
            let purchasedServerList = ns.getPurchasedServers();
            for (let server of purchasedServerList) {
                await startDeployment(ns, server, scriptInfo, args.killExisting, args.target, serversOfInterest);
            }
            // Deploy to Home or maybe set this script into daemon mode to not quite.

            printResults(serverList.length + purchasedServerList.length);
        }
        if (args.daemon) {
            //Put the process to sleep for a bit before running it again
            let sleepTime = 1000 * 60 * 10;
            logger.info(`Sleeping for ${sleepTime} min`)
            await sleep(sleepTime)  //Lets have it sleep for 10 minutes
        }
    } while (args.daemon);
}

export async function startDeployment(ns, server, scriptInfo, killExisting, target, serversOfInterest) {
    try {
        //Check if it has root access,
        if (!ns.hasRootAccess(server)) {
            metaData.rootIssues.count++;
            metaData.rootIssues.servers.push(server);
            //TODO Call the breach script, it could handle this issue
            return
        }

        if (killExisting) {
            ns.killall(server, true);
        }

        //Check RAM
        let exitCode = checkRAM(ns, server, scriptInfo.files);
        if (exitCode) {
            makeRoom(ns, server) //Does Nothing Right now
            return
        }
        //Deploy script to server, unless our destinartion is this server
        logger.info(`Copying files ${scriptInfo.files}, over to ${server}`);
        await ns.scp(scriptInfo.files, server);

        //Change Target, if we want too
        if (!target && serversOfInterest != null) {
            scriptInfo.args.target = serversOfInterest[Math.floor(Math.random() * serversOfInterest.length)];
            logger.debug(`New target system is ${scriptInfo.args.target}`)
        }

        // calculateThreads()
        let threads = hackAnalyzeMaxThreads(ns, scriptInfo.args.target);
        logger.debug(`Calculated script max threads for ${scriptInfo.args.target} at ${threads} threads`)
        if (!threads) {
            logger.debug(`Threads was 0 so avaliable money was prob at 0, using 10 threads instead.`)
            threads = 10;
        }
        // calculate the Max threads that the server would allow
        let maxThreads =  freeRam(ns, server) /  ns.getScriptRam(scriptInfo.entryPoint, server);
        logger.debug(`max Threads server would allow is ${maxThreads}`)
        if (maxThreads < threads){
            logger.debug(`threads is greater than what server would allow, using max threads`)
            threads = maxThreads;
        }
        //Kick Off
        logger.debug("Kicking off run")
        await startScript(ns, server, threads, scriptInfo);
        logger.debug("Finished setting up script.")
    } catch (error) {
        logger.info(`Exception thrown, error ${error}`)
    }
}

export function checkRAM(ns, server, files) {
    let exitCode = 0;
    if (freeRam(ns, server) < getLargestRamUsage(ns, server, files)) {
        metaData.RAMIssues.count++;
        metaData.RAMIssues.servers.push(server);
        exitCode = -1;
    }
    return exitCode;
}

export async function startScript(ns, host, threads, scriptInfo) {
    try {
        // Defines how much money a server should have before we hack it
        // In this case, it is set to 75% of the server's max money
        scriptInfo.args.moneyThresh = ns.getServerMaxMoney(scriptInfo.args.target) * scriptInfo.meta.minMoneyPercent;

        // Defines the maximum security level the target server can
        // have. If the target's security level is higher than this,
        // we'll weaken it before doing anything else
        scriptInfo.args.sercurityThresh = ns.getServerMinSecurityLevel(scriptInfo.args.target) + 5;

        let args = Object.values(scriptInfo.args);

        //Check if the current hack is already running on the same server with the same parameters
        if (ns.isRunning(scriptInfo.entryPoint, host, ...args)) {
            scriptInfo.args.delay = Math.floor(Math.random() * 1000);
            args = Object.values(scriptInfo.args);
        } else {
            scriptInfo.args.delay = 0;
            args = Object.values(scriptInfo.args);
        }


        logger.debug("Here are the args" + args)
        // If no target system is selected tell script to hack host
        logger.info(`starting ${scriptInfo.entryPoint} on ${host} with args ${args}, threads ${threads}`);
        ns.enableLog("ALL");
        let pid = await ns.exec(scriptInfo.entryPoint, host, threads, ...args);
        if(pid !== 0){
            metaData.pidCount++;
        }
        return pid;
    } catch (error) {
        logger.info(`Exception: Executing script, ${error}`)
        throw new Error("Exception: Error executing new script")
    }
}

export function makeRoom(ns, server) {
    // //Check that current system has enough RAM to fork the deploy script.
    // let checks = 0;
    // const MAX_CHECKS = 5;

    // // let expectedLoad = ns.getScriptRam('/simpleHack/simpleInstructor.js') + ns.getScriptRam('/simpleHack/simpleDeploy.js');
    // let expectedLoad = ns.getScriptRam('/simpleHack/simpleDeploy.js');
    // do {
    //     //Expected load is this server plus simpleDeploy.js
    //     let currentFree = ns.getServerMaxRam('home') - ns.getServerUsedRam('home');
    //     if(currentFree >= expectedLoad ) {
    //         break;
    //     }
    //     logger.info("Not enough free RAM  " + currentFree + ". Need " + expectedLoad + "Sleeping for 20 seconds.")
    //     await ns.sleep(1000 * 20) // 20 seconds 
    //     checks++;
    // }
    // while (checks <= MAX_CHECKS);
    return true
}

export function printResults(serverCount) {
    try {
        const rootIssueCount = metaData.rootIssues.count;
        const ramIssueCount = metaData.RAMIssues.count;
        const rootIssuesServers = metaData.rootIssues.servers;
        const ramIssuesServers = metaData.RAMIssues.servers;
        const pidCount = metaData.pidCount;

        logger.info(`Of the ${serverCount} servers found succuessfully deployed to ${pidCount}`);
        logger.info(`Not root on ${rootIssueCount}, Not enough Memory found on ${ramIssueCount}`);
        logger.info(`Servers with root issues were: ${rootIssuesServers}`)
        logger.info(`Servers with memory issues were: ${ramIssuesServers}`)
    } catch (error) {
        logger.info(`Exception Thrown trying to print results: ${error}`)
    }
}

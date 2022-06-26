import { getAllKnownServers } from "/lib/findAllServersDFS.js";
import { freeRam, getLargestRamUsage, hackAnalyzeMaxThreads, getScriptRam } from "/lib/MemoryProcs.js";
import { totalSystemsCouldBuy, buyServers } from "/lib/PurchaseServers.js";
import { getServersWithBestRates } from "/lib/algorithem.js";
import { Logger } from "/lib/Logger.js"
import { handleBuyServers } from "/lib/PurchaseServers.js"

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
    ])

    // Create logger, and set output to logs if daemon, to terminal if not.
    let logger = new Logger(ns, !args.daemon, false);

    //Information on hacking scripts, and args tp pass to the next one.
    let scriptInfo = {
        entryPoint: '/hacks/simpleHack/simpleHack.js',
        args: [args.target, args.minMoneyPercent],
        files: ['/hacks/simpleHack/simpleHack.js', '/hacks/simpleHack/simpleSurvey.js']
    }

    //Data collection on server deployment pass/fail
    let metaData = {
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
            await startDeployment(ns, logger, args.dest, scriptInfo, metaData, args.killExisting, args.target, serversOfInterest);
            printResults(ns, logger, 1, metaData);
        } else {
            logger.info(`Setting up script on all servers.`)
            // Get All Known Servers, push to those
            let serverList = await getAllKnownServers(ns, logger);
            let serversOfInterest = getServersWithBestRates(ns, serverList)
            logger.debug(`List of servers found: ${serverList}`)
            logger.debug(`List of servers of interest ${serversOfInterest}`)
            for (let server of serverList) {
                await startDeployment(ns, logger, server, scriptInfo, metaData, args.killExisting, args.target, serversOfInterest);
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
                await startDeployment(ns, logger, server, scriptInfo, metaData, args.killExisting, args.target, serversOfInterest);
            }
            // Deploy to Home or maybe set this script into daemon mode to not quite.

            printResults(ns, logger, serverList.length + purchasedServerList.length, metaData);
        }
        if (args.daemon) {
            //Put the process to sleep for a bit before running it again
            let sleepTime = 1000 * 60 * 10;
            logger.info(`Sleeping for ${sleepTime} min`)
            await sleep(sleepTime)  //Lets have it sleep for 10 minutes
        }
    } while (args.daemon);
}

export async function startDeployment(ns, logger, server, scriptInfo, metaData, killExisting, target, serversOfInterest) {
    try {
        //Check if it has root access,
        if (!ns.hasRootAccess(server)) {
            metaData.rootIssues.count++;
            metaData.rootIssues.servers.push(server);
            //TODO Call the breach script, it could handle this issue
            return
        }

        //Deploy script to server, unless our destinartion is this server
        logger.info(`Copying files ${scriptInfo.files}, over to ${server}`);
        await ns.scp(scriptInfo.files, server);

        if (killExisting) {
            ns.killall(server, true);
        }

        //Check RAM
        let exitCode = checkRAM(ns, server, scriptInfo.files, metaData);
        if (exitCode) {
            makeRoom(ns, server) //Does Nothing Right now
            return
        }

        do {
            //Change Target, if we want too
            if (!target && serversOfInterest != null) {
                target = serversOfInterest[Math.floor(Math.random() * serversOfInterest.length)];
                logger.debug(`New target system is ${target}`)
                scriptInfo.args = [target, scriptInfo.args[1]]
            }

            let threads = hackAnalyzeMaxThreads(ns, target);
            var totalScriptRam = getScriptRam(ns, scriptInfo.entryPoint, target, calcThreads);
            if (totalScriptRam > freeRam(ns, server)) {
                break
            }
            //Kick Off
            logger.debug("Kicking off run")
            await startScript(ns, logger, server, threads, scriptInfo, metaData);
            logger.debug("Finished setting up script.")

        } while (freeRam(ns, server) > totalScriptRam);

    } catch (error) {
        logger.info(`Exception thrown, error ${error}`)
    }
}

export function checkRAM(ns, server, files, metaData) {
    let exitCode = 0;
    if (freeRam(ns, server) < getLargestRamUsage(ns, server, files)) {
        metaData.RAMIssues.count++;
        metaData.RAMIssues.servers.push(server);
        exitCode = -1;
    }
    return exitCode;
}

export async function startScript(ns, logger, host, threads, scriptInfo, metaData) {
    try {
        // Defines how much money a server should have before we hack it
        // In this case, it is set to 75% of the server's max money
        const moneyThresh = ns.getServerMaxMoney(scriptInfo.args[0]) * scriptInfo.args[1];

        // Defines the maximum security level the target server can
        // have. If the target's security level is higher than this,
        // we'll weaken it before doing anything else
        const securityThresh = ns.getServerMinSecurityLevel(scriptInfo.args[0]) + 5;

        const args = scriptInfo.args
        // If no target system is selected tell script to hack host
        logger.debug(`starting ${scriptInfo.entryPoint} on ${host} with args ${args}`);
        let pid = await ns.exec(scriptInfo.entryPoint, host, threads, ...args);
        if (!pid) {
            logger.info(`Error starting /simpleHack/simpleHack.js script. pid: ${pid}`);
        } else {
            metaData.pidCount++;
        }
    } catch (error) {
        logger.info(`Exception: Executing script, ${error}`)
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

export function printResults(ns, logger, serverCount, metaData) {
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

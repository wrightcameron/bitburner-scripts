import { cliArgDict, checkForArg } from "/lib/cliArgs";
import { getAllKnownServers } from "/lib/findAllServersDFS.js";
import { freeRam, getLargestRamUsage } from "/lib/MemoryProcs.js";
import { totalSystemsCouldBuy, buyServers } from "/lib/PurchaseServers.js";
import { getServersWithBestRates } from "/lib/algorithem.js";
import { Logger } from "/lib/Logger.js"

/** @param {NS} ns */
export async function main(ns) {
    // simpleInstructor.js <targetSystem> [destination] [ignoreHome] [minMoneyPercent] [freeRam] [killExisting]
    //ns.disableLog("ALL");

    //Command Line Arguments
    let argDict = cliArgDict(ns.args);
    let dest = checkForArg(argDict, 'dest', null)
    let target = checkForArg(argDict, 'target', null)
    let minMoneyPercent = checkForArg(argDict, 'minMoneyPercent', 0.75)
    let ignoreHome = checkForArg(argDict, 'ignoreHome', false)
    let killExisting = checkForArg(argDict, 'killExisting', false)
    let buySystems = checkForArg(argDict, 'buySystems', false)
    
    let logger = new Logger(ns, true, true);

    //Information on hacking scripts, and args tp pass to the next one.
    let scriptInfo = {
        entryPoint: '/simpleHack/simpleSurvey.js',
        args: [target, minMoneyPercent],
        files: ['/simpleHack/simpleHack.js', '/simpleHack/simpleSurvey.js']
    }

    //Data collection on server deployment pass/fail
    let metaData = {
        pidCount : 0,
        RAMIssues: { 'count': 0, 'servers': [] },
        rootIssues: { 'count': 0, 'servers': [] }
    }

    //If destination provided, only push script to that system
    if (dest) {
        let serversOfInterest = getServersWithBestRates(ns, await getAllKnownServers(ns))
        logger.info(`Setting up script at one location, ${dest}`)
        await startDeployment(ns, logger, dest, scriptInfo, metaData, killExisting, target, serversOfInterest);
        printResults(ns, logger, 1, metaData);
    } else {
        logger.info(`Setting up script on all servers.`)
        // Get All Known Servers, push to those
        let serverList = await getAllKnownServers(ns);
        let serversOfInterest = getServersWithBestRates(ns, serverList)
        for(let server of serverList) {
            await startDeployment(ns, logger, server, scriptInfo, metaData, killExisting, target, serversOfInterest);
        }
        
        // Buy more Purchased Servers, if told
        if(buySystems){
            let numSystems = totalSystemsCouldBuy(ns, 64, ns.getServerMoneyAvailable('home'))
            logger.info(`Purchasing ${numSystems} with 64 GB of RAM.`)
            let boughtServers = buyServers(ns, numSystems, 64);
            logger.info(`Bought these systems: ${boughtServers}`)
        }
        
        logger.info(`Setting up script on all purchased servers.`)
        // Get All Purchased Servers, deploy to those too
        let purchasedServerList = ns.getPurchasedServers();
        for(let server of purchasedServerList) {
            await startDeployment(ns, logger, server, scriptInfo, metaData, killExisting, target, serversOfInterest);
        }
        // Deploy to Home or maybe set this script into daemon mode to not quite.

        printResults(ns, logger, serverList.length + purchasedServerList.length, metaData);
    }
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

        if(killExisting){
                ns.killall(server, true);
        }

        //Check RAM
        let exitCode = checkRAM(ns, server, scriptInfo.files, metaData);
        if (exitCode) {
            makeRoom(ns, server) //Does Nothing Right now
            return
        }
        //Deploy script to server, unless our destinartion is this server
        logger.info(`Copying files ${scriptInfo.files}, over to ${server}`);
        await ns.scp(scriptInfo.files, server);

        // calculateThreads()
        let threads = 1;

        //Change Target, if we want too
        if(!target && serversOfInterest != null){
            target = serversOfInterest[Math.floor(Math.random()*serversOfInterest.length)];
            logger.info(`New target system is ${target}`)
            scriptInfo.args = [target, scriptInfo.args[1]]
        }

        //Kick Off
        logger.info("Kicking off run")
        await startScript(ns, logger, server, threads, scriptInfo, metaData);
        logger.info("Finished setting up script.")
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
    try{
        const args = scriptInfo.args
        // If no target system is selected tell script to hack host
        logger.info(`starting ${scriptInfo.entryPoint} on ${host} with args ${args }`);
        let pid = await ns.exec(scriptInfo.entryPoint, host, threads, ...args);
        if (!pid) {
            logger.info(`Error starting /simpleHack/simpleDeploy.js script. pid: ${pid}`);
        } else {
            metaData.pidCount++;
        }
    }catch (error){
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
    return True
}

export function printResults(ns, logger, serverCount, metaData) {
    try{
        const rootIssueCount = metaData.rootIssues.count;
        const ramIssueCount = metaData.RAMIssues.count;
        const rootIssuesServers = metaData.rootIssues.servers;
        const ramIssuesServers = metaData.RAMIssues.servers;
        const pidCount = metaData.pidCount;

        logger.info(`Of the ${serverCount} servers found succuessfully deployed to ${pidCount}`);
        logger.info(`Not root on ${rootIssueCount}, Not enough Memory found on ${ramIssueCount}`);
        logger.info(`Servers with root issues were: ${rootIssuesServers}`)
        logger.info(`Servers with memory issues were: ${ramIssuesServers}`)
    } catch (error){
        logger.info(`Exception Thrown trying to print results: ${error}`)
    }
}

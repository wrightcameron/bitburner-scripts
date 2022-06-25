import { Logger } from "/lib/Logger.js"
import { getAllKnownServers } from "/lib/findAllServersDFS.js"
import { getServersWithBestRates } from "/lib/algorithem.js";

/** @param {NS} ns */
export async function main(ns) {

    let logger = new Logger(ns, true, true);

    //Command Line Arguments
    // brScheduler.js [killPrograms] [MemReserve] [ratePercent]
    let args = ns.flags([
        ['dest', null],
        ['target', null],
        ['ratePercent', 0.50],
        ['MemReserve', 0],
        ['killExisting', false],
        ['buySystems', false],
    ])

    //Information on hacking scripts, and args tp pass to the next one.
    let scriptInfo = {
        entryPoint: '/hacks/bestRateHack/brDeploy.js',
        args: [args.target, args.minMoneyPercent],
        files: ['/hacks/bestRateHack/brDeploy.js', '/hacks/bestRateHack/brHack.js']
    }

    //Data collection on server deployment pass/fail
    let metaData = {
        pidCount: 0,
        RAMIssues: { 'count': 0, 'servers': [] },
        rootIssues: { 'count': 0, 'servers': [] }
    }

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
            let numSystems = totalSystemsCouldBuy(ns, 64, ns.getServerMoneyAvailable('home'))
            logger.info(`Purchasing ${numSystems} with 64 GB of RAM.`)
            let boughtServers = buyServers(ns, numSystems, 64);
            logger.info(`Bought these systems: ${boughtServers}`)
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

        if (killExisting) {
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
        if (!target && serversOfInterest != null) {
            target = serversOfInterest[Math.floor(Math.random() * serversOfInterest.length)];
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
    try {
        const args = scriptInfo.args
        // If no target system is selected tell script to hack host
        logger.info(`starting ${scriptInfo.entryPoint} on ${host} with args ${args}`);
        let pid = await ns.exec(scriptInfo.entryPoint, host, threads, ...args);
        if (!pid) {
            logger.info(`Error starting hacks/brDeployHack/brDeploy.js script. pid: ${pid}`);
        } else {
            metaData.pidCount++;
        }
    } catch (error) {
        logger.info(`Exception: Executing script, ${error}`)
    }
}

export function makeRoom(ns, server) {
    return true
}

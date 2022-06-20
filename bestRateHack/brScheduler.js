import { getAllKnownServers } from "/lib/findAllServersDFS.js"

/** @param {NS} ns */
export async function main(ns) {
    
    ns.tprint("brScheduler.js [killPrograms] [RamSlack] [ratePercent]")

    // TODO Add this later, we don't need it right now
    // let killPrograms = (ns.args.length >= 1) ? ns.args[0] : null;
    // let RamSlack = (ns.args.length >= 2) ? ns.args[1] : dest;
    // let ratePercent = (ns.args.length >= 3) ? ns.args[2] : 0.50;

    //Get List of all Servers
    let serverList = await getAllKnownServers(ns);
    serverList = serverList.filter(e => e !== 'home'); //Remove home

    //Get List of servers' we want to target.
    let targetServers = getServersWithRates(ns, serverList);

    //Add purchased Servers to the list to deploy too
    let purchasedServers = ns.getPurchasedServers(); 
    for(let i = 0; i < purchasedServers.length; i++) {
        serverList.push(purchasedServers[i]);
    }

    // Now Start deploying the script
    let pidCount = 0;
    let ramIssueCount = 0;
    let rootIssueCount = 0;
    ns.disableLog("ALL");
    //Loop through all known servers, deciding how to deploy the script
    for(let i = 0; i < serverList.length; i++) {
        let server = serverList[i];
        let pid;
        //Before trying to execute script, check if target system has enough RAM, has root access.
        // TODO If statement assumes that scriptSurvey is larger than scriptHack, which it is but thats faith.
        if(!ns.hasRootAccess(server)) {
            ns.tprint(server + " Doesn't have root access Skipping...")
            rootIssueCount++;
            continue
        }else if( (ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) < ns.getScriptRam('/bestRateHack/brHack.js')){
            ns.tprint("Server " + server + " has insulficiant RAM Skipping...")
            ns.tprint("Max RAM: " + ns.getServerMaxRam(server))
            ns.tprint("RAM Used: " + ns.getServerUsedRam(server))
            ramIssueCount++;
            continue
        }

        //Check that current system has enough RAM to fork the deploy script.
        let checks = 0;
        const MAX_CHECKS = 5;
        
        // let expectedLoad = ns.getScriptRam('/simpleHack/simpleInstructor.js') + ns.getScriptRam('/simpleHack/simpleDeploy.js');
        let expectedLoad = ns.getScriptRam('/bestRateHack/brDeploy.js');
        do {
            //Expected load is this server plus simpleDeploy.js
            let currentFree = ns.getServerMaxRam('home') - ns.getServerUsedRam('home');
            if(currentFree >= expectedLoad ) {
                break;
            }
            ns.print("Not enough free RAM  " + currentFree + ". Need " + expectedLoad + "Sleeping for 20 seconds.")
            await ns.sleep(1000 * 20) // 20 seconds 
            checks++;
        }
        while (checks <= MAX_CHECKS);

        // If no target system is selected tell script to hack host
        let targetSystem = targetServers[i % targetServers.length]
        if (targetSystem == null){
            ns.run("/bestRateHack/brDeploy.js", 1, server, targetSystem);
        } else {
            ns.run("/bestRateHack/brDeploy.js", 1, server, targetSystem);
        }
        // Can't do anything waiting for pids yet, but can count how many were successful
        if (pid){
            ns.print("Error starting /bestRateHack/brDeploy.js script")
        } else{
            pidCount++;
        }
    }
    // if(!ignoreHome) {
    //     serverList.push('home')
    //     // TODO terminate this script and setup the deploy on this server, it will need to be pointed at a target
    // }
    ns.tprint("Of the " + serverList.length + " servers found Succuessfully deployed to " + pidCount);
    ns.tprint("NOt ROOT on " + rootIssueCount + ", Not enough Memory found on " + ramIssueCount);
}

export function getServersWithRates(ns, serverList) {
    let serversOfInterest = [];
    for (let i = 0; i < serverList.length; i++) {
        let server = serverList[i];

        let rate = getRate(ns, server);

        //TODO THis could be alot better, but for now lets jsut keep it round robin

        //Print the results out
        if (rate == 0){
            // I don't want to see the results.
            continue;
        }
        serversOfInterest.push(server)
        ns.tprint(server + ": Expected Rate " + rate.toFixed(2) + " ($/min)")
    };
    return serversOfInterest;
}

export function getRate(ns, server) {
    //Get money from hack
    let serverMoney = ns.getServerMoneyAvailable(server);
    let hackAnalyze = ns.hackAnalyze(server);
    let totalMoneyFromHack = serverMoney * hackAnalyze;
    //Chance of success
    let hackAnalyzeChance = ns.hackAnalyzeChance(server);
    // Get hack time in minutes
    let hackTime = ns.getHackTime(server) / 1000 / 60; // In minutes
    // 5000 * .5 / 10 (minutes)
    return totalMoneyFromHack * hackAnalyzeChance / hackTime;
}
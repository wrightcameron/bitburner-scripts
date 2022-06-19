import { getAllKnownServers } from "/lib/findAllServersDFS.js"

/** @param {NS} ns */
export async function main(ns) {
    
    ns.disableLog("ALL");

    // Script in charge of deploying simpleDeploy on all systems
    if(ns.args.length < 1) {
        ns.tprint("simpleInstructor.js [targetSystem] [ignoreHome] [minMoneyPercent]")
        // ns.exit()
    }

    let targetSystem = (ns.args.length >= 1) ? ns.args[0] : null;
    let ignoreHome = (ns.args.length >= 2) ? ns.args[1] : true;
    let minMoneyPercent = (ns.args.length >= 3) ? ns.args[2] : 0.75;

    let serverList = await getAllKnownServers(ns);
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
        }else if( (ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) < ns.getScriptRam('/simpleHack/simpleSurvey.js')){
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
        let expectedLoad = ns.getScriptRam('/simpleHack/simpleDeploy.js');
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
        if (targetSystem == null){
            ns.run("/simpleHack/simpleDeploy.js", 1, server, targetSystem, minMoneyPercent);
        } else {
            ns.run("/simpleHack/simpleDeploy.js", 1, server, targetSystem, minMoneyPercent);
        }
        // Can't do anything waiting for pids yet, but can count how many were successful
        if (pid){
            ns.print("Error starting /simpleHack/simpleDeploy.js script")
        } else{
            pidCount++;
        }
    }
    if(!ignoreHome) {
        serverList.push('home')
        // TODO terminate this script and setup the deploy on this server, it will need to be pointed at a target
    }
    ns.tprint("Of the " + serverList.length + " servers found Succuessfully deployed to " + pidCount);
    ns.tprint("NOt ROOT on " + rootIssueCount + ", Not enough Memory found on " + ramIssueCount);
}

import { Logger } from "/lib/Logger.js"
import { getAllKnownServers } from "/lib/findAllServersDFS.js"

/** @param {NS} ns */
export async function main(ns) {

    ns.disableLog("ALL");
    let logger = new Logger(ns, true, true);
    
    ns.tprint("findBestRate.js [target] [-s]");
    let target = (ns.args.length >= 1) ? ns.args[0] : null;
    let showDetails = (ns.args.length >= 2) ? true : false;
    
    //If target variable is passed in, only run script on that one system.
    let serverList;
    if(target) {
        serverList = [target]
    } else {
        serverList = await getAllKnownServers(ns, logger);
        serverList = serverList.filter(e => e !== 'home');
    }

    let largestProfit = 0;
    let serverWithLargestProfit = serverList[0];
    for (let i = 0; i < serverList.length; i++) {
        let server = serverList[i];

        // These steps will tell us which server has the best rate, which we care about from an instructor level.
        //Get money from hack
        let serverMoney = ns.getServerMoneyAvailable(server);
        let hackAnalyze = ns.hackAnalyze(server);
        let totalMoneyFromHack = serverMoney * hackAnalyze;
        //Chance of success
        let hackAnalyzeChance = ns.hackAnalyzeChance(server);
        // Get hack time in minutes
        let hackTime = ns.getHackTime(server) / 1000 / 60; // In minutes

        // ns.print("Profit: $"+ totalMoneyFromHack.toFixed(2) + ", Chance " + hackAnalyzeChance.toFixed(2) + ", Hack Time:" + hackTime.toFixed(2) + " (min)")
        let profit = totalMoneyFromHack * hackAnalyzeChance / hackTime;
        // ns.print("Expected Rate " + profit.toFixed(2) + " ($/min)")
        if (profit > largestProfit) {
            largestProfit = profit
            serverWithLargestProfit = server
        }

        //Print the results out
        if (totalMoneyFromHack == 0){
            // I don't want to see the results.
            continue;
        }
        ns.tprint(server + ": Expected Rate " + profit.toFixed(2) + " ($/min)")
        ns.tprint("Server Money: " + serverMoney.toFixed(2) + ", money gained from hack: " + totalMoneyFromHack.toFixed(2) + ", After "+ hackTime.toFixed(2) + " (min)")
    };
    ns.tprint(serverWithLargestProfit + ": Best Expected Rate " + largestProfit.toFixed(2).toLocaleString("en-US") + " ($/min)")
}

import { getAllKnownServers } from "/lib/findAllServersDFS.js"

/** @param {NS} ns */
export async function main(ns) {

    ns.disableLog("ALL");
    
    let serverList = await getAllKnownServers(ns);
    serverList = serverList.filter(e => e !== 'home');

    let largestProfit = 0;
    let serverWithLargestProfit = serverList[0];
    for (let i = 0; i < serverList.length; i++) {
        let server = serverList[i];

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

// Get the percantage of money in server account relative to it's max
export async function serverAccountPercent(ns, server) {
    const serverMoney = ns.getServerMoneyAvailable(server);
    const serverMaxMoney = ns.getServerMaxMoney(server);
    return serverMoney * 100 / serverMaxMoney;
}

// Get total amount of time in milliseconds till server would be weakened to mine
export async function weakenTimeToMin(ns, server, threads, cores) {
    //TODO Allow way for user to select lesser floor, like 25% from min
    let securityLevel = ns.getServerSecurityLevel(server);
    let securityMin = ns.getServerMinSecurityLevel(server);
    let securityDelta = securityLevel - securityMin;  // Find delta

    let weakenAnalyze = ns.weakenAnalyze(threads, cores);
    let weakenNums = securityDelta / weakenAnalyze; // Times weaken goes into delta
    let weakenTime = ns.getWeakenTime(server);
    return weakenNums * weakenTime;
}

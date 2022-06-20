/** @param {NS} ns */
export async function main(ns) {

    const threads = 1;
    const cores = 1;

    // TODO Change this scan to be all servers, not just these
    const serverList = ns.scan();
    if (serverList.length == 0) {
        return
    }

    while (true) {
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
            // 5000 * .5 / 10 (minutes)
            // ns.print("Profit: $"+ totalMoneyFromHack.toFixed(2) + ", Chance " + hackAnalyzeChance.toFixed(2) + ", Hack Time:" + hackTime.toFixed(2) + " (min)")
            var profit = totalMoneyFromHack * hackAnalyzeChance / hackTime;
            // ns.print("Expected Rate " + profit.toFixed(2) + " ($/min)")
            if (profit > largestProfit) {
                largestProfit = profit
                serverWithLargestProfit = server
            }
        };
        ns.print("Hacking "+ serverWithLargestProfit + ", with expected return of " + largestProfit.toFixed(2))
        await ns.hack(serverWithLargestProfit)
    }
}
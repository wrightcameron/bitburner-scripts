import { Logger } from 'lib/Logger';
import { getAllKnownServers } from 'lib/findAllServersDFS';

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    const logger = new Logger(ns, true, true);

    ns.tprint('findBestRate.js [target] [-s]');
    const target = (ns.args.length >= 1) ? ns.args[0] : null;

    // If target variable is passed in, only run script on that one system.
    let serverList;
    if (target) {
        serverList = [target];
    } else {
        serverList = await getAllKnownServers(ns, logger);
        serverList = serverList.filter((e) => e !== 'home');
    }

    let largestProfit = 0;
    let serverWithLargestProfit = serverList[0];
    for (let i = 0; i < serverList.length; i++) {
        const server = serverList[i];

        // These steps will tell us which server has the best rate,
        // which we care about from an instructor level.
        // Get money from hack
        const serverMoney = ns.getServerMoneyAvailable(server);
        const hackAnalyze = ns.hackAnalyze(server);
        const totalMoneyFromHack = serverMoney * hackAnalyze;
        // Chance of success
        const hackAnalyzeChance = ns.hackAnalyzeChance(server);
        // Get hack time in minutes
        const hackTime = ns.getHackTime(server) / 1000 / 60; // In minutes

        // ns.print("Profit: $"+ totalMoneyFromHack.toFixed(2) + ", Chance " +
        // hackAnalyzeChance.toFixed(2) + ", Hack Time:" + hackTime.toFixed(2) + " (min)")
        const profit = (totalMoneyFromHack * hackAnalyzeChance) / hackTime;
        // ns.print("Expected Rate " + profit.toFixed(2) + " ($/min)")
        if (profit > largestProfit) {
            largestProfit = profit;
            serverWithLargestProfit = server;
        }

        // Print the results out if ammount is not zero
        if (totalMoneyFromHack !== 0) {
            ns.tprint(`${server}: Expected Rate ${profit.toFixed(2)} ($/min)`);
            ns.tprint(`Server Money: ${serverMoney.toFixed(2)}, money gained from hack: ${totalMoneyFromHack.toFixed(2)}, After ${hackTime.toFixed(2)} (min)`);
        }
    }
    ns.tprint(`${serverWithLargestProfit}: Best Expected Rate ${largestProfit.toFixed(2).toLocaleString('en-US')} ($/min)`);
}

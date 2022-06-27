import { Logger } from 'lib/Logger';
import { getAllKnownServers } from 'lib/findAllServersDFS';

// Get the percantage of money in server account relative to it's max
export async function serverAccountPercent(ns, server) {
    const serverMoney = ns.getServerMoneyAvailable(server);
    const serverMaxMoney = ns.getServerMaxMoney(server);
    return (serverMoney * 100) / serverMaxMoney;
}

/** @param {NS} ns */
export async function main(ns) {
    const threads = 1;
    const cores = 1;

    const logger = new Logger(ns, true, true);

    ns.tprint('scout.js [target] [isLocal]');
    const target = (ns.args.length >= 1) ? ns.args[0] : null;
    const isLocal = (ns.args.length >= 2);

    // If target variable is passed in, only run script on that one system.
    let serverList;
    if (target) {
        serverList = [target];
    } else if (isLocal) {
        serverList = ns.scan();
    } else {
        serverList = await getAllKnownServers(ns, logger);
        serverList = serverList.filter((e) => e !== 'home');
    }

    for (let i = 0; i < serverList.length; i++) {
        ns.tprint('-----');
        const server = serverList[i];
        // Let's ignore server's that need open ports
        if (ns.getServerNumPortsRequired(server) !== 0) {
            ns.tprint(`${server} - Not 0 ports, skipping`);
        } else {
            ns.tprint(server);
            // Get current security levels
            const securityLevel = ns.getServerSecurityLevel(server);
            const securityBase = ns.getServerBaseSecurityLevel(server);
            const securityMin = ns.getServerMinSecurityLevel(server);
            // Weaken Info
            const weakenAnalyze = ns.weakenAnalyze(threads, cores);
            const weakenTime = ns.getWeakenTime(server) / 1000 / 60; // In minutes
            // Get hack information
            const hackAnalyze = ns.hackAnalyze(server);
            const hackAnalyzeChance = ns.hackAnalyzeChance(server) * 100;
            const hackAnalyzeSecurity = ns.hackAnalyzeSecurity(threads, server);
            const hackTime = ns.getHackTime(server) / 1000 / 60; // In minutes
            // Get growth information
            const growthTime = ns.getGrowTime(server) / 1000 / 60; // In minutes
            const growthParameter = ns.getServerGrowth(server);
            const growthAnalyzeSecurity = ns.growthAnalyzeSecurity(threads, server, cores);

            // Get Money
            const serverMoney = ns.getServerMoneyAvailable(server);
            const serverMaxMoney = ns.getServerMaxMoney(server);
            const totalMoneyFromHack = serverMoney * hackAnalyze;
            const accountPercent = await serverAccountPercent(ns, server);

            // Print values to terminal log
            let output = `Money: ${serverMoney.toFixed(2)}, Max Money ${serverMaxMoney.toFixed(2)}, ${accountPercent.toFixed(2)}%`;
            ns.tprint(output);
            output = `Sec Lvl: ${securityLevel.toFixed(2)} (0-100), Floor ${securityMin}, Base ${securityBase}`;
            ns.tprint(output);
            output = `Weaken Ana: ${weakenAnalyze.toFixed(2)}, Weaken Time ${weakenTime.toFixed(2)} (min)`;
            ns.tprint(output);
            output = `Hack steal: $${totalMoneyFromHack.toFixed(2)} Chance of Success ${hackAnalyzeChance.toFixed(2)}, Sec increase ${hackAnalyzeSecurity} , Hack Time ${hackTime.toFixed(2)} (min). Hack Analysis ${hackAnalyze}`;
            ns.tprint(output);
            output = `Growth time: ${growthTime.toFixed(2)} (min). Growth factor: ${growthParameter}, Sec increase ${growthAnalyzeSecurity}`;
            ns.tprint(output);
        }
    }
}

// Get total amount of time in milliseconds till server would be weakened to mine
export async function weakenTimeToMin(ns, server, threads, cores) {
    // TODO Allow way for user to select lesser floor, like 25% from min
    const securityLevel = ns.getServerSecurityLevel(server);
    const securityMin = ns.getServerMinSecurityLevel(server);
    const securityDelta = securityLevel - securityMin; // Find delta

    const weakenAnalyze = ns.weakenAnalyze(threads, cores);
    const weakenNums = securityDelta / weakenAnalyze; // Times weaken goes into delta
    const weakenTime = ns.getWeakenTime(server);
    return weakenNums * weakenTime;
}

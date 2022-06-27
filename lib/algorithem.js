/**
 * Ratio of $ per minute for server using calc "moneyFromHack * hackChance / hackTime"
 * Doesn't factor in the use of threads or RAM.
 *
 * @param {NS} ns : Netscript
 * @param {String} server Name of server
 * @returns
 */
export function getBestRate(ns, server) {
    // Get money from hack
    const serverMoney = ns.getServerMoneyAvailable(server);
    const hackAnalyze = ns.hackAnalyze(server);
    const totalMoneyFromHack = serverMoney * hackAnalyze;
    // Chance of success
    const hackAnalyzeChance = ns.hackAnalyzeChance(server);
    // Get hack time in minutes
    const hackTime = ns.getHackTime(server) / 1000 / 60; // In minutes
    // 5000 * .5 / 10 (minutes)
    return (totalMoneyFromHack * hackAnalyzeChance) / hackTime;
}

/**
 * For all servers passsed in, find all servers with $/min ratios greater than 0 and return
 * @param {NS} ns : Netscript
 * @param {List[String]} serverList List of Server string names
 * @returns
 */
export function getServersWithBestRates(ns, serverList) {
    let serversOfInterest = [];
    for (const server of serverList) {
        const rate = getBestRate(ns, server);

        // TODO THis could be alot better, but for now lets just keep it round robin

        // Print the results out
        if (rate !== 0) {
            serversOfInterest.push(server);
        }
    }
    // Order list of server ratios in acending order
    serversOfInterest.sort((a, b) => a - b);
    serversOfInterest = serversOfInterest.filter((e) => e !== 'home');
    return serversOfInterest;
}

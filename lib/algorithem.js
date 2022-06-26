/**
 * For all servers passsed in, find all servers with $/min ratios greater than 0 and return
 * @param {NS} ns : Netscript 
 * @param {List[String]} serverList List of Server string names
 * @returns 
 */
export function getServersWithBestRates(ns, serverList) {
    let serversOfInterest = [];
    for(let server of serverList){
        let rate = getBestRate(ns, server);

        //TODO THis could be alot better, but for now lets just keep it round robin

        //Print the results out
        if (rate == 0) {
            // I don't want to see the results.
            continue;
        }
        serversOfInterest.push(server)
    };
    serversOfInterest.sort((a, b) => {
        return a - b;
    }); 
    return serversOfInterest;
}

/**
 * Ratio of $ per minute for server using calc "moneyFromHack * hackChance / hackTime"
 * Doesn't factor in the use of threads or RAM.
 *  
 * @param {NS} ns : Netscript 
 * @param {String} server Name of server
 * @returns 
 */
export function getBestRate(ns, server) {
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



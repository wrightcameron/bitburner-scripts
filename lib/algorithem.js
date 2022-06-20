
export function getServersWithBestRates(ns, serverList) {
    let serversOfInterest = [];
    for (let i = 0; i < serverList.length; i++) {
        let server = serverList[i];

        let rate = getBestRate(ns, server);

        //TODO THis could be alot better, but for now lets jsut keep it round robin

        //Print the results out
        if (rate == 0){
            // I don't want to see the results.
            continue;
        }
        serversOfInterest.push(server)
    };
    return serversOfInterest;
}

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
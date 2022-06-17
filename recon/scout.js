    /** @param {NS} ns */
    export async function main(ns) {

        const serverList = ns.scan();
        const threads = 1
        const cores = 1

        for (let i = 0; i < serverList.length; i++) {
            ns.tprint("-----")
            let server = serverList[i];
            //Let's ignore server's that need open ports
            if(ns.getServerNumPortsRequired(server) != 0 ){
                ns.tprint(server + " - Not 0 ports, skipping")
                continue;
            } else {
                ns.tprint(server)
            };
            // Get current security levels
            let securityLevel = ns.getServerSecurityLevel(server);
            let securityBase = ns.getServerBaseSecurityLevel(server);
            let securityMin = ns.getServerMinSecurityLevel(server);
            // Weaken Info
            let weakenAnalyze = ns.weakenAnalyze(threads, cores)
            let weakenTime = ns.getWeakenTime(server) / 1000 / 60; // In minutes
            // Get hack information
            let hackAnalyze = ns.hackAnalyze(server);
            let hackAnalyzeChance = ns.hackAnalyzeChance(server) * 100;
            let hackAnalyzeSecurity = ns.hackAnalyzeSecurity(threads, server)
            let hackTime = ns.getHackTime(server) / 1000 / 60; // In minutes
            // Get growth information
            let growthTime =  ns.getGrowTime(server) / 1000 / 60; // In minutes
            let growthParameter = ns.getServerGrowth(server);
            let growthAnalyzeSecurity = ns.growthAnalyzeSecurity(threads, server, cores)

            // Get Money
            let serverMoney = ns.getServerMoneyAvailable(server);
            let serverMaxMoney = ns.getServerMaxMoney(server);
            let totalMoneyFromHack = serverMoney * hackAnalyze;
            let accountPercent = await serverAccountPercent(ns, server);

            //Print values to terminal log
            let output = "Money: " + serverMoney.toFixed(2) + ", Max Money " + serverMaxMoney.toFixed(2) + ", " + accountPercent.toFixed(2) + "%"
            ns.tprint(output);
            output = "Sec Lvl: " + securityLevel.toFixed(2) + " (0-100), Floor " + securityMin + ", Base " + securityBase
            ns.tprint(output);
            output = "Weaken Ana: " + weakenAnalyze.toFixed(2) + ", Weaken Time " + weakenTime.toFixed(2) + " (min)"
            ns.tprint(output);
            output = "Hack steal: $" + totalMoneyFromHack.toFixed(2) + " Chance of Success " + hackAnalyzeChance.toFixed(2) + ", Sec increase " + hackAnalyzeSecurity + " , Hack Time " + hackTime.toFixed(2) + " (min)"
            ns.tprint(output);
            output = "Growth time: " + growthTime.toFixed(2) + " (min). Growth factor: " + growthParameter + ", Sec increase " + growthAnalyzeSecurity
            ns.tprint(output);
        };
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

    
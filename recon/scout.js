    /** @param {NS} ns */
    export async function main(ns) {

        const serverList = ns.scan();

        for (let i = 0; i < serverList.length; i++) {
            ns.tprint("-----")
            let server = serverList[i];
            ns.tprint(server)
            //Let's ignore server's that need open ports
            if(ns.getServerNumPortsRequired(server) != 0 ){
                continue;
            };
            // Get current security levels
            ns.tprint("Security Level: " + ns.getServerSecurityLevel(server));
            // Get amount of moeny that would be stolen with 1 thread
            ns.tprint("Hack would steal: $" + ns.hackAnalyze(server))

            ns.tprint("Chance of Successful hack: " + ns.hackAnalyzeChance(server))

            ns.tprint("Security increase: " + ns.hackAnalyzeSecurity(1, server))

            ns.tprint("Growth would take: " + ns.getGrowTime(server) + "milliseconds")

            ns.tprint("Growth parameter " + ns.getServerGrowth(server))
        };
    }
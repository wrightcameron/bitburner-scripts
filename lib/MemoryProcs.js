/**
 * Get Free RAM on server
 * @param {NS} ns 
 * @param {String} server 
 * @returns 
 */
export function freeRam(ns, server) {
    return ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
}

/**
 * Finds script with largest RAM cost, it assumes that scripts running
 * on server are sequential (using spawn() instead of run())
 * @param {*} ns 
 * @param {*} server 
 * @param {*} scripts 
 * @returns 
 */
export function getLargestRamUsage(ns, server, scripts){
    let largetCost = 0;
    for(let script of scripts) {
        let cost = ns.getScriptRam(script, server);
        if (cost > largetCost){
            largetCost = cost
        }
    }
    return largetCost;
}

export function getScriptRam(ns, script, host, threads)
    return ns.getScriptRam(script, host) * threads;

/**
 * Finds total RAM usge from all scripts passed.  This is for finding a cost
 * of a concurrent script usage if a script is going to be run() child scripts
 * @param {*} ns 
 * @param {*} server 
 * @param {*} scripts 
 * @returns 
 */
export function getTotalRamUsage(ns, server, scripts){
    let totalCost = 0;
    for(let script of scripts) {
        let cost = ns.getScriptRam(script, server);
        totalCost = cost + totalCost;
    }
    return totalCost;
}

export function hackAnalyzeThreads(ns, server){
    return ns.hackAnalyzeThreads(server, ns.getServerMoneyAvailable(server))
}

export function hackAnalyzeMaxThreads(ns, server){
    let avgThreads = hackAnalyzeThreads(ns, server);
    return avgThreads * ns.getServerMaxMoney(server) / ns.getServerMoneyAvailable(server);
}

export function isScriptRunning(ns, server, script) {

}

export function reduceScriptMemoryUsage(ns, server, script) {

}

export function reduceScriptThreads(ns, server, script) {

}
//Find free RAM
export function freeRam(ns, server) {
    return ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
}

//Finds script with largest RAM cost, it assumes that scripts running
// on server are sequential (using spawn() instead of run())
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

//Finds total RAM usge from all scripts passed.  This is for finding a cost
//of a concurrent script usage if a script is going to be run() child scripts
export function getTotalRamUsage(ns, server, scripts){
    let totalCost = 0;
    for(let script of scripts) {
        let cost = ns.getScriptRam(script, server);
        totalCost = cost + totalCost;
    }
    return totalCost;
}

export function isScriptRunning(ns, server, script) {

}

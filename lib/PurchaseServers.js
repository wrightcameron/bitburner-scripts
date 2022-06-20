export function totalSystemsCouldBuy(ns, RamAmount, money){
    const serverCost = ns.getPurchasedServerCost(RamAmount)
    return Math.floor(money / serverCost);
}

export function buyServers(ns, numberOfServers, ram){
    let hostname
    for (let i = 0; i < numberOfServers; i++) {
        hostname = ns.purchaseServer("pserv-" + i, ram);
    }
    return hostname
}
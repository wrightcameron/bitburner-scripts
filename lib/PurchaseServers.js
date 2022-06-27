/**
 * Get total systems we could buy with current funds, found buy money divided by serverCost
 * @param {NS} Netscripts
 * @param {float} RamAmount
 * @param {float} money
 * @returns Number of systems could purchase
 */
export function totalSystemsCouldBuy(ns, RamAmount, money) {
    const serverCost = ns.getPurchasedServerCost(RamAmount);
    return Math.floor(money / serverCost);
}

/**
 * Get the largest RAM Size (for 1 server) money could buy
 * @param {NS} ns Netscript object
 * @param {float} money A human concept used for transacting goods or services
 * @returns largest RAM size
 */
export function largestRamSizeCouldBuy(ns, money) {
    const RAM_CEILING = ns.getPurchasedServerMaxRam();
    let largestRamSize = 1;
    for (let i = 1; i <= RAM_CEILING; i <<= 1) {
        const serverCost = ns.getPurchasedServerCost(i << 1);
        if (serverCost >= money) {
            largestRamSize = i;
            break;
        }
    }
    return largestRamSize;
}

/**
 * Find the most RAM that can be bought while also providing the most servers closest to 25.
 * @param {NS} ns
 * @param {*} money
 * @returns largest RAM size
 */
export function largestRamWithMostServers(ns, money) {
    const RAM_CEILING = ns.getPurchasedServerMaxRam();
    let largestRamSize = 1;
    for (let i = 1; i <= RAM_CEILING; i <<= 1) {
        if (totalSystemsCouldBuy(ns, i, money) < ns.getPurchasedServerLimit()) {
            largestRamSize = i;
            break;
        }
    }
    return largestRamSize;
}

/**
 * Buy Number of servers passed with certain ammount of RAM
 * @param {NS} ns Netscript object
 * @param {int} numberOfServers
 * @param {float} ram
 * @returns
 */
export function buyServers(ns, numberOfServers, ram) {
    const listofHosts = [];
    let hostname;
    for (let i = 0; i < numberOfServers; i++) {
        hostname = ns.purchaseServer(`pserv-${i}`, ram);
        listofHosts.push(hostname);
    }
    return listofHosts;
}

/**
 * Find number of Servers that could be purchased with Max Ram with given money
 * @param {NS} ns Netscript
 * @param {float} money Money avaliable to for buying servers
 * @returns number of systems
 */
export function findNumServersWithMaxRam(ns, money) {
    // The total ammount of servers you can buy is 25 (maybe more)
    // Find the most amount of RAM with the total ammount of money, where se purchase x amount of servers under that amount
    const maxPurchasedServers = ns.getPurchasedServerLimit();
    const RAM_CEILING = ns.getPurchasedServerMaxRam();
    let currentNumSys = 0;
    for (let i = 1; i <= RAM_CEILING; i <<= 1) {
        const numSystems = totalSystemsCouldBuy(ns, i, money);
        if (numSystems < maxPurchasedServers) {
            currentNumSys = numSystems;
        } else {
            break;
        }
    }
    return currentNumSys;
}

/**
 * Return struct containing name of server, and how much RAM it has.
 * @param {NS} ns
 * @returns list of structs, each struct containing name and ram ammount.
 */
export function getPurchasedServersWithRam(ns) {
    const serverInfo = [];
    const purchasedServers = ns.getPurchasedServers();
    for (const server of purchasedServers) {
        const serverRam = ns.getServerMaxRam(server);
        serverInfo.push({ name: server, ram: serverRam });
    }
    serverInfo.sort((a, b) => a.ram - b.ram);
    return serverInfo;
}

/**
 *  Of purchased servers, what is the maxinum amount of RAM
 * @param {NS} ns
 * @returns maximum RAM of one server
 */
export function getPurchasedServersMaxRam(ns) {
    let maxRam = 0;
    const serverList = ns.getPurchasedServers();
    for (const server of serverList) {
        const serverRam = ns.getServerMaxRam(server);
        if (serverRam > maxRam) {
            maxRam = serverRam;
        }
    }
    return maxRam;
}

/**
 * Of purchased servers, what is the mininum amount of RAM
 * @param {*} ns
 * @returns mininum RAM of one server
 */
export function getPurchasedServersMinRam(ns) {
    let minRam = getPurchasedServerMaxRam();
    const serverList = getPurchasedServers();
    for (const server of serverList) {
        serverRam = ns.getServerMaxRam(server);
        if (serverRam < minRam) {
            minRam = serverRam;
        }
    }
    return minRam;
}

/**
 * Of the current purchased servers, find which ones are best to remove
 * @param {NS} ns
 * @param {float} money
 * @param {int} maxRam
 * @returns
 */
export function getBestServersToReplace(ns, maxRam, money) {
    const currentMaxRam = getPurchasedServersMaxRam(ns);
    if (currentMaxRam >= maxRam) {
        return []; // There are no best servers to replace
    }
    const numBestServers = totalSystemsCouldBuy(ns, maxRam, money);
    const purchasedServers = getPurchasedServersWithRam(ns);
    const openSlots = ns.getPurchasedServerLimit() - purchasedServers.length;
    if (openSlots >= numBestServers) {
        return []; // Still open servers slots
    }
    const toRemove = numBestServers - openSlots;
    const replaceServers = [];
    for (const server of purchasedServers) {
        ns.print(`Server to delete. name: ${server.name}, RAM: ${server.ram}`);
        replaceServers.push(server.name);
        if (replaceServers.length >= toRemove) {
            break;
        }
    }
    return replaceServers;
    // Depending on how much money we have, find the most amount of ram we can buy, if the number of servers is reached
    // find the servers with the least amount of ram that we can delete and replace with the new servers
}

/**
 * Function to handle finding servers to remove, and buying new ones
 * @param {NS} ns Netscript object
 * @param {float} money
 */
export function handleBuyServers(ns, money) {
    const maxRam = largestRamWithMostServers(ns, money);
    const numServers = totalSystemsCouldBuy(ns, maxRam, money);
    const delServers = getBestServersToReplace(ns, maxRam, money);
    // Remove Servers
    for (const server of delServers) {
        ns.killall(server, true);
        ns.deleteServer(server);
    }
    // Buy new servers
    if (ns.getPurchasedServerLimit() - ns.getPurchasedServers().length > 0) {
        buyServers(ns, numServers, maxRam);
    }
}

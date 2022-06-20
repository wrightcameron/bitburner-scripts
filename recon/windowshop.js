import { Logger } from "/lib/Logger.js"
import { cliArgDict, checkForArg } from "/lib/cliArgs";

/** @param {NS} ns */
export async function main(ns) {
    // For getting infromation on purchasable computers
    //logger.info("windowshop.js <desiredRAM>")
    let argDict = cliArgDict(ns.args);
    let RamAmount = checkForArg(argDict, 'ram', 16)

    let logger = new Logger(ns, true, true);
    
    const savings = ns.getServerMoneyAvailable('home')
    const serverCost = ns.getPurchasedServerCost(RamAmount)
    const total = Math.floor(savings / serverCost);

    logger.info(`Allowed to buy ${ns.getPurchasedServerLimit()} servers, currently own ${ns.getPurchasedServers().length}`)
    logger.info(`These server's can have max ${ns.getPurchasedServerMaxRam()} RAM`)
    logger.info(`Buying a server with ${RamAmount} GB, would cost $ ${serverCost}`)
    logger.info(`Total savings $ ${savings.toFixed(2)}`)

    logger.info("Could buy " + total.toFixed(2))

}

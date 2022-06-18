/** @param {NS} ns */
export async function main(ns) {
    // For getting infromation on purchasable computers
    if(ns.args.length < 1) {
        ns.print("windowshop.js <desiredRAM>")
        return //TODO Should exit instead.  There is ns function
    } 
    const ramCount = ns.args[0];
    const savings = ns.getServerMoneyAvailable('home')
    const serverCost = ns.getPurchasedServerCost(ramCount)
    const total = Math.floor(savings / serverCost);

    ns.tprint("Allowed to buy " + ns.getPurchasedServerLimit() + " servers")
    ns.tprint("These server's can have max " + ns.getPurchasedServerMaxRam() + " RAM")
    ns.tprint("Buying a server with " + ramCount + " GB, would cost $" + serverCost)
    ns.tprint("Total savings $" + savings.toFixed(2))

    ns.print("Could buy " + total.toFixed(2))

}

/** @param {NS} ns */
export async function main(ns) {
    // For getting infromation on purchasable computers
    if (ns.args.length < 1) {
        ns.print("purchaseServers.js <RAM>")
        return //TODO Should exit instead.  There is ns function
    }
    // How much RAM each purchased server will have. In this case, it'll
    // be 8GB.
    let ram = ns.args[0];

    const ramCount = ns.args[0];
    const savings = ns.getServerMoneyAvailable('home')
    const serverCost = ns.getPurchasedServerCost(ramCount)
    const total = Math.floor(savings / serverCost);

    ns.print("Buying " + total + " servers")
    for (let i = 0; i < total; i++) {
        //  1. Purchase the server
        //  2. Copy our hacking script onto the newly-purchased server
        //  3. Run our hacking script on the newly-purchased server with 3 threads
        //  4. Increment our iterator to indicate that we've bought a new server
        var hostname = ns.purchaseServer("pserv-" + i, ram);
        const files = ['/simpleHack/simpleDeploy.js', '/simpleHack/simpleHack.js', '/simpleHack/simpleSurvey.js']
        await ns.scp(files, hostname);
        ns.exec("/simpleHack/simpleDeploy.js", hostname, 1, 'n00dles');
    }
}

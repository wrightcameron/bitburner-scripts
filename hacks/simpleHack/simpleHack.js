/** @param {NS} ns */
export async function main(ns) {
    if (ns.args.length < 1) {
        ns.print('simpleHack.js <targetSystem> <moneyThreshold> <securityThresh> [delay]');
        return;
    }
    const target = ns.args[0];
    const moneyThresh = ns.args[1];
    const securityThresh = ns.args[2];
    const delay = ns.args[3];

    // Infinite loop that continously hacks/grows/weakens the target server
    while (true) {
        await ns.sleep(delay);
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            // If the server's security level is above our threshold, weaken it
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            // If the server's money is less than our threshold, grow it
            await ns.grow(target);
        } else {
            // Otherwise, hack it
            await ns.hack(target);
        }
    }
}

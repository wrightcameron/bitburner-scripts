/** @param {NS} ns */
export async function main(ns) {
    let target;
    const server = ns.getHostname();
    if (ns.args.length < 1) {
        ns.print('simpleSurvey.js [tagetSystem] [minMoneyPercent]');
        target = server;
    } else {
        target = ns.args[0];
    }

    const minMoneyPercent = (ns.args.length >= 2) ? ns.args[1] : 0.75;

    // Defines how much money a server should have before we hack it
    // In this case, it is set to 75% of the server's max money
    const moneyThresh = ns.getServerMaxMoney(target) * minMoneyPercent;

    // Defines the maximum security level the target server can
    // have. If the target's security level is higher than this,
    // we'll weaken it before doing anything else
    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

    // Execute and replace this script with simpleHack.js
    const threads = Math.floor(ns.getServerMaxRam(server) / ns.getScriptRam('/hacks/simpleHack/simpleHack.js', server));
    ns.spawn('/hacks/simpleHack/simpleHack.js', threads, target, moneyThresh, securityThresh);
}

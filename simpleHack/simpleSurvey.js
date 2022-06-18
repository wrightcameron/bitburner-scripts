/** @param {NS} ns */
export async function main(ns) {

    let target;
    let server = ns.getHostname();
    if(ns.args.length < 1) {
        ns.print("simpleSurvey.js [tagetSystem]")
        target = server;
    }else {
        target = ns.args[0]
    }

    // Defines how much money a server should have before we hack it
    // In this case, it is set to 75% of the server's max money
    const moneyThresh = ns.getServerMaxMoney(target) * 0.75;

    // Defines the maximum security level the target server can
    // have. If the target's security level is higher than this,
    // we'll weaken it before doing anything else
    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

    //Execute and replace this script with simpleHack.js
    const threads = Math.floor(ns.getServerMaxRam(server) / ns.getScriptRam('/simpleHack/simpleHack.js', server))
    ns.spawn('/simpleHack/simpleHack.js', threads, target, moneyThresh, securityThresh);
}
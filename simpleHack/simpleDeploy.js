/** @param {NS} ns */
export async function main(ns) {
    
    if(ns.args.length < 1) {
        ns.tprint("simpleDeployer.js <DesServer> [targetServer]")
        ns.exit()
    }
    // Job of this script is to deploy the simpleHack onto target computer and execute it.
    const dest = ns.args[0];
    let target;
    if (ns.args.length == 2) {
        target = ns.args[1];
    } else {
        target = dest;
    }
    
    if (ns.isRunning('simpleHack.js', dest) || ns.isRunning('simpleSurvey.js', dest)) {
        ns.tprint("simpleHack already running on server no need to deploy again.");
        ns.exit();
    }

    const files = ['/simpleHack/simpleHack.js', '/simpleHack/simpleSurvey.js'];
    await ns.scp(files, dest);

    ns.exec('/simpleHack/simpleSurvey.js', dest, 1, target);

}
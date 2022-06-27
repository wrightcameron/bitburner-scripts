/** @param {NS} ns */
export async function main(ns) {
    ns.tprint('brDeploy.js <DesServer> [targetServer] [ratePercent]');

    const dest = (ns.args.length >= 1) ? ns.args[0] : ns.getHostname();
    const target = (ns.args.length >= 2) ? ns.args[1] : dest;
    const ratePrecent = (ns.args.length >= 3) ? ns.args[2] : 0.50;

    // Check if script is already deployed
    if (ns.isRunning('brHack.js', dest)) {
        ns.print('brHack.js already running on server no need to deploy again.');
        ns.exit();
    }

    // Copy script over to server
    const files = ['/bestRateHack/brHack.js'];
    await ns.scp(files, dest);

    // Execute the Script on server
    // TODO What if something else is running on this server?
    // Need smarter code for finding if there is enough ram.
    const threads = Math.floor(ns.getServerMaxRam(dest) / ns.getScriptRam('/bestRateHack/brHack.js', dest));
    if (threads < 1) {
        ns.print(`${dest} RAM ${ns.getServerMaxRam(dest)} not enough for ${ns.getScriptRam('/bestRateHack/brHack.js', dest)}`);
    } else if (dest === ns.getHostname()) {
        ns.spawn('/bestRateHack/brHack.js', threads, target, ratePrecent);
    } else {
        ns.exec('/bestRateHack/brHack.js', dest, threads, target, ratePrecent);
    }
}

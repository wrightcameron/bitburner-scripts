/** @param {NS} ns */
export async function main(ns) {
    // Purpose of file is to prepare server for hacking,
    // so only needs to be run once otherwise existing
    // functions eat RAM usage

    // If this server gets above 4 GB it may need to be expanded upon.
    let target;
    if (ns.args.length < 1) {
        ns.tprint('breach.js <tagetSystem>');
        ns.exit();
    } else {
        target = ns.args[0];
    }

    // If we have the BruteSSH.exe program, use it to open the SSH Port
    // on the target server
    if (ns.fileExists('BruteSSH.exe', 'home')) {
        ns.brutessh(target);
    }

    // Get root access to target server
    // TODO Check if there is a method to check if the server has already been nuked
    ns.nuke(target);

    // Deploy
}

export async function main(ns) {
    if (ns.getHostname() !== "home") {
        throw new Exception("Run the script from home");
    }

    let args = ns.flags([['branch', 'master']])

    await ns.wget(
        `https://raw.githubusercontent.com/wrightcameron/bitburner-scripts/${args.branch}/downloadScripts.js?ts=${new Date().getTime()}`,
        "downloadScripts.js"
    );
    ns.spawn("downloadScripts.js", 1, '--branch', args.branch);
}
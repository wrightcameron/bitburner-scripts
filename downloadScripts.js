const filesToDownload = [
    '/breach/breach.js',
    '/breach/breachDFS.js',
    '/hacks/bestRateHack/brDeploy.js',
    '/hacks/bestRateHack/brHack.js',
    '/hacks/bestRateHack/brScheduler.js',
    '/hacks/bestRateHack/greedyNetworkHack.js',
    '/hacks/simpleHack/simpleHack.js',
    '/hacks/simpleHack/simpleScheduler.js',
    '/hacks/simpleHack/simpleSurvey.js',
    '/hacks/genericHack.js',
    '/lib/algorithem.js',
    '/lib/cliArgs.js',
    '/lib/findAllServersDFS.js',
    '/lib/Logger.js',
    '/lib/MemoryProcs.js',
    '/lib/PurchaseServers.js',
    '/recon/findBestRate.js',
    '/recon/getCodeContracts.js',
    '/recon/scout.js',
    '/recon/windowshop.js',
    'purchaseServer.js',
]


/**
 * @param {NS} ns
 **/
export async function main(ns) {
    ns.disableLog("sleep")
    //Command Line args
    const args = ns.flags([['branch', 'master'],
    ['local', false]
    ]);

    let baseUrl;
    if (!args.local) {
        baseUrl = `https://raw.githubusercontent.com/wrightcameron/bitburner-scripts/${args.branch}`
    } else {
        baseUrl = 'http://localhost:8080'
    }

    for (let filename of filesToDownload) {
        ns.scriptKill(filename, 'home')
        ns.rm(filename)
        //ns.tprint(`Killed and deleted old script ${filename}`)
        await download(ns, filename, baseUrl, args.local)
    }

    ns.tprint("Finished downloading scripts.")
    // ns.tprint(`Starting startup/run.js`)
    // ns.spawn('/startup/run.js', 1)
}

export async function download(ns, filename, baseUrl, local) {
    try{
        const fileUrl = filename.includes("/") ? filename : "/" + filename;
        const path = baseUrl + fileUrl
        ns.tprint(`Trying to download ${path}`)
        if (!local) {
            await ns.wget(path + '?ts=' + new Date().getTime(), filename)
        } else {
            await ns.wget(path, filename)
        }
    }catch(error){
        ns.tprint(`Exception: Error downloading ${filename} from url: ${baseUrl}. Error: ${error}`)
    }
}
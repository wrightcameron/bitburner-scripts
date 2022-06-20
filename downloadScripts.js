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
    '/libfindAllServersDFS.js',
    '/lib/Logger.js',
    '/lib/MemoryProcs.js',
    '/lib/PurchaseServers.js',
    '/recon/findBestRate.js',
    '/recon/harvestFiles.js',
    '/recon/scout.js',
    '/recon/windowshop.js',
    'purchaseServer.js',
  ]
  const baseUrl = 'https://raw.githubusercontent.com/wrightcameron/bitburner-scripts/'
  
  
  /**
   * @param {NS} ns
   **/
  export async function main(ns) {
    ns.disableLog("sleep")
    const args = ns.flags([['branch', 'main']])
  
    for ( let filename of filesToDownload ) {
      ns.scriptKill(filename, 'home')
      ns.rm(filename)
      await ns.sleep(50)
      await download(ns, filename, args.branch)
    }
    await ns.sleep(50)
    ns.tprint('Killed and deleted old scripts.')
    await ns.sleep(50)
    ns.tprint(`Files downloaded.`)
  
    // await ns.sleep(50)
    // ns.tprint(`Starting startup/run.js`)
    // ns.spawn('/startup/run.js', 1)
  }
  
  export async function download(ns, filename, branch) {
    const fileUrl = filename.includes("/") ? filename : "/" + filename;
    const path = baseUrl + branch + fileUrl
    ns.tprint(`Trying to download ${path}`)
    await ns.wget(path + '?ts=' + new Date().getTime(), filename)
  }
import { Logger } from "/lib/Logger.js"
import { getAllKnownServers } from "/lib/findAllServersDFS.js"

/** @param {NS} ns */
export async function main(ns) {
    let logger = new Logger(ns, true, false);
    
    let args = ns.flags([
        ['dest', null],
    ])

   if (!args.dest){
    logger.info(`Need destination to run...`)
   }

    
    //Get List of all known servers
    let serverList = await getAllKnownServers(ns, logger);
    serverList = serverList.filter(e => e !== 'home');

    let fileCount = 0;
    //Check if there are any files on this server (that arn't js files)
    for(let server of serverList){
        let files = ns.ls(server);
        //Code contracts
        files = files.filter(e => !e.includes('.js'));
        if(files.length > 0 ){
            fileCount = files.length + fileCount;
            ns.tprint(`${server} has ${files.length} file(s) [${files}]`)
        }
    }
    ns.tprint(`Total files found ${fileCount}`)
}

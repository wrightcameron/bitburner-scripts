import { Logger } from "/lib/Logger.js"
import { getAllKnownServers } from "/lib/findAllServersDFS.js"

/** @param {NS} ns */
export async function main(ns) {

    let logger = new Logger(ns, true, false);

    //Get List of all known servers
    let serverList = await getAllKnownServers(ns, logger);
    serverList = serverList.filter(e => e !== 'home');

    let codeCount = 0;
    //Check if there are any files on this server (that arn't js files)
    for(let server of serverList){
        let files = ns.ls(server);
        //Code contracts
        files = files.filter(e => e.includes('.cct'));
        if(files.length > 0 ){
            codeCount = files.length + codeCount;
            ns.tprint(`${server} has ${files}`)
        }
    }
    ns.tprint(`Code Contracts found ${codeCount}`)
}

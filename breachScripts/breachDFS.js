/** @param {NS} ns */
export async function main(ns) {

    async function getServers(host) {
        // Get list of all servers
        let serverList = ns.scan(host);
        if (serverList.length == 0) {
            ns.tprint("No Servers found from scan.")
            return
        }
    
        // Remove home from serverList
        serverList = serverList.filter(e => e !== 'home');
        // Get list of personal servers, remove those from serverlist
        let purchasedServers = ns.getPurchasedServers();
        for (let i = 0; i < purchasedServers.length; i++) {
            serverList = serverList.filter(e => e !== purchasedServers[i]);
        }
        return serverList;
    }

    let serverList = await getServers('home');
    let stack = new Stack();
    let seenServers = ['home']

    for (let i = 0; i < serverList.length; i++) {
        stack.push(serverList[i]);
    }
    ns.tprint("Starting Stack " + stack.printStack())
    while(!stack.isEmpty()) {
        let server = stack.pop();
        ns.tprint("Breaching server " + server)
        // If we have the BruteSSH.exe program, use it to open the SSH Port
        // on the target server
        if(!ns.hasRootAccess(server)) {
            if (ns.fileExists("BruteSSH.exe", "home")) {
                ns.brutessh(server);
            }
    
            if (ns.fileExists("FTPCrack.exe", "home")) {
                ns.ftpcrack(server);
            }

            try {
                ns.nuke(server);  
              } catch (error) {
                console.error(error);
                ns.tprint("Not enough open ports on server " + server)
              }
        }
        let newServerList = await getServers(server);
        ns.tprint("Scanned servers around  " + server + ": " + newServerList)
        for (let j = 0; j < newServerList.length; j++) {
            if(!seenServers.includes(newServerList[j])){
                stack.push(newServerList[j]);
                seenServers.push(newServerList[j]);
            }
        }
        ns.tprint("Current Stack " + stack.printStack())
    }
}

// Stack class
class Stack {
    // Array is used to implement stack
    constructor() {
        this.items = [];
    }

    push(element) {
        // push element into the items
        this.items.push(element);
    }

    pop() {
        // return top most element in the stack
        // and removes it from the stack
        // Underflow if stack is empty
        if (this.items.length == 0)
            return "Underflow";
        return this.items.pop();
    }

    peek() {
        // return the top most element from the stack
        // but does'nt delete it.
        return this.items[this.items.length - 1];
    }

    isEmpty() {
        // return true if stack is empty
        return this.items.length === 0;
    }

    printStack() {
        let str = "";
        for (let i = 0; i < this.items.length; i++)
            str += this.items[i] + " ";
        return str;
    }
}
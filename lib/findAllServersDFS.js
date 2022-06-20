/** @param {NS} ns **/
export async function getAllKnownServers(ns, logger) {
    let serverList = await getServers(ns, 'home');
    let stack = new Stack();
    let seenServers = ['home']
    //Push all servers scanned near home and put them on the stack
    for (let i = 0; i < serverList.length; i++) {
        stack.push(serverList[i]);
    }
    logger.debug(`Stack with starting servers scanned from home: ${stack.printStack}`)
    while (!stack.isEmpty()) {
        let server = stack.pop();
        //Get new servers (nodes)
        let newServerList = await getServers(ns, server);
        for (let j = 0; j < newServerList.length; j++) {
            // Check if nodes have already been seen
            if (!seenServers.includes(newServerList[j])) {
                stack.push(newServerList[j]);
                seenServers.push(newServerList[j]);
            }
        }
    }
    return seenServers;
}

//Get all servers, but ignore home
export async function getServers(ns, host) {
    // Get list of all servers
    let serverList = ns.scan(host);
    if (serverList.length == 0) {
        return
    }

    // Remove home from serverList
    serverList = serverList.filter(e => e !== 'home');
    return serverList;
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

/**
 * Logger class, wraps the ns.print and ns.tprint functions
 */
export class Logger {
    /**
     * Logger constructor
     * @param {NS} ns Netscript object
     * @param {boolean} toTerminal Print logs to terminal, or print them to logs
     * @param {boolean} verbose debug method will log messages
     */
    constructor(ns, toTerminal, verbose) {
        this.ns = ns;
        this.setToTerminal(toTerminal);
        this.setVerbose(verbose);
        
    }

    /**
     * Info statements
     * @param {String} msg
     */
    info(msg) {
        if(this.toTerminal){
            this.ns.tprint(msg);
        }else{
            this.ns.print(msg);
        }
    }

    /**
     * Debug statements
     * @param {String} msg 
     */
    debug(msg){
        if(this.verbose){
            if(this.toTerminal){
                this.ns.tprint(msg);
            }else{
                this.ns.print(msg);
            }
        }
    }

    /**
     * toTerminal setter
     * @param {boolean} boolean 
     */
    setToTerminal(boolean){
        this.toTerminal = boolean;
    }

    /**
     * Verbose setter
     * @param {boolean} boolean 
     */
    setVerbose(boolean){
        this.verbose = boolean;
        if(this.verbose){
            this.ns.enableLog("ALL")
        } else {
            this.ns.disableLog("ALL")
        }
    }
}

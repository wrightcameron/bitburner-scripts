export class Logger {
    // Array is used to implement stack
    constructor(ns, toTerminal, verbose) {
        this.ns = ns;
        this.setToTerminal(toTerminal);
        this.setVerbose(verbose);
        
    }

    info(msg) {
        if(this.toTerminal){
            this.ns.tprint(msg);
        }else{
            this.ns.print(msg);
        }
    }

    debug(msg){
        if(this.verbose){
            if(this.toTerminal){
                this.ns.tprint(msg);
            }else{
                this.ns.print(msg);
            }
        }
    }

    setToTerminal(boolean){
        this.toTerminal = boolean;
    }

    setVerbose(boolean){
        this.verbose = boolean;
        if(this.verbose){
            this.ns.enableLog("ALL")
        } else {
            this.ns.disableLog("ALL")
        }
    }
}

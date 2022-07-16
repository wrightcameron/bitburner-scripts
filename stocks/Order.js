class MarketOrder {
    constructor(ns, stock, shares, logger) {
        this.ns = ns; // Netscript object
        this.stock = stock; // Stock passed to the order
        this.shares = shares; //
        this.logger = logger;

        this.position = buyOrder();

        this.expRetLossToSell = -0.4; // As a percent, the amount of change between the initial
        this.COMMISSION = 100000;
        this.isSold = false;
    }

    checkOrder() {
        let profit = 0;
        const pChange = this.pChange(this.stock.getSymbol(), this.stock.getInitExpRet(), this.stock.expRet());
        if (pChange <= this.expRetLossToSell) {
            profit = sellOrder();
        } else if (this.stock.expRet() <= 0) {
            profit = sellOrder();
        } else {
            this.logger.debug(`pChange ${pChange} greater than ${this.expRetLossToSell}`);
            this.logger.debug(`Or ${this.stock.expRet()} is less than 0.`);
        }
        this.isSold = true;
        return profit;
    }

    pChange(sym, oldNum, newNum) {
        const diff = Math.abs(newNum - oldNum);
        const pdiff = diff / oldNum;
        this.logger.debug(`${sym}: oldNum: ${oldNum} -> newNum: ${newNum} | pdiff: ${pdiff * 100}`);
        return pdiff;
    }

    sellOrder() {
        const shares = this.stock.shares();
        const sellPrice = this.stock.sell(this.stock.shares());
        this.logger.info(`Sold ${this.stock.getSymbol()} for ${shares * sellPrice}`);
        return shares * sellPrice;
    }

    buyOrder() {
        const boughtPrice = this.stock.buy(numShares);
        this.logger.info(`Bought ${this.stock.getSymbol()} for ${shares * boughtPrice}`);
        return boughtPrice; // This is more of the position then what is passed in.
    }

    getShares() {
        return this.shares;
    }

    getPosition() {
        return this.position;
    }

    toString() {
        let output = `--- ${this.this.stock.getSymbol()}: Market Order ---\n`;
        output += `Shares: ${this.getShares()}, buy price: $${this.getPosition()} => total bought $${this.getShares() * this.getPosition()}`;
        output += `Current price$ ${this.this.stock.getAvgPrice()}, total gains/losse is $${this.this.stock.getAvgPrice() * this.getShares()}`;
        output += `Check Order ${this.checkOrder()}`;
        return output;
    }
}

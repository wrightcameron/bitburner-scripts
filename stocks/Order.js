class MarketOrder {
    constructor(ns, stock, shares) {
        this.ns = ns;  // Netscript object
        this.stock = stock; // Stock passed to the order
        this.shares = shares; // 
        this.position = position;
        this.logger = logger;

        thos.position = buyOrder();

        this.expRetLossToSell = -0.4; // As a percent, the amount of change between the initial
        this.COMMISSION = 100000;
        this.isSold = false;
    }

    checkOrder() {
        let profit = 0;
        const pChange = this.pChange(stock.getSymbol(), stock.getInitExpRet(), stock.expRet());
        if (pChange <= this.expRetLossToSell) {
            profit = sellOrder();
        } else if (stock.expRet() <= 0) {
            profit =  sellOrder();
        } else {
            this.logger.debug(`pChange ${pChange} greater than ${this.expRetLossToSell}`);
            this.logger.debug(`Or ${stock.expRet()} is less than 0.`);
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
        const shares = stock.shares();
        const sellPrice = stock.sell(stock.shares());
        this.logger.info(`Sold ${stock.getSymbol()} for ${shares * sellPrice}`);
        return shares * sellPrice;
    }

    buyOrder() {
        const boughtPrice = stock.buy(numShares);
        this.logger.info(`Bought ${stock.getSymbol()} for ${shares * boughtPrice}`);
        return boughtPrice   // This is more of the position then what is passed in.
    }

    getShares() {
        return this.shares
    }

    getPosition() {
        return this.position
    }

    toString() {
        let output = `--- ${this.stock.getSymbol()}: Market Order ---\n`;
        output += `Shares: ${this.getShares()}, buy price: $${this.getPosition()} => total bought $${this.getShares() * this.getPosition()}`
        output += `Current price$ ${this.stock.getAvgPrice()}, total gains/losse is $${this.stock.getAvgPrice() * this.getShares()}`
        output += `Check Order ${this.checkOrder()}`
        return output;
    }
}
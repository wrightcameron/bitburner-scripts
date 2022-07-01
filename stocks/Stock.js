export class Stock {
    constructor(ns, symbol) {
        this.ns = ns;
        this.symbol = symbol;

        this.previousPrice = null;
        this.pricePeak = null;
        this.priceTrough = null;

        this.orderArray = [];
        // TODO This should be moved to order object
        this.setInitExpRet();
    }

    getSymbol() {
        return this.symbol;
    }

    /**
     * Buy number of shares of stock, but if shares are more than max shares avaliable,
     * will buy the max allowed shares instead
     * @param {int} shares
     * @returns The stock price at which each share was purchased,
     *          otherwise 0 if the shares weren't purchased.
     */
    buy(shares) {
        const s = this.getMaxShares() < shares ? this.getMaxShares() : shares;
        return this.ns.stock.buy(this.symbol, s);
    }

    /**
     * Sell number of shares of stock.
     * @param {int} shares
     * @returns The stock price at which each share was
     *          sold, otherwise 0 if the shares weren't sold.
     */
    sell(shares) {
        return this.ns.stock.sell(this.symbol, shares);
    }

    short(shares) {
        return this.ns.stock.short(shares);
    }

    sellShort(shares) {
        return this.ns.stock.sellShort(shares);
    }

    getAskPrice() {
        // this.setHistoricPrice();
        return this.ns.stock.getAskPrice(this.symbol);
    }

    getBidPrice() {
        // this.setHistoricPrice();
        return this.ns.stock.getBidPrice(this.symbol);
    }

    getAvgPrice() {
        return (this.getAskPrice() + this.getBidPrice()) / 2;
    }

    getForecast() {
        return this.ns.stock.getForecast(this.symbol);
    }

    getVolatility() {
        return this.ns.stock.getVolatility(this.symbol);
    }

    getMaxShares() {
        return this.ns.stock.getMaxShares(this.symbol);
    }

    getPosition() {
        return this.ns.stock.getPosition(this.symbol);
    }

    shares() {
        return this.getPosition()[0];
    }

    avgPx() {
        return this.getPosition()[1];
    }

    shareShorts() {
        return this.getPosition()[2];
    }

    avgPxShort() {
        return this.getPosition()[3];
    }

    getPurchaseCost(shares, posType) {
        return this.ns.stock.getPurchaseCost(this.symbol, shares, posType);
    }

    getSaleGain(shares, posType) {
        return this.ns.stock.getSaleGain(this.symbol, shares, posType);
    }

    probability() {
        // TODO Don't know how this gets us a probility, review this
        return 2 * (this.getForecast() - 0.5);
    }

    expRet() {
        // this.ns.tprint(this.getVolatility())
        // this.ns.tprint(this.probability())
        return (this.getVolatility() * this.probability()) / 2;
    }

    getInitExpRet() {
        return this.initExpRet;
        // TODO This is related to order, so it should be moved to the future orders class
    }

    setInitExpRet() {
        // this.initExpRet = this.shares() > 0 ? this.expRet() : null;
        this.initExpRet = this.expRet();
    }

    setHistoricPrice(price) {
        if (this.previousPrice === null) {
            this.previousPrice = price;
            this.priceTrough = price;
            this.pricePeak = price;
        } else if (price > this.previousPrice) {
            this.previousPrice = price;
            this.pricePeak = price;
        } else if (price < this.previousPrice) {
            this.previousPrice = price;
            this.priceTrough = price;
        } else {
            this.previousPrice = price;
        }
    }

    toString() {
        let output = `--- ${this.symbol} ---\n`;
        output += `Ask Price: ${this.getAskPrice().toFixed(2)}, Bid Price ${this.getBidPrice().toFixed(2)}, AvgPrice ${this.getAvgPrice().toFixed(2)}\n`;
        output += `Forcast: ${this.getForecast().toFixed(2) * 100}%, with volatility: ${this.getVolatility().toFixed(2) * 100}%`;
        if (this.shares() !== 0) {
            output += `My shares ${this.shares()}, avg price ${this.avgPx()}.  Out of all shares ${this.getMaxShares()}`;
        }
        if (this.shareShorts() !== 0) {
            output += `My shorts ${this.shareShorts()}, avg price ${this.avgPxShort()}.  Out of all shares ${this.getMaxShares()}`;
        }
        return output;
    }
}

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

    //Netscript wrapper methods

    /**
     * Get symbol of stock
     * @returns symbol
     */
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

    /**
     * Buy shorts
     * @param {*} shares 
     * @returns 
     */
    short(shares) {
        return this.ns.stock.short(shares);
    }

    /**
     * Sell stock shorts
     * @param {*} shares 
     * @returns 
     */
    sellShort(shares) {
        return this.ns.stock.sellShort(shares);
    }

    /**
     * Get stock asking price. Minimum price that a seller is willing to receive for a stock on the stock market
     * @returns 
     */
    getAskPrice() {
        // this.setHistoricPrice();
        return this.ns.stock.getAskPrice(this.symbol);
    }

    /**
     * Stock bid price.  Maximum price at which someone will buy a stock on the stock market.
     * @returns 
     */
    getBidPrice() {
        // this.setHistoricPrice();
        return this.ns.stock.getBidPrice(this.symbol);
    }

    /**
     * Get average price. The difference between the bid and ask price is known as the spread. A stock’s “price” will be the average of the bid and ask price.
     * @returns 
     */
    getAvgPrice() {
        return (this.getAskPrice() + this.getBidPrice()) / 2;
    }

    /**
     * Probability that the specified stock’s price will increase (as opposed to decrease) during the next tick.
     * @returns 
     */
    getForecast() {
        return this.ns.stock.getForecast(this.symbol);
    }

    /**
     * Returns the volatility of the specified stock.
     * @returns 
     */
    getVolatility() {
        return this.ns.stock.getVolatility(this.symbol);
    }

    /**
     * Returns the maximum number of shares of a stock.
     * @returns 
     */
    getMaxShares() {
        return this.ns.stock.getMaxShares(this.symbol);
    }

    /**
     * Returns the player’s position in a stock.
     * @returns 
     */
    getPosition() {
        return this.ns.stock.getPosition(this.symbol);
    }

    /**
     * Number of shares the player owns of the stock in the Long position
     * @returns 
     */
    shares() {
        return this.getPosition()[0];
    }

    /**
     * Average price of the player’s shares in the Long position.
     * @returns 
     */
    avgPx() {
        return this.getPosition()[1];
    }

    /**
     * Number of shares the player owns of the stock in the Short position.
     * @returns 
     */
    shareShorts() {
        return this.getPosition()[2];
    }

    /**
     * Average price of the player’s Short position.
     * @returns 
     */
    avgPxShort() {
        return this.getPosition()[3];
    }

    /**
     * Calculates cost of buying stocks.
     * @param {*} shares 
     * @param {*} posType 
     * @returns 
     */
    getPurchaseCost(shares, posType) {
        return this.ns.stock.getPurchaseCost(this.symbol, shares, posType);
    }

    /**
     * Gain from selling a given number of shares of a stock.
     * @param {*} shares 
     * @param {*} posType 
     * @returns 
     */
    getSaleGain(shares, posType) {
        return this.ns.stock.getSaleGain(this.symbol, shares, posType);
    }

    // Statistical methods

    /**
     * Get probability of stock
     * @returns 
     */
    probability() {
        // TODO Don't know how this gets us a probility, review this
        return 2 * (this.getForecast() - 0.5);
    }

    /**
     * Get expected return
     * @returns extpected return
     */
    expRet() {
        // this.ns.tprint(this.getVolatility())
        // this.ns.tprint(this.probability())
        return (this.getVolatility() * this.probability()) / 2;
    }

    /**
     * Returns initial expected return
     * @returns 
     */
    getInitExpRet() {
        return this.initExpRet;
        // TODO This is related to order, so it should be moved to the future orders class
    }

    /**
     * Set expected return, only set once for stock object
     */
    setInitExpRet() {
        // this.initExpRet = this.shares() > 0 ? this.expRet() : null;
        this.initExpRet = this.expRet();
    }

    // Order Methods

    /**
     * Checking orders runs a orders check to see if its profitable to sell itself
     */
    checkOrders() {
        let profit = 0;
        for (order of this.orderArray) {
            profit += order.checkOrder();
        }
        this.orderArray = this.orderArray.filter((e) => e.isSold === false);
        return profit;
    }

    /**
     * Purchase order and add it to stocks order list
     * @param {*} numShares 
     */
    purchaseOrder(numShares) {
        this.orderArray.push(new Order(this.ns, this, numShares));
    }

    /**
     * Sell all orders, bypassing the check() method, so sells most likely will lose money
     */
    sellOrders() {
        for (order of this.orderArray) {
            order.sellOrder();
        }
    }

    /**
     * Get all order toStrings()
     */
    viewOrders() {
        //TODO Need to finish
        for (order of this.orderArray) {
            order.toString();
        }
    }

    // Record stock data methods

    /**
     * 
     * @param {*} price 
     */
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

    /**
     * String representation of Stock object
     * @returns 
     */
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

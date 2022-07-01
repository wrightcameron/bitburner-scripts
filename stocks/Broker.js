/* eslint-disable no-restricted-syntax */
import { Stock } from 'stocks/Stock';
import { Logger } from 'lib/Logger';

export class Broker {
    constructor(ns, reserve, risk) {
        this.logger = new Logger(ns, false, false);

        this.ns = ns; // Netscript object
        this.reserve = reserve; // Money that should stay liquid
        this.risk = risk; // Risk tolerance

        this.numCycles = 2;
        this.COMMISSION = 100000;
        this.fracL = 0.1; // Fraction of assets to keep as cash in hand
        this.fracH = 0.2;
        this.corpus = 0;
        this.expRetLossToSell = -0.4; // As a percent, the amount of change between the initial
        // forecasted return and the current return of the stock. I.e.
        // -40% less forecasted return now
        // than when we purchased the stock.

        this.stockArray = this.buildStockArray();
        this.portfolio = [];
    }

    buildStockArray() {
        const symbolArray = this.ns.stock.getSymbols();
        const stockArray = [];
        for (const sym of symbolArray) {
            stockArray.push(new Stock(this.ns, sym));
        }
        return stockArray;
    }

    checkStocks() {
        for (const stk of this.stockArray) {
            stk.getAvgPrice();
        }
    }

    pChange(sym, oldNum, newNum) {
        // this.logger.info("oldNum " + oldNum)
        // this.logger.info("newNum " + newNum)
        const diff = Math.abs(newNum - oldNum);
        // this.logger.info("diff " + diff)
        const pdiff = diff / oldNum;
        // this.logger.info("pdiff " + pdiff)
        this.logger.info(`${sym}:\t${oldNum} -> ${newNum} | ${(pdiff * 100)}%`);
        return pdiff;
    }

    checkPortfolio() {
        for (const stock of this.portfolio) {
            const pChange = this.pChange(stock.getSymbol(), stock.getInitExpRet(), stock.expRet());
            if (pChange <= this.expRetLossToSell) {
                const sellPrice = stock.sell(stock.shares());
                this.logger.info(`Sold ${stock.getSymbol()} for ${stock.shares() * sellPrice}`);
                this.corpus -= this.COMMISSION;
            } else if (stock.expRet() <= 0) {
                const sellPrice = stock.sell(stock.shares());
                this.corpus -= this.COMMISSION;
                this.logger.info(`Sold ${stock.getSymbol()} for ${stock.shares() * sellPrice}`);
            } else {
                this.logger.debug(`pChange ${pChange} greater than ${this.expRetLossToSell}`);
                this.logger.debug(`Or ${stock.expRet()} is less than 0.`);
            }
        }
    }

    buyStocks() {
        for (const stock of this.stockArray) {
            // We don't care about orders, we buy the stocks in bulk we sell them in bulk.
            // TODO Should change this to orders, and sell when the order is good or bad.
            if (stock.shares() === 0 && stock.expRet() > 0) {
                const cashToSpend = this.ns.getServerMoneyAvailable('home') - (this.fracH * this.corpus);
                const numShares = Math.floor((cashToSpend - this.COMMISSION) / stock.getAvgPrice());
                const buyCalc = numShares * stock.expRet() * stock.getAvgPrice() * this.numCycles;
                if (buyCalc > this.COMMISSION) {
                    const boughtPrice = stock.buy(numShares);
                    this.logger.info(`Bought ${stock.getSymbol()} for ${numShares * boughtPrice}`);
                    this.portfolio.push(stock);
                }
            } 
            // else {
            //     this.logger.debug(`The stock ${stock.getSymbol()} has ${stock.shares()}`);
            //     this.logger.debug(`exp Rate is ${stock.expRet()}`);
            // }
        }
        return 0;
    }

    async run() {
        this.logger.info('Starting Automated Broker');
        // eslint-disable-next-line no-constant-condition
        while (true) {
            // TODO Check on all stocks, checking on them will
            // force the stock to record meta data like peak/trough
            this.checkStocks();

            // Check portfolio, looking for stocks to sell
            this.checkPortfolio();

            this.buyStocks();

            await this.ns.sleep(5 * 1000 * this.numCycles + 200);
        }
    }
}

/** @param {NS} ns */
export async function main(ns) {
    const broker = new Broker(ns, 1e6, 0.07);
    await broker.run();
}

/* eslint-disable no-restricted-syntax */
import { Stock } from 'stocks/Stock';
import { Capital } from 'stocks/Capital';
import { Logger } from 'lib/Logger';

export class Broker {
    constructor(ns, capital) {
        this.logger = new Logger(ns, false, false);

        this.ns = ns; // Netscript object
        this.capital = new Capital(capital, false);

        // this.risk = risk; // Risk tolerance

        this.numCycles = 2;
        this.COMMISSION = 100000;

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
        let cashReturn = 0;
        for (const stock of this.portfolio) {
            cashReturn += stock.checkOrders();
        }
        this.logger.info(`Total cash gained from selling stocks ${cashReturn}`);
        this.capital.addCash(cashReturn);
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
                    stock.purchaseOrder(numShares);
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

    liquidate() {
        for (const stock of this.portfolio) {
            stock.sellOrders();
        }
    }
}

/** @param {NS} ns */
export async function main(ns) {
    // Command Line Arguments
    const args = ns.flags([
        ['capital', 1e6], // 1e6 is 1 million, 1e9 is 1 billion
        ['risk', 0.07],
    ]);

    const broker = new Broker(ns, args.capital, args.risk);
    await broker.run();
}

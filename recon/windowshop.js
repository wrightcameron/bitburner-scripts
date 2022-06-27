import { Logger } from 'lib/Logger';
import {
    totalSystemsCouldBuy, largestRamWithMostServers, getBestServersToReplace, handleBuyServers,
} from 'lib/PurchaseServers';

/** @param {NS} ns */
export async function main(ns) {
    const logger = new Logger(ns, true, true);
    // logger.info("windowshop.js <desiredRAM>")
    const args = ns.flags([
        ['ram', null],
        ['money', ns.getServerMoneyAvailable('home')],
        ['buy', false],
    ]);

    let ram;
    if (args.ram) {
        ram = args.ram;
    } else {
        ram = largestRamWithMostServers(ns, args.money);
    }

    logger.info(`Owned Servers ${ns.getPurchasedServers().length}/${ns.getPurchasedServerLimit()}`);
    logger.info(`With ${ram} RAM, could buy ${totalSystemsCouldBuy(ns, ram, args.money)} servers`);
    logger.info(`Would need to replace these servers: ${getBestServersToReplace(ns, args.money, ram)}`);
    logger.info(`Total savings $ ${args.money.toFixed(2)}`);

    if (args.buy) {
        ns.tprint('Buying Servers');
        handleBuyServers(ns, args.money);
    }
}

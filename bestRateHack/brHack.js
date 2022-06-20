/** @param {NS} ns */
export async function main(ns) {

    ns.print("brHack.js [targetSystem] [ratePercent]")

    let target = (ns.args.length >= 1) ? ns.args[0] : ns.getHostname();

    let rateRange = 0.50; // If weaken or grow add 75% onto the rate, do them.  If they don't just hack
    ns.print("Target: " + target + ", RateRange: " + rateRange)
    const startingRate = getRate(ns, target);
    ns.print(`${target} starting rate: ${startingRate} ($/min)`);
    let currentRate = startingRate;
    let weakenRate, growRate, hackRate;
    let weakenDiff, growDiff, hackDiff;
    let hackCount = 0;
    let growCount = 0;

    //First time running script, need to build the protfolio
    hackRate = await handleHack(ns, target);
    hackDiff = currentRate - hackRate;

    currentRate = hackRate //Move the current rate to the last rate, make it accurate

    growRate = await handleGrow(ns, target);
    growDiff = Math.abs(currentRate - growRate);

    currentRate = growRate;

    weakenRate = await handleWeaken(ns, target);
    weakenDiff = Math.abs(currentRate - weakenRate);

    currentRate = weakenRate;

    let upperBound = hackDiff * rateRange + hackDiff;

    while (true) {
        ns.print("hackDiff: " + hackDiff)
        ns.print("growDiff: " + growDiff + ", weakenDiff: "+ weakenDiff + ", upperBound: " + upperBound)
        if (growDiff > upperBound || hackCount >= 10) {
            hackCount = 0;
            growCount++;
            ns.print(`Hack Diff was ${hackDiff}, upperbound of ${upperBound}.  The growDiff was greater: ${growDiff}`)
            growRate = await handleGrow(ns, target);
            growDiff = Math.abs(currentRate - growRate);
            currentRate = growRate;
        } else if (weakenDiff > upperBound || growCount >= 10) {
            growCount = 0;
            ns.print(`Hack Diff was ${hackDiff}, upperbound of ${upperBound}.  The weakenDiff was greater: ${weakenDiff}`)
            weakenRate = await handleWeaken(ns, target);
            weakenDiff = Math.abs(currentRate - weakenRate);
            currentRate = weakenRate;
        } else {
            growCount = 0;
            hackCount++;
            ns.print(`Hack Diff was ${hackDiff}, upperbound of ${upperBound}.`)
            hackRate = await handleHack(ns, target);
            hackDiff = currentRate - hackRate;
            currentRate = hackRate;
        }

        upperBound = hackDiff * rateRange + hackDiff;

        //TODO Important, there is a ceiling that could be hit, where the server can't grow anymore
        // Either the ceiling needs to be calculated, or the rateRange dynamically could decrease.
    }
}

export function getRate(ns, server) {
    //Get money from hack
    let serverMoney = ns.getServerMoneyAvailable(server);
    let hackAnalyze = ns.hackAnalyze(server);
    let totalMoneyFromHack = serverMoney * hackAnalyze;
    //Chance of success
    let hackAnalyzeChance = ns.hackAnalyzeChance(server);
    // Get hack time in minutes
    let hackTime = ns.getHackTime(server) / 1000 / 60; // In minutes
    // 5000 * .5 / 10 (minutes)
    return totalMoneyFromHack * hackAnalyzeChance / hackTime;
}

export async function handleHack(ns, target) {
    await ns.hack(target);
    let newRate = getRate(ns, target);
    ns.print(`New Rate after Hack: ${newRate} ($/min)`)
    return newRate;
}

export async function handleWeaken(ns, target) {
    await ns.weaken(target);
    let newRate = getRate(ns, target);
    ns.print(`New Rate after Weaken: ${newRate} ($/min)`)
    return newRate;
}

export async function handleGrow(ns, target) {
    await ns.grow(target);
    let newRate = getRate(ns, target);
    ns.print(`New Rate after Grow: ${newRate} ($/min)`)
    return newRate;
}
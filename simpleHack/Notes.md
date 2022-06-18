# Notes on the use of the SimpleHack

The simpleHack scripts try to be as simple as possible, but split up to maximize threading on hacking, growing, weaken.

## Contents

- simpleDeploy: Copies SimpleHack, SimpleSurvey onto destination machine, then makes it hack that machine or another target machine.

- simpleSurvey: Finds max amount of money and min securitylevel on the target server.  Then finds the max amount of RAM target that server has to find how many threads to assign simpleHack.

- simpleHack: Only focuses on hack, row, or weaken, to minimize RAM and maximize threading.  Unforunetly RAM total is 2.6 GB due to getServerSecurityLevel and getServerMoneyAvailable included.  But doubt that making this script stupider would make it bring in more money per second.

## Observations

### Hacking n00dles

Running the script on n00dles - threads 1
RAM: 4.00GB
Used: 2.20GB

Production Rate $ 98.800 / sec - hacking n00dles

Running script on personal computer - threads 14
RAM: 32GB
Used: 30GB

Production Rate $ 1.471k / sec - hacking n00dles

### Other servers running SimpleHack

All other begining servers found from scanning from home are also running SimpleHack, but none of them have collected any money, even when some have been running for hours.

The issue is all other servers can have a max amount of money that is in the billions. Add the fact that all the servers start with hardly any funds and well even if the server has 1 billion dollars, that might be just 1% of total funds.  The current simpleHack is trying to get the funds too 75% which is taking way too long.

```javascript
// Defines how much money a server should have before we hack it
// In this case, it is set to 75% of the server's max money
const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
```

For n00dles server which has Money: 558,367.00, Max Money 1,750,000.00, which is 31.91% full.  With so many nodes 13 different nodes targeting the same machine this server is hitting 100% often and then back to 30%.  This isn't ideal as alot of the servers will do grow at the same time causing majority of grows to report 0.0% change in money due to this server already at %100.

## Solutions

- If grow happens twice in a row, downgrade the money requirement by half.

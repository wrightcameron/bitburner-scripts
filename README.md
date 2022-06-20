# BitBurner Scripts Repository

![BitBurner Logo](https://cdn.cloudflare.steamstatic.com/steam/apps/1812820/header.jpg?t=1639704813)

"Bitburner is a programming-based incremental game. Write scripts in JavaScript to automate gameplay, learn skills, play minigames, solve puzzles, and more in this cyberpunk text-based incremental RPG." (BitBurner Steam page)

This repoistory is storage for scripts used within video game [BitBurner](https://store.steampowered.com/app/1812820/Bitburner/)

## Requirements

Download the game BitBurner on Steam

## Installation

Other players have created a download script for pulling all scripts from a repo.  I borrowed this script from [jenheilemann/bitburner-scripts](https://github.com/jenheilemann/bitburner-scripts).  I'd highly recommend using it to initially download or redownlaod any scripts to the game.  Once the repository gets large enough, copying changes gets repetative.

Create a new script called `start.js` by issuing the following command: `vim start.js`. Make sure you are on your `home` server; if you are not you can quickly go home by running home in the console.

Paste the following content:

```javascript
export async function main(ns) {
    if (ns.getHostname() !== "home") {
        throw new Exception("Run the script from home");
    }

    let args = ns.flags([['branch', 'master']])

    await ns.wget(
        `https://raw.githubusercontent.com/wrightcameron/bitburner-scripts/${args.branch}/downloadScripts.js?ts=${new Date().getTime()}`,
        "downloadScripts.js"
    );
    ns.spawn("downloadScripts.js", 1, '--branch', args.branch);
}
```

Save and exit vim (:wq): `run start.js` then press enter.

## Resources

* [Documentation](https://bitburner.readthedocs.io/en/latest/basicgameplay.html)
* [List of functions](https://github.com/danielyxie/bitburner/blob/dev/markdown/bitburner.ns.md)
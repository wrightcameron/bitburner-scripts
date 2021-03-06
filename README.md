# BitBurner Scripts Repository

![BitBurner Logo](https://cdn.cloudflare.steamstatic.com/steam/apps/1812820/header.jpg?t=1639704813)

"Bitburner is a programming-based incremental game. Write scripts in JavaScript to automate gameplay, learn skills, play minigames, solve puzzles, and more in this cyberpunk text-based incremental RPG." (BitBurner Steam page)

This repoistory is storage for scripts used within video game [BitBurner](https://store.steampowered.com/app/1812820/Bitburner/)

## Requirements

Download the game BitBurner on Steam, or from your web browser.

### Development (optional)

* Python3 - For pushing files to game using local webserver
* npm - Downloading required packages, for linting

## Installation

Other players have created a download script for pulling all scripts from a repo.  I borrowed this script from [jenheilemann/bitburner-scripts](https://github.com/jenheilemann/bitburner-scripts).  I'd highly recommend using it to initially download or redownlaod any scripts to the game.  Once the repository gets large enough, copying changes gets repetative.

Create a new script called `start.js` by issuing the following command: `vim start.js`. Make sure you are on your `home` server; if you are not you can quickly go home by running home in the console.

Paste the following content:

```javascript
export async function main(ns) {
    if (ns.getHostname() !== "home") {
        throw new Exception("Run the script from home");
    }

    let args = ns.flags([['branch', 'master'],
                         ['local', false]
    ]);

    let url;
    if (!args.local) {
        ns.tprint(`Pulling download script from Github.`)
        url = `https://raw.githubusercontent.com/wrightcameron/bitburner-scripts/${args.branch}/downloadScripts.js?ts=${new Date().getTime()}`
    } else {
        ns.tprint(`Pulling download script localhost.`)
        url = `http://localhost:8080/downloadScripts.js`
    }

    await ns.wget(url, "downloadScripts.js");
    let spawnArgs = ['--branch', args.branch, '--local', args.local];
    ns.tprint("Spawning downloadScripts script.");
    ns.spawn("downloadScripts.js", 1, ...spawnArgs);
}
```

Save and exit vim (:wq): `run start.js` then press enter.

### Downloading Script changes from local repository

Pushing files constantly to Github can get messy, especially if you arn't rolling up your commits.  Or if you are using this script but don't want to pull from this repo.  In that case both `start.js` and `downloadScripts.js` have a flag `--local true` that will have the script download the raw source files from *localhost:8080*.  To have your files visiable start a Python HTTP server using the command.

```bash
python -m http.server --directory . 8080
```

Python required, and the command above will need to be run from the root directory of this repository.

### Downloading Scripts with Bitburner VSCode Integration Extenision

Bitburner on Steam contains an API Server that can intergrate with [VSCode Bitburner extension](https://marketplace.visualstudio.com/items?itemName=bitburner.bitburner-vscode-integration).

## Useful Alias

```bash
# Open as many ports as possbile to get root access
alias breach=run breach/breachDFS.js
# Download scripts from local repository (Need localhost http server running)
alias lpull=run downloadScripts.js --local true
```

## Testing

Bitburner doesn't have a debugger to my knowledge.  So linting and testing have been setup and run outside of the game to reduce syntax or commong errors.

### Linting

Linting is done with ESLint.

```bash
# Run ESLint from root directory, printing out issues to command line.
npx eslint . --config .eslintrc.json --ext .js
# Run ESLint from root directory, printing out issues to command line, and fixing any issue it can resolve.
npx eslint . --config .eslintrc.json --ext .js --fix
```

## Resources

* [Documentation](https://bitburner.readthedocs.io/en/latest/basicgameplay.html)
* [List of functions](https://github.com/danielyxie/bitburner/blob/dev/markdown/bitburner.ns.md)

* [ESLint Main Site](https://eslint.org/)
* [Linting and Formatting with ESLint in VSCode](https://www.digitalocean.com/community/tutorials/linting-and-formatting-with-eslint-in-vs-code)

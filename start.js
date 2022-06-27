export async function main(ns) {
    if (ns.getHostname() !== 'home') {
        throw new Error('Run the script from home');
    }

    const args = ns.flags([['branch', 'master'],
        ['local', false],
    ]);

    let url;
    if (!args.local) {
        ns.tprint('Pulling download script from Github.');
        url = `https://raw.githubusercontent.com/wrightcameron/bitburner-scripts/${args.branch}/downloadScripts.js?ts=${new Date().getTime()}`;
    } else {
        ns.tprint('Pulling download script localhost.');
        url = 'http://localhost:8080/downloadScripts.js';
    }

    await ns.wget(url, 'downloadScripts.js');
    const spawnArgs = ['--branch', args.branch, '--local', args.local];
    ns.tprint('Spawning downloadScripts script.');
    ns.spawn('downloadScripts.js', 1, ...spawnArgs);
}

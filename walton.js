import fs from 'node:fs/promises'

async function getNpmPackageInfo() {
    try {
        const readPackageJSON = async () => {
            const packageJsonPath = new URL('./package.json', import.meta.url).pathname
            const packageJson = await fs.readFile(packageJsonPath, 'utf-8')
            const packageJsonParsed = JSON.parse(packageJson)
            return Object.keys(packageJsonParsed.dependencies)
        }
        const deps = await readPackageJSON()

        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║                                                           ║');
        console.log('║                  Walton at your service!                  ║');
        console.log('║                                                           ║');
        console.log('║     Analyzing npm packages with distinguished taste...    ║');
        console.log('║                                                           ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('ರ⌓ರೃ Walton founds this deps', deps)

        let arrayDeps = []

        for (const dep of deps) {

            const urlBase = `https://registry.npmjs.org/${dep}`;

            const response = await fetch(urlBase)
            // il fetch restituisce una promise, e usando await attendiamo la risposta

            if (!response.ok) {
                throw new Error(`Error-1 HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json()
            // response NON contiene ancora i dati! Devo "estrarre" il body 
            // MA il body completo potrebbe non essere ancora arrivato tutto!

            console.log('thinking about:', data.name);
            const githubPath = findGithubPath(data.repository?.url)
            const thisIsAnOldRepo = waltonSaysThatItsOld(data.time?.modified)
            let forks = ''
            if (thisIsAnOldRepo) {
                // if walton Says That Its Old we looking for a better fork
                const { repoUrl, forksCount } = await infoRepoGithub(githubPath)
                forks = `in '${repoUrl}' we found ${forksCount} forks`
            } else {
                forks = `◕_ರೃ Walton say it's ok`
            }
            const info = {
                name: data?.name || 'UNK',
                description: data.description,
                latest: data['dist-tags'].latest, // chiave .latest
                // 'dist-tags': { latest: '0.1.1' },
                // data-dista ha il trattino quindi non è possibile usare la notazione semplice
                // quindi si accede al dato con data['dist-tags']
                versions: Object.keys(data.versions || {}).length,
                // versions: { '0.1.0': {}, '0.1.1': {} }, 
                // count how much version 
                // using Object.keys() - this method returns an array of a given object's own enumerable string-keyed property names.
                // in this case Array ["0.1.0", "0.1.1"...]
                // i decided to count the versions
                mainteners: data.mainteners?.map(m => m.name || 'UNK'),
                // maintainers: [ { name: 'ramalho', email: 'luciano@ramalho.org' } ],
                // .map return a new array
                author: data?.author?.name,
                // author: {
                //     name: 'Luciano Ramalho',
                //     email: 'luciano@ramalho.org',
                //     url: 'http://standupdev.com'
                // },
                LastUpdate: betterData(data.time?.modified),
                // time: {
                //  modified: '2023-11-07T05:03:45.757Z',
                //  created: '2011-12-28T00:43:08.254Z',
                //  '0.1.0': '2011-12-28T00:43:11.107Z',
                //  '0.1.1': '2019-11-04T18:50:35.944Z'
                // },
                repo: `https://github.com/${githubPath}`,
                // repository: { type: 'git', url: 'git://github.com/ramalho/calendar.js.git' },
                forks: forks,
                license: data.license,
                // license: 'MIT',
                waltonSays: thisIsAnOldRepo ? 'its old!' : 'its ok'

            }
            //console.log(info);
            /*{
                name: 'calendar',
                description: 'calendar generator',
                latest: undefined,
                versions: 2,
                mainteners: undefined,
                author: 'Luciano Ramalho',
                LastUpdate: '2023-11-07T05:03:45.757Z',
                repo: 'git://github.com/ramalho/calendar.js.git',
                homepage: undefined,
                license: 'MIT'
            }*/
            // console.log(info);
            // console.log(JSON.stringify(info, null, 2));
            /** {
                 "name": "calendar",
                "description": "calendar generator",
                "versions": 2,
                "author": "Luciano Ramalho",
                "LastUpdate": "2023-11-07T05:03:45.757Z",
                "repo": "git://github.com/ramalho/calendar.js.git",
                "license": "MIT"
            } */

            arrayDeps.push(info)
        }
        return arrayDeps

    } catch (error) {
        console.log('catched!')
        throw error
    }
}

function betterData(date) {
    // make this custom
    return new Date(date).toLocaleDateString('en-US')
}

function findGithubPath(url) {
    const match = url.match(/github\.com[\/:](.+)/);
    /* match return: [
        'github.com/payloadcms/payload.git',
        'payloadcms/payload.git',
        ...
    ] */
    if (match) {
        const path = match[1].replace(/\.git$/, '');
        return path; // <user>/<repo>
    }
    return url;
}

// HERE I LOOKING FOR REPO'S BETTER 5 FORKS
async function infoRepoGithub(path) {
    const repoUrl = `https://api.github.com/repos/${path}`
    const response = await fetch(repoUrl)

    if (!response.ok) {
        throw new Error(`Error-2 api.github HTTP: ${response.status} - ${response.statusText}`);
    }

    const repoData = await response.json()
    const forksCount = repoData.forks

    console.log('Walton is smoking...')
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await sleep(2000); // 2 secondi

    // TEST
    const forksUrl = `https://api.github.com/repos/${path}/forks`
    const forksResponse = await fetch(forksUrl)

    if (!forksResponse.ok) {
        throw new Error(`Error-3 HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await forksResponse.json() // [ {fork}, {fork}, {fork}, {fork}, {fork} ]
    let objForksInfoArray = []
    for (const fork of data) {
        const rate = calculateRating(fork)
        if (rate > 5) {
            const objForkInfo = {
                full_name: fork.full_name,  // eventxtra/sharp
                owner: fork.owner?.login,  //eventxtra
                updated_at: betterData(fork.updated_at), //"2025-11-12T17:59:46Z",
                pushed_at: betterData(fork.pushed_at), //"2025-11-12T17:59:38Z",
                rating: rate, //calculateRating(fork)
                stars: fork.stargazers_count, //": 0,
                watchers: fork.watchers_count, //": 0,
                issuesCount: fork.open_issues_count, //": 0,
                forks: fork.forks_count, //": 0,
                has_discussions: fork.has_discussions, //": false,
                archived: fork.archived, //": false,
                disabled: fork.disabled, //": false,
                license: fork.license?.key, //": "apache-2.0",
                wiki: fork.has_wiki, //": false,
            }
            objForksInfoArray.push(objForkInfo)
        } else {
            // bad fork
        }
    }
    // const objForkInfo = {
    //     full_name: data[0].full_name,  // eventxtra/sharp
    //     owner: data[0].owner?.login,  //eventxtra
    //     updated_at: betterData(data[0].updated_at), //"2025-11-12T17:59:46Z",
    //     pushed_at: betterData(data[0].pushed_at), //"2025-11-12T17:59:38Z",
    //     rating: "3", //calculateRating(data[0])
    //     stars: data[0].stargazers_count, //": 0,
    //     watchers: data[0].watchers_count, //": 0,
    //     issuesCount: data[0].open_issues_count, //": 0,
    //     forks: data[0].forks_count, //": 0,
    //     has_discussions: data[0].has_discussions, //": false,
    //     archived: data[0].archived, //": false,
    //     disabled: data[0].disabled, //": false,
    //     license: data[0].license?.key, //": "apache-2.0",
    //     wiki: data[0].has_wiki, //": false,
    // }

    // const objForkInfo2 = {
    //     full_name: data[1].full_name,  // eventxtra/sharp
    //     owner: data[1].owner?.login,  //eventxtra
    //     updated_at: betterData(data[1].updated_at), //"2025-11-12T17:59:46Z",
    //     pushed_at: betterData(data[1].pushed_at), //"2025-11-12T17:59:38Z",
    //     rating: "4", //calculateRating(data[0])
    //     stars: data[1].stargazers_count, //": 0,
    //     watchers: data[1].watchers_count, //": 0,
    //     issuesCount: data[1].open_issues_count, //": 0,
    //     forks: data[1].forks_count, //": 0,
    //     has_discussions: data[1].has_discussions, //": false,
    //     archived: data[1].archived, //": false,
    //     disabled: data[1].disabled, //": false,
    //     license: data[1].license?.key, //": "apache-2.0",
    //     wiki: data[1].has_wiki, //": false,
    // }

    console.table(objForksInfoArray, [
        'full_name',
        'owner',
        'updated_at',
        'pushed_at',
        'rating',
        'stars',
        'watchers',
        'issuesCount',
        'forks',
        'has_discussions',
        'archived',
        'disabled',
        'license',
        'wiki',
    ]);

    return { repoUrl, forksCount }
}

function waltonSaysThatItsOld(data) {
    const modifiedDate = new Date(data);
    const now = new Date();
    const differenceInMs = now - modifiedDate;
    const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

    return (differenceInDays > 10) // old if data > 10days
}

function calculateRating(data) {
    // const { stargazers_count = data.stargazers_count, //": 0,
    // watchers_count: data[0].watchers_count, //": 0,
    // has_issues: data[0].has_issues, //": false,
    // has_wiki: data[0].has_wiki, //": false,
    // has_discussions: data[0].has_discussions, //": false,
    // forks_count: data[0].forks_count, //": 0,
    // archived: data[0].archived, //": false,
    // disabled: data[0].disabled, //": false,
    // open_issues_count: data[0].open_issues_count, //": 0,
    // watchers: data[0].watchers, //": 0,
    const { stargazers_count, watchers_count, has_wiki, has_discussions, forks_count, archived, disabled, open_issues_count } = data

    if (archived || disabled) {
        return 0
    }

    //return Math.floor(Math.random() * (100)) + 1
    const rating = (stargazers_count * 5) + (watchers_count * 3) + (forks_count * 2) + (has_wiki ? 2 : 0) + (has_discussions ? 3 : 0) + (open_issues_count ? 5 : 0)
    return rating
}

getNpmPackageInfo()
    .then(info => {
        console.log("====Walton's resume====")
        console.table(info, ['name', 'latest', 'LastUpdate', 'license', 'waltonSays']);
        console.log('Completato con successo')
    })
    .catch(error => {
        console.error('error', error)
    })
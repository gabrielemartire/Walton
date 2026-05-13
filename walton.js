import fs from 'node:fs/promises'
import getDependenciesFromLockFile from './dep.js'


async function getNpmPackageLockInfo() {
    let arrayDeps = []
    try {
        const filteredDepsLock = getDependenciesFromLockFile()
        for (const dep of filteredDepsLock) {
            const urlBase = `https://registry.npmjs.org/${dep}`;

            const response = await fetch(urlBase)
            // il fetch restituisce una promise, e usando await attendiamo la risposta

            if (!response.ok) {
                throw new Error(`Error-1 HTTP: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json()
            // response NON contiene ancora i dati! Devo "estrarre" il body
            // MA il body completo potrebbe non essere ancora arrivato tutto!
            // made this more evident
            console.log(`  → ${data.name}`);
            const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            await sleep(200); // 0,2 secondi

            const info = {
                name: data?.name || 'UNK',
                latest: data['dist-tags'].latest, // chiave .latest
                LastUpdate: betterDate(data.time?.modified),
                waltonSays: isItOld(data.time?.modified) ? 'old' : 'ok'
            }

            arrayDeps.push(info)
        }
        return arrayDeps

    } catch (error) {
        console.log('catched!')
        throw error
    }
}


async function getNpmPackageInfo() {

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║                        WALTON                             ║');
    console.log('║                                                           ║');
    console.log('║     Excavating your node_modules for lost artifacts...    ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log();

   let arrayDeps = []

   try {
        const readPackageJSON = async () => {
            const packageJsonPath = new URL('./package.json', import.meta.url).pathname
            const packageJson = await fs.readFile(packageJsonPath, 'utf-8')
            const packageJsonParsed = JSON.parse(packageJson)
            return Object.keys(packageJsonParsed.dependencies)
        }
        const filteredDeps = await readPackageJSON()

        console.log('Analyzing Dependencies...');

        for (const dep of filteredDeps) {

            const urlBase = `https://registry.npmjs.org/${dep}`;

            const response = await fetch(urlBase)
            // il fetch restituisce una promise, e usando await attendiamo la risposta

            if (!response.ok) {
                throw new Error(`Error-1 HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json()
            // response NON contiene ancora i dati! Devo "estrarre" il body 
            // MA il body completo potrebbe non essere ancora arrivato tutto!

            console.log(`Analyzing dependence: ${data.name}`);
            const githubPath = findGithubPath(data.repository?.url)
            const thisIsAnOldRepo = isItOld(data.time?.modified)
            if (thisIsAnOldRepo) {
                // if walton Says That Its Old we looking for a better fork
                try {
                    const { forksCount } = await infoRepoGithub(githubPath)
                    console.log(`${forksCount}`)
                } catch (err) {
                    console.log(`Warning: Could not fetch GitHub info for ${githubPath}: ${err.message}`)
                }
            } else {
                console.log(`This repo is ok`)
            }
            const info = {
                name: data?.name,
                description: data.description?.substring(0,24) || 'No description', 
                // NOT USED latest: data['dist-tags'].latest, // chiave .latest
                // 'dist-tags': { latest: '0.1.1' },
                // data-dista ha il trattino quindi non è possibile usare la notazione semplice
                // quindi si accede al dato con data['dist-tags']
                versions: Object.keys(data.versions || {}).length,
                // versions: { '0.1.0': {}, '0.1.1': {} }, 
                // count how much version 
                // using Object.keys() - this method returns an array of a given object's own enumerable string-keyed property names.
                // in this case Array ["0.1.0", "0.1.1"...]
                // i decided to count the versions
                // NOT USED mainteners: data.mainteners?.map(m => m.name || 'UNK'),
                // maintainers: [ { name: 'ramalho', email: 'luciano@ramalho.org' } ],
                // .map return a new array
                author: data?.author?.name,
                // author: {
                //     name: 'Luciano Ramalho',
                //     email: 'luciano@ramalho.org',
                //     url: 'http://standupdev.com'
                // },
                LastUpdate: betterDate(data.time?.modified),
                // time: {
                //  modified: '2023-11-07T05:03:45.757Z',
                //  created: '2011-12-28T00:43:08.254Z',
                //  '0.1.0': '2011-12-28T00:43:11.107Z',
                //  '0.1.1': '2019-11-04T18:50:35.944Z'
                // },
                repo: `https://github.com/${githubPath}`,
                // repository: { type: 'git', url: 'git://github.com/ramalho/calendar.js.git' },
                license: data.license,
                // license: 'MIT',
                waltonSays: thisIsAnOldRepo ? 'X' : '√'
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

function betterDate(date) {
    // make this custom
    return new Date(date).toLocaleDateString('en-US')
}

function findGithubPath(url) {
    const match = url?.match(/github\.com[\/:](.+)/);
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
    /*
    A CHE SERVE FARE UNA CHIAMATA IN PIU' AL REPO ORIGINALE?
    CIOE PER CAPIRE SE HA FORK, MA POSSO CAPIRE ANCHE DALLA CHIAMATA AI FORKS
    E SE NON HA FORK ALLORA NON FACCIO NIENTE O SE I FORK TROVATI NON SONO BUONI
    ALLROA CHIAMARE QUESTO ENDPOINT E CAPIRE LA REPO POSSA ESSERE FUNZIONANTE ANCHE SE NON HA MODIFICHE DA TEMPO

    const repoUrl = `https://api.github.com/repos/${path}`
    const response = await fetch(repoUrl)

    if (!response.ok) {
        throw new Error(`Error-2 api.github HTTP: ${response.status} - ${response.statusText}`);
    }

    const repoData = await response.json()
    
    // QUA POTREI CAPIRE SE IL REPO ORIGINALE VA BENE
    // console.log(repoData)

    const forksCount = repoData.forks

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await sleep(300); // 0,3 secondi
    */

    const forksUrl = `https://api.github.com/repos/${path}/forks`
    const forksResponse = await fetch(forksUrl)

    if (!forksResponse.ok) {
        throw new Error(`Error-3 HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await forksResponse.json() // [ {fork}, {fork}, {fork}, {fork}, {fork} ]
    let objForksInfoArray = []
    console.log(`Analyzing ${data.length} forks...`);
    for (const fork of data) {
        const rate = calculateRating(fork)
        if (rate > 5) {
            const objForkInfo = {
                full_name: fork.full_name,  // eventxtra/sharp
                owner: fork.owner?.login,  //eventxtra
                updated_at: betterDate(fork.updated_at), //"2025-11-12T17:59:46Z",
                pushed_at: betterDate(fork.pushed_at), //"2025-11-12T17:59:38Z",
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
        }
    }
    // if we doenst find any good fork probably its still a good repo or maybe a user can create a good fork
    // QUA POSSO CHIAMARE L'ENDPOINT DELLA REPO E VEDERE SE E' FUNZIONANTE O SE HA COMMENTI APERTI ECC 
    if (objForksInfoArray.length === 0) {
        console.log('! No good forks found');
        console.log('! The original repo might still be the best option');
        console.log(`! You can suggest improvements here:`);
        console.log(`! https://github.com/${path}/issues/new?title=Suggestion%20New%20Fork`);
    }

    if (objForksInfoArray.length > 0) {
        objForksInfoArray.sort((a, b) => b.rating - a.rating)
        const topFork = objForksInfoArray[0]
        console.log('! Good Forks Found');
        console.log(`Top recommendation: ${topFork.full_name}`);
        console.log(`Rating: ${topFork.rating}`);
        console.log(`Check it out here:`);
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
    }
    return { repoUrl, forksCount }
}

function isItOld(data) {
    const modifiedDate = new Date(data);
    const now = new Date();
    const differenceInMs = now - modifiedDate;
    const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

    return (differenceInDays > 20) // old if data > 700days
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
        console.log();
        console.log();
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║                                                           ║');
        console.log("║                   WALTON'S RESUME                         ║");
        console.log('║                                                           ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log();
        console.table(info, ['name', 'description', 'LastUpdate', 'versions', 'author', 'license', 'repo', 'waltonSays']);
        console.log();
        console.log('✅ Analysis completed successfully!');
        console.log();
    })
    //.then(() => {
    //    const arrayDeps = getNpmPackageLockInfo()
    //    console.table(arrayDeps, ['name', 'latest', 'LastUpdate', 'license', 'waltonSays']);
    //    console.log('Completato con successo')
    //})
    .catch(error => {
        console.log();
        console.log('❌ Error occurred:');
        console.error(error);
        console.log();
    })

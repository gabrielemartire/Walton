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

        console.log('deps', deps)

        let arrayDeps = []

        for (const dep of deps) {

            const urlBase = `https://registry.npmjs.org/${dep}`;

            const response = await fetch(urlBase)
            // il fetch restituisce una promise ma usando il await attendiamo la risposta

            if (!response.ok) {
                throw new Error('errore')
            }

            // response NON contiene ancora i dati! Devi "estrarre" il body 
            // MA il body completo potrebbe non essere ancora arrivato tutto!
            const data = await response.json()

            const githubPath = findGithubPath(data.repository?.url)
            const waltonSaysThatItsOldd = waltonSaysThatItsOld(data.time?.modified)

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
                forks: infoRepoGithub(githubPath),
                license: data.license,
                // license: 'MIT',
                waltonSays: waltonSaysThatItsOldd ? 'its old!' : 'its ok'

            }

            console.log('✅ Informazioni ottenute:');
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
            console.log(info);
            console.log('========================================');
            console.log(JSON.stringify(info, null, 2));
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
    console.log('====== INSIDE betterData =====')
    return new Date(date).toLocaleDateString('en-US')
}

function findGithubPath(url) {
    console.log('====== INSIDE findGithubPath =====')
    const match = url.match(/github\.com[\/:](.+)/);
    if (match) {
        console.log('match', match)
        const path = match[1].replace(/\.git$/, '');
        console.log('path', path)
        //return `https://github.com/${path}`;
        return path;
    }
    return url;
}

function infoRepoGithub(path) {
    console.log('====== INSIDE infoRepoGithub =====')
    console.log(`https://api.github.com/repos/${path}`)
    return `https://api.github.com/repos/${path}`
    // const urlForks = `${path}/forks`;
    // console.log('urlForks', urlForks)
    // const response = await fetch(urlForks)

    // if (!response.ok) {
    //     throw new Error('errore')
    // }

    // const data = await response.json()
    // console.log(data)
}

function waltonSaysThatItsOld(data) {
    console.log('====== INSIDE waltonSaysThatItsOld =====')
    const modifiedDate = new Date(data);
    const now = new Date();
    const differenceInMs = now - modifiedDate;
    const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

    return (differenceInDays > 10)
}

getNpmPackageInfo()
    .then(info => {
        console.log(info)
        console.log('Completato con successo')
    })
    .catch(error => {
        console.error('error', error)
    })

// eseguirai la funzione('package')
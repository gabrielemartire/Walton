import fs from 'fs';
import path from 'path';

export default function getDependenciesFromLockFile() {
    const lockPath = path.join(process.cwd(), 'package-lock.json');

    if (!fs.existsSync(lockPath)) {
        console.error('package-lock.json non trovato');
        return [];
    }

    const lockFile = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
    const packages = [];

    // Per npm v7+ (lockfileVersion 2 o 3)
    if (lockFile.packages) {
        for (const [pkgPath, info] of Object.entries(lockFile.packages)) {
            if (pkgPath && pkgPath !== '') { // Escludi il root package
                const name = pkgPath.replace(/^node_modules\//, '');
                packages.push({
                    name,
                    version: info.version,
                    dev: info.dev || false
                });
            }
        }
    }

    const deps = packages;

    console.log(`trovate ${deps.length} dipendenze`);

    const filteredDeps = deps.filter((dep) => !dep.name.startsWith('@'))

    const filteredDepsMap = filteredDeps.map((dep) => dep.name)

    console.log(`di cui ${filteredDepsMap.length} senza @`);

    return filteredDepsMap
}

// Uso

// @ts-check

import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

spawnSync('npm', ['run', 'build'], { stdio: 'inherit' });
copyNpmConf();

function copyNpmConf() {
    /**
     * @type {{
     *  name: string;
     *  version: string;
     *  main: string;
     *  type: string;
     *  scripts?: Record<string, string>;
     *  bin: Record<string, string>;
     *  devDependencies?: Record<string, string>;
     *  author: string;
     *  license: string;
     *  description: string;
     * }}
     */
    const npmConf = JSON.parse(readFileSync(resolve('package.json'), 'utf-8'));

    delete npmConf.devDependencies;
    delete npmConf.scripts;

    writeFileSync(
        resolve('dist', 'package.json'),
        JSON.stringify(npmConf, null, 4)
    );
}

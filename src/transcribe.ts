// @ts-check

import { spawnSync } from 'child_process';

/**
 * @param fsPath
 * @param args
 */
export function transcribe(fsPath: string, ...args: string[]) {
    console.log(`Transcribing ${fsPath}`);
    spawnSync('whisper-cli', ['-f', fsPath, ...args], { stdio: 'inherit' });
}

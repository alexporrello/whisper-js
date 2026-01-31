#!/usr/bin/env node

// @ts-check

import { globSync, statSync } from 'fs';
import { join, basename } from 'path';
import { argv } from 'process';
import { help } from './help.js';
import { transcribe } from './transcribe.js';
import { parseArgs } from './parse-args.js';
import { ensureModel } from './download-model.js';

if (argv.join('').includes('help')) {
    console.log(help);
}

const { fsPath, args } = parseArgs(argv, {
    '--model': join(import.meta.dirname, 'models', 'ggml-medium.bin'),
    '--language': 'en',
    '--temperature': '0.1',
    '--best-of': '2',
    '--beam-size': '2',
    '--word-thold': '0.01',
    '--entropy-thold': '2.4',
    '--logprob-thold': '-1.0',
    '--no-fallback': true,
    '--output-txt': true,
    '--output-srt': true
});

// Extract the model path from args and ensure it exists
const modelArgIndex = args.indexOf('--model');
const modelPath = modelArgIndex !== -1 ? args[modelArgIndex + 1] : join(import.meta.dirname, 'models', 'ggml-medium.bin');
const modelName = basename(modelPath);

// Download model if missing
await ensureModel(modelPath, modelName);

if (statSync(fsPath).isDirectory()) {
    const files = globSync(join(fsPath, '**', '*.{mp3,ogg,wav,flac}')).sort();
    console.log(`Transcribing ${files.length} files.`);
    files.forEach((p) => {
        transcribe(p);
    });
} else {
    if (
        !fsPath.endsWith('flac') &&
        !fsPath.endsWith('mp3') &&
        !fsPath.endsWith('.ogg') &&
        !fsPath.endsWith('.wav')
    ) {
        console.error(`Unsupported filetype.`);
        console.log('\n' + help);
    }

    transcribe(fsPath, ...args);
}

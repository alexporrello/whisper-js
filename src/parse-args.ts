// @ts-check

import { existsSync } from 'fs';
import { resolve } from 'path';
import { exit } from 'process';

export declare interface WhisperJsArg {
    arg: string;
    alias?: string;
    type: string;
}

const possibleArgs: WhisperJsArg[] = [
    { arg: '--threads', alias: '-t', type: 'number' },
    { arg: '--processors', alias: '-p', type: 'number' },
    { arg: '--offset-t', alias: '-ot', type: 'number' },
    { arg: '--offset-n', alias: '-on', type: 'number' },
    { arg: '--duration', alias: '-d', type: 'number' },
    { arg: '--max-context', alias: '-mc', type: 'number' },
    { arg: '--max-len', alias: '-ml', type: 'number' },
    { arg: '--best-of', alias: '-bo', type: 'number' },
    { arg: '--beam-size', alias: '-bs', type: 'number' },
    { arg: '--audio-ctx', alias: '-ac', type: 'number' },
    { arg: '--word-thold', alias: '-wt', type: 'number' },
    { arg: '--entropy-thold', alias: '-et', type: 'number' },
    { arg: '--logprob-thold', alias: '-lpt', type: 'number' },
    { arg: '--no-speech-thold', alias: '-nth', type: 'number' },
    { arg: '--temperature', alias: '-tp', type: 'number' },
    { arg: '--temperature-inc', alias: '-tpi', type: 'number' },
    { arg: '--vad-threshold', alias: '-vt', type: 'number' },
    { arg: '--vad-min-speech-duration-ms', alias: '-vspd', type: 'number' },
    { arg: '--vad-min-silence-duration-ms', alias: '-vsd', type: 'number' },
    { arg: '--vad-max-speech-duration-s', alias: '-vmsd', type: 'number' },
    { arg: '--vad-speech-pad-ms', alias: '-vp', type: 'number' },
    { arg: '--vad-samples-overlap', alias: '-vo', type: 'number' },
    { arg: '--split-on-word', alias: '-sow', type: 'boolean' },
    { arg: '--debug-mode', alias: '-debug', type: 'boolean' },
    { arg: '--translate', alias: '-tr', type: 'boolean' },
    { arg: '--diarize', alias: '-di', type: 'boolean' },
    { arg: '--tinydiarize', alias: '-tdrz', type: 'boolean' },
    { arg: '--no-fallback', alias: '-nf', type: 'boolean' },
    { arg: '--output-txt', alias: '-otxt', type: 'boolean' },
    { arg: '--output-vtt', alias: '-ovtt', type: 'boolean' },
    { arg: '--output-srt', alias: '-osrt', type: 'boolean' },
    { arg: '--output-lrc', alias: '-olrc', type: 'boolean' },
    { arg: '--output-words', alias: '-owts', type: 'boolean' },
    { arg: '--output-csv', alias: '-ocsv', type: 'boolean' },
    { arg: '--output-json', alias: '-oj', type: 'boolean' },
    { arg: '--output-json-full', alias: '-ojf', type: 'boolean' },
    { arg: '--no-prints', alias: '-np', type: 'boolean' },
    { arg: '--print-special', alias: '-ps', type: 'boolean' },
    { arg: '--print-colors', alias: '-pc', type: 'boolean' },
    { arg: '--print-progress', alias: '-pp', type: 'boolean' },
    { arg: '--no-timestamps', alias: '-nt', type: 'boolean' },
    { arg: '--detect-language', alias: '-dl', type: 'boolean' },
    { arg: '--log-score', alias: '-ls', type: 'boolean' },
    { arg: '--no-gpu', alias: '-ng', type: 'boolean' },
    { arg: '--flash-attn', alias: '-fa', type: 'boolean' },
    { arg: '--no-flash-attn', alias: '-nfa', type: 'boolean' },
    { arg: '--suppress-nst', alias: '-sns', type: 'boolean' },
    { arg: '--output-file', alias: '-of', type: 'string' },
    { arg: '--language', alias: '-l', type: 'string' },
    { arg: '--font-path', alias: '-fp', type: 'string' },
    { arg: '--model', alias: '-m', type: 'string' },
    { arg: '--file', alias: '-f', type: 'string' },
    { arg: '--vad-model', alias: '-vm', type: 'string' },
    { arg: '--ov-e-device', alias: '-oved', type: 'string' },
    { arg: '--dtw', alias: '-dtw', type: 'string' },
    { arg: '--print-confidence', type: 'string' },
    { arg: '--carry-initial-prompt', type: 'string' },
    { arg: '--vad', type: 'string' },
    { arg: '--prompt', type: 'string' },
    { arg: '--suppress-regex', type: 'string' },
    { arg: '--grammar', type: 'string' },
    { arg: '--grammar-rule', type: 'string' },
    { arg: '--grammar-penalty', type: 'number' }
];

export function parseArgs(
    argv: string[],
    defaultArgs: Record<string, string | boolean>
) {
    const args = argv.slice(2);

    // Validate the final path argument

    const fileOrDir = args.pop();
    if (!fileOrDir) {
        console.error('You must provide a path as the final argument.');
        exit();
    }

    const fsPath = resolve(fileOrDir);
    if (!existsSync(fsPath)) {
        console.error(`The file at ${fsPath} does not exist.`);
        exit();
    }

    const formattedArgs: Record<string, string | boolean> = { ...defaultArgs };

    possibleArgs.forEach((arg) => {
        const argIndex = args.findIndex((a) => {
            return a === arg.arg || a === arg.alias;
        });

        if (argIndex === -1) {
            return;
        }

        if (arg.type === 'boolean') {
            args.splice(argIndex, 1);
            formattedArgs[arg.arg] = true;
            return;
        }

        // Validate args with parameters

        const parameter = args[argIndex + 1];

        if (parameter === undefined) {
            console.error(`You must provide a value for argument ${arg}`);
            exit();
        }

        if (parameter.startsWith('-')) {
            console.error(
                `A value was expected for argument ${arg}, received ${parameter}`
            );
            exit();
        }

        // Remove the argument

        const spliced = args.splice(argIndex, 2);
        formattedArgs[arg.arg] = spliced[1];
    });

    return {
        fsPath,
        args: Object.entries(formattedArgs).flatMap(([key, val]) => {
            if (typeof val === 'boolean') {
                return [key];
            }

            return [key, val];
        })
    };
}

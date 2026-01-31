// @ts-check

import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { get } from 'https';
import { dirname } from 'path';

/**
 * Ensure the specified model exists, downloading it if necessary
 * @param modelPath Path to the model file
 * @param modelName Optional model name (e.g., 'ggml-medium.bin')
 */
export async function ensureModel(
    modelPath: string,
    modelName = 'ggml-medium.bin'
): Promise<void> {
    if (existsSync(modelPath)) {
        return;
    }

    console.log(`Model not found at: ${modelPath}`);
    console.log(`Downloading ${modelName}...`);
    console.log('This may take a few minutes depending on your connection.\n');

    const baseUrl = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main';
    const url = `${baseUrl}/${modelName}`;

    try {
        await downloadFile(url, modelPath);
        console.log(`Model saved to: ${modelPath}\n`);
    } catch (error) {
        console.error(`\nFailed to download model: ${(<any>error).message}`);
        console.error(
            `\nPlease download the model manually from:\n${url}\nand save it to: ${modelPath}`
        );
        process.exit(1);
    }
}

/**
 * Download a file from a URL with progress indication
 * @param url The URL to download from
 * @param destination The local file path to save to
 */
function downloadFile(url: string, destination: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Ensure directory exists
        const dir = dirname(destination);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }

        const file = createWriteStream(destination);
        let downloadedBytes = 0;
        let totalBytes = 0;

        console.log(`Downloading from ${url}...`);

        get(url, (response) => {
            // Handle redirects
            if (response.statusCode === 302 || response.statusCode === 301) {
                const redirectUrl = response.headers.location;
                if (!redirectUrl) {
                    reject(new Error('Redirect without location'));
                    return;
                }
                file.close();
                downloadFile(redirectUrl, destination)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(
                    new Error(`Failed to download: HTTP ${response.statusCode}`)
                );
                return;
            }

            totalBytes = parseInt(
                response.headers['content-length'] || '0',
                10
            );

            response.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                if (totalBytes > 0) {
                    const percent = (
                        (downloadedBytes / totalBytes) *
                        100
                    ).toFixed(1);
                    const downloaded = (downloadedBytes / 1024 / 1024).toFixed(
                        1
                    );
                    const total = (totalBytes / 1024 / 1024).toFixed(1);
                    process.stdout.write(
                        `\rProgress: ${percent}% (${downloaded}MB / ${total}MB)`
                    );
                }
            });

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                console.log('\nDownload completed!');
                resolve();
            });
        }).on('error', (err) => {
            file.close();
            reject(err);
        });
    });
}

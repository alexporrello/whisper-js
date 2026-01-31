#!/usr/bin/env node

// @ts-check

/**
 * Cross-platform pre-install script to install whisper.cpp
 * This script will clone, build, and install whisper.cpp if it's not already available
 */

import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { platform } from 'os';
import { join } from 'path';

const PLATFORM = platform();
const IS_WINDOWS = PLATFORM === 'win32';
const IS_MAC = PLATFORM === 'darwin';
const IS_LINUX = PLATFORM === 'linux';

/**
 * Check if a command exists in PATH
 * @param {string} command - The command name to check
 * @returns {boolean} True if the command exists in PATH
 */
function commandExists(command) {
    const result = IS_WINDOWS
        ? spawnSync('where', [command], { stdio: 'pipe' })
        : spawnSync('which', [command], { stdio: 'pipe' });
    return result.status === 0;
}

/**
 * Execute a command and display output
 * @param {string} command - The command to execute
 * @param {import('child_process').SpawnSyncOptions} [options={}] - Options for spawnSync
 * @returns {import('child_process').SpawnSyncReturns<string>} The spawn result
 */
function exec(command, options = {}) {
    console.log(`Running: ${command}`);
    const result = spawnSync(command, {
        stdio: 'inherit',
        shell: true,
        ...options
    });
    if (result.status !== 0) {
        throw new Error(`Command failed with exit code ${result.status}: ${command}`);
    }
    return result;
}

/**
 * Install whisper.cpp on Unix-like systems (macOS/Linux)
 * @returns {Promise<void>}
 */
async function installUnix() {
    console.log('Installing whisper.cpp from source...');
    
    // Check for required build tools
    if (!commandExists('git')) {
        throw new Error('git is required but not found. Please install git first.');
    }
    
    if (!commandExists('make')) {
        throw new Error('make is required but not found. Please install build tools first.');
    }
    
    // Create temporary directory
    const tmpDirResult = spawnSync('mktemp', ['-d'], { encoding: 'utf8' });
    if (tmpDirResult.status !== 0) {
        throw new Error('Failed to create temporary directory');
    }
    const tmpDir = tmpDirResult.stdout.trim();
    
    console.log(`Using temporary directory: ${tmpDir}`);
    
    try {
        // Clone repository
        console.log('Cloning whisper.cpp repository...');
        exec(`git clone https://github.com/ggerganov/whisper.cpp.git ${tmpDir}/whisper.cpp`);
        
        // Build
        console.log('Building whisper.cpp...');
        exec('make', { cwd: `${tmpDir}/whisper.cpp` });
        
        // Install
        const installDir = '/usr/local/bin';
        const binaryPath = join(tmpDir, 'whisper.cpp', 'main');
        const targetPath = join(installDir, 'whisper-cli');
        
        console.log('Installing whisper-cli...');
        
        try {
            // Try without sudo first
            exec(`cp ${binaryPath} ${targetPath}`);
            exec(`chmod +x ${targetPath}`);
        } catch (error) {
            // If that fails, try with sudo
            console.log('Need elevated permissions...');
            exec(`sudo cp ${binaryPath} ${targetPath}`);
            exec(`sudo chmod +x ${targetPath}`);
        }
        
        console.log('✓ whisper-cli successfully installed');
    } finally {
        // Cleanup
        try {
            exec(`rm -rf ${tmpDir}`);
        } catch (e) {
            console.warn(`Warning: Could not clean up temporary directory ${tmpDir}`);
        }
    }
}

/**
 * Install whisper.cpp on Windows
 * @returns {Promise<void>}
 */
async function installWindows() {
    console.log('Installing whisper.cpp on Windows...');
    
    // Check for required build tools
    if (!commandExists('git')) {
        throw new Error('git is required but not found. Please install git first.');
    }
    
    // Check for Visual Studio or MinGW
    const hasMSVC = commandExists('cl');
    const hasMingw = commandExists('gcc');
    
    if (!hasMSVC && !hasMingw) {
        console.error('\n❌ Build tools not found.');
        console.error('\nTo build whisper.cpp on Windows, you need either:');
        console.error('  1. Visual Studio with C++ tools, OR');
        console.error('  2. MinGW-w64 (gcc)');
        console.error('\nAlternatively, you can:');
        console.error('  - Download pre-built binaries from: https://github.com/ggerganov/whisper.cpp/releases');
        console.error('  - Rename the executable to whisper-cli.exe');
        console.error('  - Add it to your PATH\n');
        process.exit(1);
    }
    
    // Create temporary directory
    const tmpDirResult = spawnSync('cmd', ['/c', 'echo %TEMP%\\whisper-cpp-build'], { encoding: 'utf8' });
    const tmpDir = tmpDirResult.stdout.trim();
    
    try {
        // Clone repository
        console.log('Cloning whisper.cpp repository...');
        exec(`git clone https://github.com/ggerganov/whisper.cpp.git "${tmpDir}"`);
        
        // Build based on available compiler
        console.log('Building whisper.cpp...');
        if (hasMingw) {
            exec('make', { cwd: tmpDir });
        } else {
            // Use CMake with Visual Studio
            exec('cmake -B build', { cwd: tmpDir });
            exec('cmake --build build --config Release', { cwd: tmpDir });
        }
        
        console.log('\n✓ whisper.cpp built successfully');
        console.log('\nTo complete installation:');
        console.log(`  1. Copy the built executable from ${tmpDir}`);
        console.log('  2. Rename it to whisper-cli.exe');
        console.log('  3. Add it to a directory in your PATH');
        console.log('     (e.g., C:\\Program Files\\whisper-cpp\\)\n');
        
    } catch (error) {
        console.error('\n❌ Build failed.');
        console.error('\nYou can download pre-built binaries from:');
        console.error('https://github.com/ggerganov/whisper.cpp/releases\n');
        throw error;
    }
}

/**
 * Main installation function
 * @returns {Promise<void>}
 */
async function main() {
    console.log('Checking for whisper-cli installation...');
    
    // Check if whisper-cli is already available
    if (commandExists('whisper-cli')) {
        console.log('✓ whisper-cli is already installed');
        return;
    }
    
    console.log(`whisper-cli not found. Installing for ${PLATFORM}...`);
    
    try {
        if (IS_WINDOWS) {
            await installWindows();
        } else if (IS_MAC || IS_LINUX) {
            await installUnix();
        } else {
            throw new Error(`Unsupported platform: ${PLATFORM}`);
        }
        
        // Verify installation
        if (commandExists('whisper-cli')) {
            console.log('\n✅ Installation complete!');
            try {
                exec('whisper-cli --version');
            } catch {
                console.log('whisper-cli installed successfully');
            }
        }
    } catch (error) {
        console.error('\n❌ Installation failed:', error.message);
        console.error('\nPlease install whisper.cpp manually:');
        console.error('https://github.com/ggerganov/whisper.cpp\n');
        process.exit(1);
    }
}

main();

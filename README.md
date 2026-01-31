# whisper-js

A Node.js utility script that transcribes audio files using Whisper CLI. It can process individual audio files or recursively transcribe entire directories of audio files (mp3, ogg, wav, flac). The script includes configurable transcription parameters with sensible defaults for high-quality transcription.

## Prerequisites

- Node.js (v14 or higher)
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) CLI (`whisper-cli`) installed and available in your PATH
- A Whisper model file (see Model Download Instructions below)

### Installing whisper.cpp

Follow the installation instructions at [https://github.com/ggerganov/whisper.cpp](https://github.com/ggerganov/whisper.cpp) to build and install the `whisper-cli` binary.

## Installation

```bash
npm install
```

## Model Download Instructions

whisper-js uses Whisper models in GGML format. You can download these models from the official Hugging Face repository.

### Available Models

Models come in different sizes with varying accuracy and performance trade-offs:

| Model          | Size    | Description                  |
| -------------- | ------- | ---------------------------- |
| tiny           | 77.7 MB | Fastest, lowest accuracy     |
| tiny.en        | 77.7 MB | English-only tiny model      |
| base           | 148 MB  | Good balance for quick tasks |
| base.en        | 148 MB  | English-only base model      |
| small          | 488 MB  | Better accuracy              |
| small.en       | 488 MB  | English-only small model     |
| medium         | 1.53 GB | High accuracy (default)      |
| medium.en      | 1.53 GB | English-only medium model    |
| large-v1       | 3.09 GB | Highest accuracy (v1)        |
| large-v2       | 3.09 GB | Highest accuracy (v2)        |
| large-v3       | 3.1 GB  | Highest accuracy (v3)        |
| large-v3-turbo | 1.62 GB | Faster large model variant   |

Models also come in quantized versions (q5_0, q5_1, q8_0) which are smaller but may have slightly reduced accuracy.

### Downloading a Model

**Automatic Download (Recommended):**

The script will automatically download the default model (`ggml-medium.bin`) the first time you run it if it's not already present in `src/models/`. The download progress will be displayed in your terminal.

```bash
# Just run the command - the model will download automatically if needed
whisper-js path/to/audio.mp3
```

**Manual Download:**

If you prefer to download manually or want a different model:

1. **Using curl or wget:**

    Download the medium model (default):

    ```bash
    curl -L https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin -o src/models/ggml-medium.bin
    ```

    Or for a smaller/faster model (base):

    ```bash
    curl -L https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin -o src/models/ggml-base.bin
    ```

2. **Direct download from browser:**

    Visit [https://huggingface.co/ggerganov/whisper.cpp/tree/main](https://huggingface.co/ggerganov/whisper.cpp/tree/main) and click on the model file you want, then click the download button.

3. **Save the model:**

    Place the downloaded model in the `src/models/` directory of this project:

    ```bash
    mkdir -p src/models
    mv ggml-medium.bin src/models/
    ```

### Recommended Models

- **For quick testing**: `ggml-base.bin` (148 MB)
- **For production/quality**: `ggml-medium.bin` (1.53 GB) - default
- **For best accuracy**: `ggml-large-v3.bin` (3.1 GB)
- **For English-only audio**: Use `.en` variants for better performance

## Usage

### As a CLI tool

```bash
# Transcribe a single file
whisper-js path/to/audio.mp3

# Transcribe all audio files in a directory
whisper-js path/to/audio/directory

# Show help
whisper-js --help
```

### As a library

```javascript
import { transcribe, ensureModel } from 'whisper-js';

// Transcribe with default settings
transcribe('path/to/audio.mp3');

// Transcribe with custom arguments
transcribe('path/to/audio.mp3', '--model', 'path/to/model.bin', '--language', 'es');

// Ensure a model is downloaded before using it
await ensureModel('src/models/ggml-base.bin', 'ggml-base.bin');
transcribe('path/to/audio.mp3', '--model', 'src/models/ggml-base.bin');
```

## Configuration

The script uses the following default parameters for high-quality transcription:

| Parameter         | Default Value                | Description                                       |
| ----------------- | ---------------------------- | ------------------------------------------------- |
| `--model`         | `src/models/ggml-medium.bin` | Path to the Whisper model file                    |
| `--language`      | `en`                         | Language code (e.g., en, es, fr, de)              |
| `--temperature`   | `0.1`                        | Sampling temperature (lower = more deterministic) |
| `--best-of`       | `2`                          | Number of candidates to consider                  |
| `--beam-size`     | `2`                          | Beam search width                                 |
| `--word-thold`    | `0.01`                       | Word timestamp threshold                          |
| `--entropy-thold` | `2.4`                        | Entropy threshold for fallback                    |
| `--logprob-thold` | `-1.0`                       | Log probability threshold                         |
| `--no-fallback`   | `true`                       | Disable temperature fallback                      |
| `--output-txt`    | `true`                       | Generate .txt transcription                       |
| `--output-srt`    | `true`                       | Generate .srt subtitle file                       |

You can override any of these parameters when calling the script:

```bash
whisper-js audio.mp3 --language es --model src/models/ggml-large-v3.bin
```

## Supported Audio Formats

- MP3 (`.mp3`)
- OGG (`.ogg`)
- WAV (`.wav`)
- FLAC (`.flac`)

## Output

The script generates two output files for each transcribed audio file:

- `.txt` - Plain text transcription
- `.srt` - Subtitle file with timestamps

Both files are created in the same directory as the source audio file.

## License

MIT

## Author

Alexander Porrello

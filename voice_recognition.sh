#!/bin/bash
# 本地语音识别脚本 - 使用 whisper.cpp

WHISPER_DIR="/root/.openclaw/workspace/whisper.cpp"
MODEL="$WHISPER_DIR/models/ggml-base.bin"
AUDIO_FILE="$1"

if [ -z "$AUDIO_FILE" ]; then
    echo "Usage: $0 <audio_file>"
    exit 1
fi

if [ ! -f "$AUDIO_FILE" ]; then
    echo "Error: Audio file not found: $AUDIO_FILE"
    exit 1
fi

# 使用 whisper.cpp 进行识别
"$WHISPER_DIR/build/bin/whisper-cli" \
    -m "$MODEL" \
    -f "$AUDIO_FILE" \
    -l zh \
    --no-timestamps 2>/dev/null | grep -v "^whisper_" | grep -v "^system_info" | grep -v "^main:" | tail -1

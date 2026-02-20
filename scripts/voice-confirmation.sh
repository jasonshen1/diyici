#!/bin/bash
# 语音识别确认交互脚本
# 用于处理中等置信度的语音识别结果

CONFIDENCE="$1"
RECOGNIZED_TEXT="$2"
shift 2
ALTERNATIVES="$@"

echo "🎤 语音转文字："
echo "\"$RECOGNIZED_TEXT\""
echo ""
echo "置信度：${CONFIDENCE}%"
echo ""

# 检查是否在纠错词典中
CORRECTIONS_FILE="$HOME/.openclaw/workspace/config/voice-recognition-config.json"

if command -v jq >/dev/null 2>&1; then
    # 尝试自动校正
    CORRECTED=$(jq -r --arg text "$RECOGNIZED_TEXT" '.voice_recognition.correction_map[$text] // empty' "$CORRECTIONS_FILE" 2>/dev/null | jq -r '.[0] // empty')
    
    if [ -n "$CORRECTED" ] && [ "$CORRECTED" != "null" ]; then
        echo "🤔 自动识别你可能想说：\"$CORRECTED\""
        echo ""
    fi
fi

echo "请确认你的意思："
echo ""

# 显示主要识别结果
echo "[1] $RECOGNIZED_TEXT ✅"

# 显示备选（如果有）
IFS='|' read -ra ALT_ARRAY <<< "$ALTERNATIVES"
INDEX=2
for alt in "${ALT_ARRAY[@]}"; do
    if [ -n "$alt" ] && [ "$alt" != "$RECOGNIZED_TEXT" ]; then
        echo "[$INDEX] $alt"
        INDEX=$((INDEX + 1))
    fi
done

echo ""
echo "[0] 都不对，用文字输入"
echo ""
echo "请回复数字确认："

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR
import shutil
import os
import uuid

app = FastAPI(title="PaddleOCR Service")

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 OCR（首次启动会下载模型，需要一些时间）
print("正在加载 PaddleOCR 模型，请稍候...")
ocr = PaddleOCR(lang='ch')
print("PaddleOCR 模型加载完成！")

@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    """
    识别图片中的文字
    """
    try:
        # 生成临时文件名
        file_id = str(uuid.uuid4())
        temp_path = f"/tmp/ocr_{file_id}_{file.filename}"
        
        # 保存上传的文件
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 执行 OCR
        result = ocr.ocr(temp_path)
        
        # 提取文字
        texts = []
        if result and result[0]:
            for line in result[0]:
                if line:
                    text = line[1][0]  # 文字内容
                    confidence = line[1][1]  # 置信度
                    texts.append({
                        "text": text,
                        "confidence": round(float(confidence), 4)
                    })
        
        # 删除临时文件
        os.remove(temp_path)
        
        # 合并所有文字
        full_text = "\n".join([t["text"] for t in texts])
        
        return {
            "success": True,
            "text": full_text,
            "lines": texts,
            "line_count": len(texts)
        }
        
    except Exception as e:
        # 清理临时文件
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return {
            "success": False,
            "error": str(e),
            "text": "",
            "lines": [],
            "line_count": 0
        }

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "service": "paddle-ocr"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
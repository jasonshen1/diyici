import * as fs from 'fs';
import * as path from 'path';

// 动态导入，避免启动时加载
let pdfParse: any;
let mammoth: any;

async function loadDependencies() {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse')).default;
  }
  if (!mammoth) {
    mammoth = await import('mammoth');
  }
}

export class DocumentService {
  // 提取 PDF 文本内容
  static async extractPDF(filePath: string): Promise<{ text: string; pages: number }> {
    await loadDependencies();
    
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      return {
        text: data.text?.trim() || '',
        pages: data.numpages || 0
      };
    } catch (error) {
      console.error('[Document] PDF 提取失败:', error);
      throw new Error('PDF 内容提取失败');
    }
  }

  // 提取 Word 文档文本内容
  static async extractWord(filePath: string): Promise<{ text: string; type: string }> {
    await loadDependencies();
    
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      
      return {
        text: result.value?.trim() || '',
        type: path.extname(filePath).toLowerCase() === '.docx' ? 'docx' : 'doc'
      };
    } catch (error) {
      console.error('[Document] Word 提取失败:', error);
      throw new Error('Word 文档内容提取失败');
    }
  }

  // 提取 TXT/Markdown 文本内容
  static async extractText(filePath: string): Promise<string> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return content.trim();
    } catch (error) {
      console.error('[Document] 文本读取失败:', error);
      throw new Error('文本文件读取失败');
    }
  }

  // 智能提取 - 根据文件类型自动选择方法
  static async extract(filePath: string): Promise<{ text: string; type: string; meta?: any }> {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.pdf':
        const pdfResult = await this.extractPDF(filePath);
        return {
          text: pdfResult.text,
          type: 'pdf',
          meta: { pages: pdfResult.pages }
        };
        
      case '.doc':
      case '.docx':
        const wordResult = await this.extractWord(filePath);
        return {
          text: wordResult.text,
          type: wordResult.type
        };
        
      case '.txt':
      case '.md':
      case '.markdown':
        const text = await this.extractText(filePath);
        return {
          text,
          type: ext === '.md' || ext === '.markdown' ? 'markdown' : 'text'
        };
        
      default:
        throw new Error(`不支持的文件格式: ${ext}`);
    }
  }
}

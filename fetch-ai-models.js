#!/usr/bin/env node
/**
 * AI模型信息搜索工具
 * 搜索2026年最新AI模型资讯
 */

const puppeteer = require('puppeteer');

async function fetchLatestAIModels() {
  console.log('🔍 正在搜索2026年最新AI模型信息...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // 1. 搜索 Claude 最新版本
    console.log('📌 Claude 最新版本信息:');
    try {
      await page.goto('https://www.anthropic.com/claude', { timeout: 15000 });
      await new Promise(r => setTimeout(r, 3000));
      const claudeInfo = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
        return headings.slice(0, 3).map(h => h.textContent?.trim()).filter(Boolean);
      });
      console.log(claudeInfo.join('\n') || '  无法获取信息');
    } catch (e) {
      console.log('  获取失败:', e.message);
    }
    
    console.log('\n📌 OpenAI 最新版本信息:');
    try {
      await page.goto('https://openai.com/models', { timeout: 15000 });
      await new Promise(r => setTimeout(r, 3000));
      const openaiInfo = await page.evaluate(() => {
        const models = Array.from(document.querySelectorAll('h2, h3'));
        return models.slice(0, 3).map(m => m.textContent?.trim()).filter(Boolean);
      });
      console.log(openaiInfo.join('\n') || '  无法获取信息');
    } catch (e) {
      console.log('  获取失败:', e.message);
    }
    
    console.log('\n📌 Google Gemini 最新版本信息:');
    try {
      await page.goto('https://deepmind.google/gemini/', { timeout: 15000 });
      await new Promise(r => setTimeout(r, 3000));
      const geminiInfo = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2'));
        return headings.slice(0, 3).map(h => h.textContent?.trim()).filter(Boolean);
      });
      console.log(geminiInfo.join('\n') || '  无法获取信息');
    } catch (e) {
      console.log('  获取失败:', e.message);
    }
    
  } catch (error) {
    console.error('❌ 搜索失败:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n✅ 搜索完成');
}

fetchLatestAIModels();

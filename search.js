#!/usr/bin/env node
/**
 * 网页搜索脚本 - 使用 Puppeteer
 * 用法: node search.js "搜索关键词"
 */

const puppeteer = require('puppeteer');

async function search(query) {
  console.log(`🔍 搜索: ${query}\n`);
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    
    // 使用 Google 搜索
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // 提取搜索结果
    const results = await page.evaluate(() => {
      const items = [];
      const searchResults = document.querySelectorAll('div.g');
      
      for (let i = 0; i < Math.min(5, searchResults.length); i++) {
        const title = searchResults[i].querySelector('h3')?.textContent || '';
        const link = searchResults[i].querySelector('a')?.href || '';
        const snippet = searchResults[i].querySelector('div.VwiC3b')?.textContent || '';
        
        if (title) {
          items.push({ title, link, snippet });
        }
      }
      return items;
    });
    
    // 输出结果
    results.forEach((result, i) => {
      console.log(`${i + 1}. ${result.title}`);
      console.log(`   ${result.snippet}`);
      console.log(`   ${result.link}\n`);
    });
    
  } catch (error) {
    console.error('❌ 搜索失败:', error.message);
  } finally {
    await browser.close();
  }
}

// 获取命令行参数
const query = process.argv.slice(2).join(' ');
if (!query) {
  console.log('用法: node search.js "搜索关键词"');
  process.exit(1);
}

search(query);

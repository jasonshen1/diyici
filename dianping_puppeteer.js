const puppeteer = require('puppeteer');

const COOKIE_STR = '_lxsdk_cuid=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _lxsdk=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _hc.v=c8895c86-0b46-0e4a-d084-d26182e02b1f.1746277859; _lx_utm=utm_source%3Dgoogle%26utm_medium%3Dorganic; fspop=test; qruuid=11c2ade1-963e-461a-9a9c-a86d47882e3b; WEBDFPID=68962zz3vv01503v001u31428x5v738080x48y75wu457958817160vy-1770983563885-1770897158343OKIQAQE75613c134b6a252faa6802015be905514115; utm_source_rg=AM%2556yJkJ6%25358%2552Y57UUukkXCQXukXXCFuCr72JQkhu2X2XJr2ehQRFrQhYQ22ChC5Xke; ll=7fd06e815b796be3df069dec7836c3df; ua=%E6%9C%B4%E5%AE%9E%E6%97%A0%E5%8D%8E%E7%9A%84%E7%BE%8E%E9%A3%9F%E5%AE%B6; ctu=4058642c404a5aab140bc3845fa48721461f339265459eee86b07b8d406b890e; logan_session_token=0sycn0ix0w636k4y3f7c; _lxsdk_s=19c51b21a6e-20-dd3-a3%7C%7C47';

async function scrape(url) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--disable-blink-features=AutomationControlled',
        ]
    });
    
    const page = await browser.newPage();
    
    // 反检测脚本
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        window.chrome = { runtime: {} };
    });
    
    try {
        console.error('🎯 访问:', url);
        
        // 先访问首页
        await page.goto('https://m.dianping.com/dphome', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 2000));
        
        // 设置 Cookie
        const cookies = COOKIE_STR.split(';').map(c => {
            const [name, value] = c.trim().split('=', 2);
            return { name, value, domain: '.dianping.com' };
        }).filter(c => c.name && c.value);
        
        await page.setCookie(...cookies);
        
        // 访问目标
        await page.goto(url, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 5000));
        
        const title = await page.title();
        const content = await page.evaluate(() => document.body.innerText);
        
        await browser.close();
        
        const blocked = content.includes('登录') && content.includes('扫码');
        
        console.log(JSON.stringify({
            success: true,
            url,
            title,
            blocked,
            content: content.substring(0, 2000)
        }, null, 2));
        
    } catch (e) {
        await browser.close();
        console.log(JSON.stringify({ success: false, error: e.message }, null, 2));
    }
}

scrape(process.argv[2]);

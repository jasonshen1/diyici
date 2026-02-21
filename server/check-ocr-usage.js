const crypto = require('crypto');
const https = require('https');

// 腾讯云API信息
const SECRET_ID = process.env.TENCENT_SECRET_ID || '';
const SECRET_KEY = process.env.TENCENT_SECRET_KEY || '';
const SERVICE = 'ocr';
const HOST = 'ocr.tencentcloudapi.com';
const REGION = 'ap-guangzhou';
const ACTION = 'DescribeGeneralAccurateOCRUsage';
const VERSION = '2018-11-19';

function sha256(message, secret = '') {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

function getHash(message) {
  return crypto.createHash('sha256').update(message).digest('hex');
}

function getDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toISOString().split('T')[0];
}

function queryOCRUsage() {
  const timestamp = Math.floor(Date.now() / 1000);
  const date = getDate(timestamp);
  
  // 请求参数
  const payload = JSON.stringify({
    StartDate: '2026-02-01',
    EndDate: '2026-02-21'
  });
  
  const payloadHash = getHash(payload);
  
  // 构造规范请求
  const httpRequestMethod = 'POST';
  const canonicalUri = '/';
  const canonicalQueryString = '';
  const canonicalHeaders = `content-type:application/json\nhost:${HOST}\nx-tc-action:${ACTION.toLowerCase()}\n`;
  const signedHeaders = 'content-type;host;x-tc-action';
  
  const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  
  // 构造待签名字符串
  const algorithm = 'TC3-HMAC-SHA256';
  const credentialScope = `${date}/${SERVICE}/tc3_request`;
  const hashedCanonicalRequest = getHash(canonicalRequest);
  
  const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;
  
  // 计算签名
  const secretDate = sha256(date, 'TC3' + SECRET_KEY);
  const secretService = sha256(SERVICE, Buffer.from(secretDate, 'hex'));
  const secretSigning = sha256('tc3_request', Buffer.from(secretService, 'hex'));
  const signature = sha256(stringToSign, Buffer.from(secretSigning, 'hex'));
  
  // 构造Authorization
  const authorization = `${algorithm} Credential=${SECRET_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  // 构造请求头
  const headers = {
    'Content-Type': 'application/json',
    'Host': HOST,
    'X-TC-Action': ACTION,
    'X-TC-Version': VERSION,
    'X-TC-Timestamp': timestamp.toString(),
    'X-TC-Region': REGION,
    'Authorization': authorization
  };
  
  // 发送请求
  const options = {
    hostname: HOST,
    port: 443,
    path: '/',
    method: 'POST',
    headers: headers
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

queryOCRUsage().then(data => {
  console.log('OCR使用情况:');
  console.log(JSON.stringify(data, null, 2));
}).catch(err => {
  console.error('查询失败:', err.message);
});

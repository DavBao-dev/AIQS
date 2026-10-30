import {createHmac, timingSafeEqual,randomBytes} from 'node:crypto';
const COOKIE='aiqs_sheet_session';
const TTL=30*24*60*60;
function equal(a,b){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
function signature(value,key){return createHmac('sha256',key).update(value).digest('base64url');}
export function validCode(code,key=process.env.SHEET_ACCESS_TOKEN){return !!key&&typeof code==='string'&&equal(code,key);}
export function authorized(req,key=process.env.SHEET_ACCESS_TOKEN){
 if(!key)return false;
 const bearer=String(req.headers.authorization||'');
 if(bearer.startsWith('Bearer ')&&validCode(bearer.slice(7),key))return true;
 const cookie=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 if(!cookie||cookie.length>500)return false;
 const [payload,sig,...extra]=cookie.split('.');if(extra.length||!payload||!sig||!equal(sig,signature(payload,key)))return false;
 try{const body=JSON.parse(Buffer.from(payload,'base64url'));return body.exp>Date.now()&&body.exp<=Date.now()+TTL*1000+60000;}catch{return false;}
}
function localHost(req){return /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(String(req.headers.host||''));}
export function sameOrigin(req){
 if(req.headers['sec-fetch-site']==='cross-site')return false;
 const origin=req.headers.origin;if(!origin)return req.method==='GET';
 try{return new URL(origin).host===req.headers.host;}catch{return false;}
}
export function setSession(req,res,clear=false){
 const payload=Buffer.from(JSON.stringify({exp:Date.now()+TTL*1000,nonce:randomBytes(16).toString('hex')})).toString('base64url');
 const value=clear?'signed-out':payload+'.'+signature(payload,process.env.SHEET_ACCESS_TOKEN);
 res.setHeader('Set-Cookie',`${COOKIE}=${value}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${TTL}${localHost(req)?'':'; Secure'}`);
}
export function localBootstrap(req){
 return !String(req.headers.cookie||'').split(';').some(v=>v.trim()===COOKIE+'=signed-out')&&req.localPreview===true&&localHost(req)&&['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket?.remoteAddress)&&req.headers['sec-fetch-site']==='same-origin';
}

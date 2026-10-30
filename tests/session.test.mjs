import test from 'node:test';import assert from 'node:assert/strict';
import handler from '../api/session.js';import {authorized,localBootstrap} from '../lib/session.js';
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(v){this.body=v;}};}
test('persistent HttpOnly session survives new requests, rejects tampering, and logs out',async()=>{
 const old=process.env.SHEET_ACCESS_TOKEN;process.env.SHEET_ACCESS_TOKEN='private-dashboard-code';
 try{
 const login={method:'POST',headers:{host:'aiqs.example',origin:'https://aiqs.example'},body:{code:'private-dashboard-code'}};
 const res=response();await handler(login,res);assert.equal(res.code,200);
 const set=res.headers['Set-Cookie'];assert.ok(set.includes('HttpOnly'));assert.ok(set.includes('SameSite=Strict'));assert.ok(set.includes('Max-Age=2592000'));assert.ok(set.includes('; Secure'));assert.ok(!set.includes('private-dashboard-code'));
 const cookie=set.split(';')[0];assert.ok(authorized({headers:{cookie}}));assert.ok(!authorized({headers:{cookie:cookie+'corrupted'}}));
 const session=response();await handler({method:'GET',headers:{host:'aiqs.example',cookie}},session);assert.equal(session.body.connected,true);
 const cross=response();await handler({...login,headers:{...login.headers,origin:'https://other.example'}},cross);assert.equal(cross.code,403);
 const logout=response();await handler({method:'DELETE',headers:login.headers},logout);assert.ok(logout.headers['Set-Cookie'].includes('=signed-out;'));assert.ok(!authorized({headers:{cookie:logout.headers['Set-Cookie'].split(';')[0]}}));
 process.env.SHEET_ACCESS_TOKEN='rotated';assert.ok(!authorized({headers:{cookie}}));
 }finally{if(old===undefined)delete process.env.SHEET_ACCESS_TOKEN;else process.env.SHEET_ACCESS_TOKEN=old;}
});
test('automatic sign-in is restricted to the local preview server and same-origin loopback',()=>{
 const req={localPreview:true,headers:{host:'127.0.0.1:4173','sec-fetch-site':'same-origin'},socket:{remoteAddress:'127.0.0.1'}};
 assert.ok(localBootstrap(req));assert.ok(!localBootstrap({...req,localPreview:false}));assert.ok(!localBootstrap({...req,headers:{...req.headers,'sec-fetch-site':'cross-site'}}));assert.ok(!localBootstrap({...req,socket:{remoteAddress:'203.0.113.1'}}));
 assert.ok(!localBootstrap({...req,headers:{...req.headers,cookie:'aiqs_sheet_session=signed-out'}}));
});

import test from 'node:test';import assert from 'node:assert/strict';import handler from '../api/chat.js';
const invoke=async(body,authorization='Bearer test-token',method='POST')=>{const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(s){this.code=s;return this;},json(b){this.body=b;return this;}};await handler({method,headers:{authorization},body},res);return res;};
test('API validation, authentication, and bounded inference',async()=>{
 const env={...process.env};const originalFetch=global.fetch;
 try{
  for(const k of ['MODEL_BASE_URL','MODEL_NAME','MODEL_API_KEY','APP_ACCESS_TOKEN'])delete process.env[k];
  assert.equal((await invoke({})).code,503);
  Object.assign(process.env,{MODEL_BASE_URL:'https://model.example/v1',MODEL_NAME:'small-model',MODEL_API_KEY:'server-secret',APP_ACCESS_TOKEN:'test-token'});
  assert.equal((await invoke({},'bad')).code,401);
  assert.equal((await invoke({},undefined,'GET')).code,405);
  assert.equal((await invoke({question:'',snapshot:{}})).code,400);
  assert.equal((await invoke({question:'x'.repeat(1501),snapshot:{}})).code,400);
  global.fetch=async(url,opts)=>{assert.equal(String(url),'https://model.example/v1/chat/completions');assert.equal(opts.headers.Authorization,'Bearer server-secret');assert.equal(JSON.parse(opts.body).model,'small-model');return {ok:true,json:async()=>({choices:[{message:{content:'Ưu tiên F1.'}}]})};};
  const good=await invoke({question:'Việc nào?',snapshot:{tasks:[]}});assert.equal(good.code,200);assert.equal(good.body.answer,'Ưu tiên F1.');assert.equal(good.headers['Cache-Control'],'no-store');
  global.fetch=async()=>({ok:false});assert.equal((await invoke({question:'Việc nào?',snapshot:{}})).code,502);
 }finally{global.fetch=originalFetch;for(const k of ['MODEL_BASE_URL','MODEL_NAME','MODEL_API_KEY','APP_ACCESS_TOKEN'])if(env[k]===undefined)delete process.env[k];else process.env[k]=env[k];}
});

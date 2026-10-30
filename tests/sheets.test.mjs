import test from 'node:test';import assert from 'node:assert/strict';
import {mapTimeline,sheetDate} from '../lib/sheets.js';
import handler from '../api/sheet.js';
const header=['NGÀY ĐĂNG','CODE','TIÊU ĐỀ','','','','','','','IC','','','','','IC'];
test('maps explicit assignments only; no invented progress, due dates, or photo work',()=>{
 const r=[46326,'AP2','Bài đăng','Thiết kế','','','','','','Người viết',46325,'https://example.com/doc','','','Người thiết kế'];
 const d=mapTimeline([header,r]);assert.equal(d.posts.length,1);assert.equal(d.tasks.length,2);assert.equal(d.posts[0].date,'2026-10-31');assert.equal(d.tasks[0].due,'2026-10-30');assert.equal(d.tasks[1].due,'');assert.ok(d.tasks.every(t=>t.status==='Chưa cập nhật'));assert.equal(d.source.statusAvailable,false);
 assert.equal(mapTimeline([header,[46326,'AP2','Bài đăng']]).tasks.length,0);
 const duplicated=mapTimeline([header,r,r]);assert.equal(new Set(duplicated.posts.map(p=>p.id)).size,2);assert.deepEqual(duplicated.source.duplicateCodes,['AP2']);assert.throws(()=>mapTimeline([['Other header']]),/SCHEMA/);assert.equal(sheetDate('Fri 30.10'),'');
});
test('private Sheet endpoint refuses unauthenticated reads and writes',async()=>{
 const original=process.env.SHEET_ACCESS_TOKEN;process.env.SHEET_ACCESS_TOKEN='private';
 try{for(const [method,code] of [['GET',401],['POST',405]]){const res={setHeader(){},status(c){this.code=c;return this;},json(){}};await handler({method,headers:{}},res);assert.equal(res.code,code);}}finally{if(original===undefined)delete process.env.SHEET_ACCESS_TOKEN;else process.env.SHEET_ACCESS_TOKEN=original;}
});

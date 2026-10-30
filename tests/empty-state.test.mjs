import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8').replace(/^(render|restoreSession)\(\);\s*$/gm,'');
test('supplied posts only; old samples never migrate; all views tolerate empty tasks',()=>{
 const requested=[];const ctx=vm.createContext({localStorage:{getItem:key=>{requested.push(key);return null;}},setInterval(){},Intl,Date,console});vm.runInContext(source,ctx);
 assert.deepEqual(requested,['aiqs-project-v2']);
 assert.equal(vm.runInContext('data.tasks.length',ctx),0);assert.equal(vm.runInContext('data.posts.length',ctx),12);assert.equal(vm.runInContext('data.posts.some(p=>p.published)',ctx),false);
 for(const fn of ['dashboard','workflow','timeline','members','phases']){const html=vm.runInContext(fn+'()',ctx);assert.ok(!html.includes('NaN'));assert.ok(!html.includes('Thành viên Nội dung 01'));}
 assert.equal(vm.runInContext('readiness(data.posts[0])',ctx),'Chưa có dữ liệu tiến độ');
 assert.ok(vm.runInContext('timeline()',ctx).includes('Chưa có công việc'));
});
test('Sheet refresh and source switches preserve existing browser tasks and storage',()=>{
 const original={posts:[],tasks:[{id:'existing-user-task',title:'Existing task',owner:'Member',due:'2026-11-01',status:'Đang làm',phase:1,track:'Thiết kế',deps:[]}],activity:[]};
 const writes=[];const ctx=vm.createContext({localStorage:{getItem:()=>JSON.stringify(original),setItem:(key,value)=>writes.push(JSON.parse(value))},setInterval(){},Intl,Date,console});
 vm.runInContext(source,ctx);vm.runInContext('render=()=>{};toast=()=>{};',ctx);
 assert.equal(vm.runInContext('sourceMode',ctx),'local');
 const sheet={posts:[],tasks:[{id:'SHEET-C',status:'Chưa cập nhật'}],activity:[],source:{}};
 ctx.incoming=sheet;vm.runInContext('applySheet(incoming)',ctx);
 assert.equal(vm.runInContext('data.tasks[0].id',ctx),'existing-user-task');
 vm.runInContext("selectSource('sheet');save('should not persist Sheet');",ctx);assert.equal(writes.length,0);
 vm.runInContext("selectSource('local');save('user update');",ctx);assert.equal(writes.length,1);assert.equal(writes[0].tasks[0].id,'existing-user-task');assert.equal(writes[0].tasks.length,1);
 vm.runInContext("applySheet({posts:[],tasks:[],activity:[],source:{}});selectSource('local');",ctx);assert.equal(vm.runInContext('data.tasks[0].id',ctx),'existing-user-task');
});

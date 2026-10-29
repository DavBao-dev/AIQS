import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8').replace(/render\(\);\s*$/,'');
test('supplied posts only; old samples never migrate; all views tolerate empty tasks',()=>{
 const requested=[];const ctx=vm.createContext({localStorage:{getItem:key=>{requested.push(key);return null;}},Intl,Date,console});vm.runInContext(source,ctx);
 assert.deepEqual(requested,['aiqs-project-v2']);
 assert.equal(vm.runInContext('data.tasks.length',ctx),0);assert.equal(vm.runInContext('data.posts.length',ctx),12);assert.equal(vm.runInContext('data.posts.some(p=>p.published)',ctx),false);
 for(const fn of ['dashboard','workflow','timeline','members','phases']){const html=vm.runInContext(fn+'()',ctx);assert.ok(!html.includes('NaN'));assert.ok(!html.includes('Thành viên Nội dung 01'));}
 assert.equal(vm.runInContext('readiness(data.posts[0])',ctx),'Chưa có dữ liệu tiến độ');
 assert.ok(vm.runInContext('timeline()',ctx).includes('Chưa có công việc'));
});

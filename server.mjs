import http from 'node:http';
import {readFile} from 'node:fs/promises';
import handler from './api/chat.js';
import sheetHandler from './api/sheet.js';
import sessionHandler from './api/session.js';
const allowed={'/':'index.html','/app.js':'app.js','/style.css':'style.css'};
http.createServer(async(req,res)=>{
  if(req.url==='/api/session'){
    let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>2000){res.writeHead(413);res.end();return;}}
    req.body=raw;req.localPreview=true;
    res.status=code=>{res.statusCode=code;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};return sessionHandler(req,res);
  }
  if(req.url==='/api/sheet'){
    res.status=code=>{res.statusCode=code;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};return sheetHandler(req,res);
  }
  if(req.url==='/api/chat'){
    let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>60000){res.writeHead(413);res.end();return;}}
    req.body=raw;res.status=code=>{res.statusCode=code;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};return handler(req,res);
  }
  const file=allowed[req.url?.split('?')[0]];if(!file){res.writeHead(404);res.end('Not found');return;}
  try{const data=await readFile(new URL('./dist/'+file,import.meta.url));res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html; charset=utf-8');res.end(data);}catch{res.writeHead(500);res.end('Unable to load app');}
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));

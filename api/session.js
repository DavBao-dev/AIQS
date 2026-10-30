import {authorized,validCode,sameOrigin,setSession,localBootstrap} from '../lib/session.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');
 if(!['GET','POST','DELETE'].includes(req.method))return res.status(405).json({error:'Phương thức không hỗ trợ.'});
 if(!sameOrigin(req))return res.status(403).json({error:'Yêu cầu khác nguồn bị từ chối.'});
 if(!process.env.SHEET_ACCESS_TOKEN)return res.status(503).json({error:'Máy chủ chưa cấu hình kết nối Sheet.'});
 if(req.method==='GET'){
  const connected=authorized(req)||localBootstrap(req);
  if(connected&&!authorized(req))setSession(req,res);
  return res.status(200).json({connected});
 }
 if(req.method==='DELETE'){setSession(req,res,true);return res.status(200).json({connected:false});}
 let body=req.body;try{if(typeof body==='string')body=JSON.parse(body);}catch{return res.status(400).json({error:'Dữ liệu không hợp lệ.'});}
 if(!validCode(body?.code))return res.status(401).json({error:'Mã truy cập chưa đúng.'});
 setSession(req,res);return res.status(200).json({connected:true});
}

import {authorized} from '../lib/session.js';
import {readTimeline} from '../lib/sheets.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Chỉ hỗ trợ đọc dữ liệu.'});
 const key=process.env.SHEET_ACCESS_TOKEN;
 if(!key)return res.status(503).json({error:'Kết nối Sheet chưa được cấu hình.'});
 if(!authorized(req))return res.status(401).json({error:'Kết nối lại dashboard để đọc Sheet.'});
 try{return res.status(200).json(await readTimeline());}
 catch(e){const code=e.response?.status;const message=code===403?'Tài khoản dịch vụ chưa có quyền xem Sheet hoặc Sheets API chưa bật.':code===404?'Không tìm thấy Sheet.':e.message==='SHEET_SCHEMA_CHANGED'?'Cấu trúc cột Sheet đã đổi; cần cập nhật ánh xạ.':e.message==='DUPLICATE_POST_CODE'?'Có mã bài đăng trùng nhau trong Sheet.':'Chưa đọc được Google Sheet. Kiểm tra cấu hình tài khoản dịch vụ.';return res.status(502).json({error:message});}
}

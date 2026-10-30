import {GoogleAuth} from 'google-auth-library';
export const SHEET_ID='1divLgTHaMXj4qXncCUQ5XIwwC8pa2sxB7yMHZF2LAiQ';
export const SHEET_URL=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=796366321`;
export function sheetDate(value){
 if(typeof value==='number'&&Number.isFinite(value))return new Date(Date.UTC(1899,11,30)+Math.floor(value)*86400000).toISOString().slice(0,10);
 if(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value))return value;
 return '';
}
export function mapTimeline(rows){
 const header=rows[0]||[];
 if(header[0]!=='NGÀY ĐĂNG'||header[2]!=='TIÊU ĐỀ'||header[9]!=='IC'||header[14]!=='IC')throw Error('SHEET_SCHEMA_CHANGED');
 const posts=[],tasks=[],codes=new Set();
 for(let i=1;i<rows.length;i++){
  const r=rows[i],title=String(r[2]||'').trim();if(!title)continue;
  const code=String(r[1]||'').trim(),id=code||`ROW-${i+2}`;
  if(codes.has(id))throw Error('DUPLICATE_POST_CODE');codes.add(id);
  const sourceUrl=SHEET_URL+`&range=A${i+2}:R${i+2}`;
  posts.push({id,title,date:sheetDate(r[0]),published:false,type:String(r[3]||''),sourceUrl});
  // Only explicit IC assignments create dashboard work entries. No inferred people, completion, or deadlines.
  for(const [track,col,dueCol,productCol,suffix] of [['Nội dung',9,10,11,'C'],['Photo',12,13,null,'P'],['Thiết kế',14,15,16,'D']]){
   const owner=String(r[col]||'').trim();if(!owner)continue;
   const rawLink=productCol===null?'':String(r[productCol]||'').trim();
   tasks.push({id:`${id}-${suffix}`,post:id,title:`${track} · ${title}`,track,phase:track==='Photo'?1:2,owner,reviewer:'Chưa chỉ định',due:sheetDate(r[dueCol]),status:'Chưa cập nhật',deps:[],link:/^https?:\/\//.test(rawLink)?rawLink:'',sourceUrl,sourceRow:i+2});
  }
 }
 return {posts,tasks,activity:[],source:{url:SHEET_URL,sheet:'TIMELINE',fetchedAt:new Date().toISOString(),statusAvailable:false,warning:'Sheet chưa có cột trạng thái duyệt/đăng. Dashboard chỉ hiển thị phân công và hạn đã nhập; chưa thể kết luận hoàn thành hoặc quá hạn.'}};
}
export async function readTimeline(){
 const credentials=process.env.GOOGLE_SERVICE_ACCOUNT_JSON?JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON):undefined;
 const auth=new GoogleAuth({credentials,scopes:['https://www.googleapis.com/auth/spreadsheets.readonly']});
 const client=await auth.getClient();
 const url=`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent("'TIMELINE'!A2:R500")}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`;
 const result=await client.request({url,method:'GET',timeout:15000});
 return mapTimeline(result.data.values||[]);
}

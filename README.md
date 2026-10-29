# AIQS Project

Dashboard điều phối chiến dịch truyền thông của AIQS Project. Arecibo là chiến dịch tuyển thành viên, không phải tên tổ chức.

## Dữ liệu

Khởi tạo 12 bài và ngày đăng từ kế hoạch người dùng cung cấp. Không khởi tạo task, IC, deadline công việc, feedback, lịch sử hoặc trạng thái hoàn thành giả. Không nhập lại dữ liệu sample của bản prototype cũ. Trưởng ban tự thêm công việc trong Workflow; mỗi việc chỉ có thông tin do người dùng nhập. Quy trình tham chiếu nằm trong Giai đoạn, không tự sinh công việc.

Các mốc caption D−4/D−2, phân công wireframe/shotlist và mốc hình ảnh được trình bày theo tài liệu nội bộ đã đọc. Đây là hướng dẫn, không phải bằng chứng công việc được giao hoặc đã hoàn tất.

## Chạy

Node.js 22 trở lên: `npm run dev`, mở http://127.0.0.1:4173. Không cần thư viện bên ngoài.

`npm test` kiểm tra API, trạng thái rỗng và dữ liệu khởi tạo.

## Vercel và model có sẵn

Import repo vào Vercel, Framework Preset **Other**, Output Directory **dist**, bỏ trống build command. API Node.js nằm ở `api/chat.js`.

Biến môi trường server (xem `.env.example`):
- `MODEL_BASE_URL`: URL HTTPS API tương thích OpenAI, gồm tiền tố version, không gồm `/chat/completions`.
- `MODEL_NAME`: ID model có sẵn tại nhà cung cấp.
- `MODEL_API_KEY`: khóa nhà cung cấp, giữ phía server.
- `APP_ACCESS_TOKEN`: mã truy cập riêng bảo vệ API của ứng dụng; nhập qua nút Mã truy cập AI, chỉ lưu trong bộ nhớ phiên.

Không yêu cầu huấn luyện model. Chưa cấu hình provider/key thì dashboard vẫn chạy và AI hiện thông báo chưa kết nối. AI chỉ tư vấn từ snapshot hiện tại, không cập nhật dữ liệu. Không gửi feedback hoặc link sản phẩm đến model. Để chạy với cấu hình cục bộ: tạo `.env` rồi `node --env-file=.env server.mjs`.

Tài liệu Vercel: https://vercel.com/docs/functions/runtimes/node-js

## Giới hạn hiện tại

Dữ liệu lưu localStorage trên từng trình duyệt, chưa có backend lưu trữ chung hoặc đồng bộ Sheets. Chuyển vai Trưởng ban/Thành viên là chế độ giao diện, chưa phải xác thực/phân quyền thật. API AI có kiểm tra mã truy cập, input và timeout; chưa có rate limit phân tán. Trước khi mở rộng dùng chung cần bổ sung tài khoản, phân quyền server và database. Không có cơ chế nhắc việc tự gửi tin nhắn.

Xuất JSON để giữ bản sao dữ liệu. Chưa có chức năng nhập lại JSON. Không đưa tài liệu Drive nội bộ, dữ liệu cá nhân, khóa API hoặc ảnh prototype vào repo.

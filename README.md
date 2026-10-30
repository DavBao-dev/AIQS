# AIQS Project

## Kết nối Sheet → Dashboard

API `GET /api/sheet` đọc duy nhất `TIMELINE!A2:R500` của masterplan AIQS đã cấu hình trong `lib/sheets.js`. Xác thực Google bằng service account và scope `spreadsheets.readonly`. File Sheet phải được chia sẻ quyền Viewer cho service account. Không công khai Sheet.

Đặt `GOOGLE_APPLICATION_CREDENTIALS` tới JSON riêng khi chạy cục bộ; trên Vercel đặt secret `GOOGLE_SERVICE_ACCOUNT_JSON` thay cho đường dẫn. Đặt `SHEET_ACCESS_TOKEN` ngẫu nhiên để bảo vệ endpoint, nhập mã đó qua nút Kết nối Sheet. Không đưa khóa Google cho người dùng hoặc vào frontend. Sau khi xác thực, server cấp cookie phiên có chữ ký, HttpOnly, SameSite=Strict và thời hạn 30 ngày (Secure trên HTTPS). Không lưu mã truy cập hoặc khóa Google trong localStorage. Tải lại trang tự khôi phục phiên. Nút Ngắt kết nối kết thúc phiên trên trình duyệt đó.

Web có nút Làm mới và đọc lại mỗi 60 giây khi tab đang hiển thị, sau khi kết nối thành công. Lỗi đồng bộ giữ dữ liệu trước đó và báo chưa làm mới. Hai nguồn riêng: Từ Sheet và Trên web · máy này. Dữ liệu Sheet không ghi localStorage và không thay thế task cục bộ. Task cũ trong aiqs-project-v2 được giữ nguyên. Nếu có task trên web, mặc định tiếp tục hiển thị nguồn đó sau khi mở trang; nguồn Sheet vẫn được làm mới nền. Ở chế độ Sheet, các công việc chỉ xem và mở về đúng dòng Sheet để cập nhật.

Ánh xạ: A ngày đăng, B code, C tiêu đề, J/K/L IC–hạn–sản phẩm nội dung, M/N IC–ngày chụp Photo, O/P/Q IC–hạn–sản phẩm thiết kế. Chỉ các ô IC thực sự có tên mới tạo mục phân công trên dashboard. Không chia một ô chứa nhóm tên thành từng người vì chưa có quy ước. Code trùng được nhận diện theo từng dòng và hiển thị cảnh báo; thay đổi header sẽ báo lỗi.

Sheet hiện chưa có cột trạng thái duyệt/đăng: tất cả phân công đọc từ Sheet được ghi `Chưa cập nhật`. Không suy luận hoàn thành từ link sản phẩm và không kết luận quá hạn khi chưa biết trạng thái. Cần thống nhất schema trạng thái trước khi bổ sung theo dõi tiến độ đầy đủ. Backend chỉ đọc; chưa có đồng bộ ngược.

Dashboard điều phối chiến dịch truyền thông của AIQS Project. Arecibo là chiến dịch tuyển thành viên, không phải tên tổ chức.

## Dữ liệu

Khởi tạo 12 bài và ngày đăng từ kế hoạch người dùng cung cấp. Không khởi tạo task, IC, deadline công việc, feedback, lịch sử hoặc trạng thái hoàn thành giả. Không nhập lại dữ liệu sample của bản prototype cũ. Trưởng ban tự thêm công việc trong Workflow; mỗi việc chỉ có thông tin do người dùng nhập. Quy trình tham chiếu nằm trong Giai đoạn, không tự sinh công việc.

Các mốc caption D−4/D−2, phân công wireframe/shotlist và mốc hình ảnh được trình bày theo tài liệu nội bộ đã đọc. Đây là hướng dẫn, không phải bằng chứng công việc được giao hoặc đã hoàn tất.

## Chạy

Node.js 22 trở lên: cài dependencies từ pnpm-lock.yaml, chạy `npm run dev`, mở http://127.0.0.1:4173. Máy chủ preview chỉ lắng nghe loopback. Khi có cấu hình Sheet cục bộ, yêu cầu cùng nguồn từ chính máy này tự tạo phiên để mở bằng Chrome hay trình duyệt ứng dụng đều dùng được. Cơ chế này không chạy trong API Vercel; bản triển khai cần nhập mã một lần.

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

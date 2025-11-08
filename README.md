# ChatLawBot — Chatbot AI Tư Vấn Pháp Luật (Fullstack)

Mô tả: dự án mẫu React (frontend) + Node.js/Express (backend) cung cấp chatbot tư vấn pháp luật bằng tiếng Việt.

## Nội dung đã tạo
- backend/server.js — Express API xử lý form multipart, upload file tạm, gọi OpenAI
- backend/package.json
- frontend/src/components/ChatLawBot.jsx — React component (Tailwind-ready)
- public/avatar.html — demo avatar + TTS/STT frontend
- frontend/package.json
- vercel.json — cấu hình deploy cơ bản
- .env.example

## Chạy local (gợi ý)
1. Tạo 2 terminal:
  - Backend:
    cd backend
    npm install
    tạo file .env theo .env.example rồi chạy `npm run dev` (hoặc `npm start`)
  - Frontend:
    cd frontend
    npm install
    khởi chạy `npm run dev` (Vite) và cấu hình proxy `/api` tới backend (ví dụ trong vite.config.js)

## Biến môi trường
Xem `.env.example`. BẮT BUỘC: không commit `OPENAI_API_KEY` vào git.

## Deploy
- Tùy chọn: deploy frontend trên Vercel/Netlify, backend trên Render/Heroku, hoặc cả hai trên Vercel (cấu hình serverless hoặc Node server).
- Nếu deploy cả trên Vercel như one-repo, vercel.json có gợi ý; kiểm tra runtime Node và giới hạn file upload cho serverless.

## Bảo mật & vận hành
- Không lưu file người dùng lâu dài; quét virus; giới hạn loại/kích thước file.
- Không log dữ liệu nhạy cảm.
- Thêm rate limiter & monitoring, kiểm thử tải.
- Hiển thị disclaimer rõ ràng.

## Muốn mình làm tiếp?
- Mình có thể push các file này vào repo của bạn (tạo branch + commit) — cho mình tên branch và commit message.
- Hoặc mình có thể tạo PR, hoặc đóng gói zip để bạn download.
- Cần thêm: S3 direct upload example, PDF text extraction (pdf-parse), OCR (tesseract), hoặc serverless function cho Vercel? Mình làm tiếp theo yêu cầu.

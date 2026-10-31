# Hệ thống quản lý thiết bị phòng học trên nền tảng đám mây

- Sinh viên: Võ Văn Thuận
- MSSV: 211954
- Học phần: Điện toán đám mây

## Mô tả đề tài
Ứng dụng quản lý thiết bị phòng học: thêm, xem, tìm kiếm, cập nhật, xóa thiết bị và theo dõi tình trạng sử dụng (Đang sử dụng, Hư hỏng, Đang sửa chữa, Ngừng sử dụng).

## Công nghệ sử dụng
React (Vite), Node.js, Express, MongoDB Atlas, Git/GitHub, Docker, Docker Hub, Render.

## Cấu trúc dự án
    211954_VoVanThuan/
    ├── backend/    # Node.js + Express API
    ├── frontend/   # React (Vite)
    ├── .gitignore
    └── README.md

## Hướng dẫn cài đặt và chạy (local)
Backend:

    cd backend
    npm install
    cp .env.example .env     # sau đó điền chuỗi kết nối MongoDB Atlas
    npm start

Frontend:

    cd frontend
    npm install
    npm run dev

Backend chạy ở http://localhost:5000, frontend ở http://localhost:5173.

## Chạy backend bằng Docker
Image: https://hub.docker.com/r/vanthuan2411/backend

    docker pull vanthuan2411/backend:latest
    docker run -d --name backend -p 5000:5000 \
      -e MONGODB_URI="<chuoi-ket-noi-mongodb-atlas>" \
      -e CORS_ORIGIN="http://localhost:3000" \
      vanthuan2411/backend:latest

Tự build image:

    cd backend
    docker build -t vanthuan2411/backend:latest .
    docker push vanthuan2411/backend:latest

Kiểm tra: http://localhost:5000/health

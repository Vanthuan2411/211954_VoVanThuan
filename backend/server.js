require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Device = require('./models/Device');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: danh sách origin phân cách bằng dấu phẩy; để trống = cho phép tất cả
const origins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true }));
app.use(express.json());

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const FIELDS = ['deviceId', 'name', 'deviceType', 'room', 'brand', 'model', 'quantity', 'status', 'purchaseDate', 'description'];
const pick = (body = {}) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// Lỗi kết nối DB
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Không kết nối được cơ sở dữ liệu' });
  }
  next();
});

// Danh sách + tìm kiếm: /api/devices?search=projector
app.get('/api/devices', wrap(async (req, res) => {
  const { search, status } = req.query;
  const filter = {};
  if (status) filter.status = String(status);
  if (search && String(search).trim()) {
    const re = new RegExp(escapeRegex(String(search).trim()), 'i');
    filter.$or = ['deviceId', 'name', 'deviceType', 'room'].map((f) => ({ [f]: re }));
  }
  const data = await Device.find(filter).sort({ createdAt: -1 });
  res.json({ count: data.length, data });
}));

// Xem 1 thiết bị
app.get('/api/devices/:id', wrap(async (req, res) => {
  const device = await Device.findById(req.params.id);
  if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
  res.json({ data: device });
}));

// Thêm
app.post('/api/devices', wrap(async (req, res) => {
  const device = await Device.create(pick(req.body));
  res.status(201).json({ message: 'Thêm thiết bị thành công', data: device });
}));

// Cập nhật
app.put('/api/devices/:id', wrap(async (req, res) => {
  const device = await Device.findByIdAndUpdate(req.params.id, pick(req.body), {
    new: true,
    runValidators: true,
  });
  if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
  res.json({ message: 'Cập nhật thiết bị thành công', data: device });
}));

// Xóa
app.delete('/api/devices/:id', wrap(async (req, res) => {
  const device = await Device.findByIdAndDelete(req.params.id);
  if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
  res.json({ message: 'Xóa thiết bị thành công' });
}));

app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy đường dẫn' }));

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join('; ') });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Giá trị không hợp lệ ở trường "${err.path}"` });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Mã thiết bị (deviceId) đã tồn tại' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON không hợp lệ' });
  }
  console.error(err);
  res.status(500).json({ message: 'Lỗi máy chủ' });
});

mongoose
  .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log('MongoDB connected'))
  .catch((e) => console.error('MongoDB error:', e.message));

app.listen(PORT, () => console.log(`API running on port ${PORT}`));

require('dotenv').config();
const mongoose = require('mongoose');
const Device = require('./models/Device');

const data = [
  { deviceId: 'DV001', name: 'Máy chiếu Epson EB-X06', deviceType: 'Máy chiếu', room: 'A101', brand: 'Epson', model: 'EB-X06', quantity: 1, status: 'Đang sử dụng', purchaseDate: '2023-08-15', description: 'Máy chiếu 3600 lumens' },
  { deviceId: 'DV002', name: 'Máy tính Dell OptiPlex 3080', deviceType: 'Máy tính', room: 'A101', brand: 'Dell', model: 'OptiPlex 3080', quantity: 30, status: 'Đang sử dụng', purchaseDate: '2022-09-01', description: 'Máy tính phòng thực hành' },
  { deviceId: 'DV003', name: 'Bộ loa hội trường Bose', deviceType: 'Thiết bị âm thanh', room: 'B202', brand: 'Bose', model: 'S1 Pro', quantity: 2, status: 'Hư hỏng', purchaseDate: '2021-05-20', description: 'Loa bị rè âm' },
  { deviceId: 'DV004', name: 'Micro không dây Shure', deviceType: 'Thiết bị âm thanh', room: 'B202', brand: 'Shure', model: 'SM58', quantity: 4, status: 'Đang sửa chữa', purchaseDate: '2022-01-10', description: 'Đang gửi bảo hành' },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Device.init();
    for (const d of data) {
      await Device.updateOne({ deviceId: d.deviceId }, { $setOnInsert: d }, { upsert: true });
    }
    console.log('Đã thêm dữ liệu mẫu:', await Device.countDocuments(), 'thiết bị');
  } catch (e) {
    console.error('Lỗi:', e.message);
  } finally {
    await mongoose.disconnect();
  }
})();

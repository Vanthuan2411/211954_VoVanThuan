import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

const STATUSES = ['Đang sử dụng', 'Hư hỏng', 'Đang sửa chữa', 'Ngừng sử dụng'];
const EMPTY = {
  deviceId: '', name: '', deviceType: '', room: '', brand: '', model: '',
  quantity: 1, status: 'Đang sử dụng', purchaseDate: '', description: '',
};
const statusClass = (s) =>
  ({ 'Đang sử dụng': 'ok', 'Hư hỏng': 'bad', 'Đang sửa chữa': 'fix', 'Ngừng sử dụng': 'off' }[s] || 'off');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

export default function App() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (q) => {
    setLoading(true);
    setError('');
    try {
      const r = await api.list(q);
      setDevices(r.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
  }, [search, load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const openDetail = async (id) => {
    try {
      const r = await api.get(id);
      setDetail(r.data);
    } catch (e) {
      setError(e.message);
    }
  };

  const openAdd = () => {
    setFormError('');
    setForm({ id: null, values: { ...EMPTY } });
  };

  const openEdit = (d) => {
    setFormError('');
    const values = {};
    Object.keys(EMPTY).forEach((k) => (values[k] = d[k] ?? ''));
    values.purchaseDate = d.purchaseDate ? d.purchaseDate.slice(0, 10) : '';
    setForm({ id: d._id, values });
  };

  const setField = (k, v) => setForm((f) => ({ ...f, values: { ...f.values, [k]: v } }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const payload = {
      ...form.values,
      quantity: Number(form.values.quantity),
      purchaseDate: form.values.purchaseDate || null,
    };
    try {
      const r = form.id ? await api.update(form.id, payload) : await api.create(payload);
      setForm(null);
      setNotice(r.message || 'Lưu thành công');
      load(search);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (d) => {
    if (!window.confirm(`Xóa thiết bị "${d.name}"?`)) return;
    try {
      const r = await api.remove(d._id);
      setNotice(r.message);
      load(search);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="container">
      <h1>Quản lý thiết bị phòng học</h1>

      <div className="toolbar">
        <input
          placeholder="Tìm theo mã, tên, loại thiết bị, phòng học..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="primary" onClick={openAdd}>+ Thêm thiết bị</button>
      </div>

      {notice && <div className="alert success">{notice}</div>}
      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <p className="muted">Đang tải dữ liệu...</p>
      ) : devices.length === 0 ? (
        <p className="muted">Không có thiết bị nào.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã</th><th>Tên thiết bị</th><th>Loại</th><th>Phòng</th>
                <th>Số lượng</th><th>Tình trạng</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d._id}>
                  <td>{d.deviceId}</td>
                  <td>{d.name}</td>
                  <td>{d.deviceType}</td>
                  <td>{d.room}</td>
                  <td>{d.quantity}</td>
                  <td><span className={`badge ${statusClass(d.status)}`}>{d.status}</span></td>
                  <td className="actions">
                    <button onClick={() => openDetail(d._id)}>Chi tiết</button>
                    <button onClick={() => openEdit(d)}>Sửa</button>
                    <button className="danger" onClick={() => remove(d)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="modal-bg" onClick={() => setDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết thiết bị</h2>
            <dl>
              <dt>Mã thiết bị</dt><dd>{detail.deviceId}</dd>
              <dt>Tên</dt><dd>{detail.name}</dd>
              <dt>Loại</dt><dd>{detail.deviceType}</dd>
              <dt>Phòng học</dt><dd>{detail.room}</dd>
              <dt>Hãng</dt><dd>{detail.brand || '—'}</dd>
              <dt>Model</dt><dd>{detail.model || '—'}</dd>
              <dt>Số lượng</dt><dd>{detail.quantity}</dd>
              <dt>Tình trạng</dt>
              <dd><span className={`badge ${statusClass(detail.status)}`}>{detail.status}</span></dd>
              <dt>Ngày mua</dt><dd>{fmtDate(detail.purchaseDate)}</dd>
              <dt>Mô tả</dt><dd>{detail.description || '—'}</dd>
            </dl>
            <button onClick={() => setDetail(null)}>Đóng</button>
          </div>
        </div>
      )}

      {form && (
        <div className="modal-bg">
          <div className="modal">
            <h2>{form.id ? 'Cập nhật thiết bị' : 'Thêm thiết bị'}</h2>
            {formError && <div className="alert error">{formError}</div>}
            <form onSubmit={submit}>
              <label>Mã thiết bị *
                <input required value={form.values.deviceId} onChange={(e) => setField('deviceId', e.target.value)} />
              </label>
              <label>Tên thiết bị *
                <input required value={form.values.name} onChange={(e) => setField('name', e.target.value)} />
              </label>
              <label>Loại thiết bị *
                <input required value={form.values.deviceType} onChange={(e) => setField('deviceType', e.target.value)} />
              </label>
              <label>Phòng học *
                <input required value={form.values.room} onChange={(e) => setField('room', e.target.value)} />
              </label>
              <label>Hãng
                <input value={form.values.brand} onChange={(e) => setField('brand', e.target.value)} />
              </label>
              <label>Model
                <input value={form.values.model} onChange={(e) => setField('model', e.target.value)} />
              </label>
              <label>Số lượng *
                <input type="number" min="0" required value={form.values.quantity} onChange={(e) => setField('quantity', e.target.value)} />
              </label>
              <label>Tình trạng
                <select value={form.values.status} onChange={(e) => setField('status', e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label>Ngày mua
                <input type="date" value={form.values.purchaseDate} onChange={(e) => setField('purchaseDate', e.target.value)} />
              </label>
              <label>Mô tả
                <textarea rows="3" value={form.values.description} onChange={(e) => setField('description', e.target.value)} />
              </label>
              <div className="form-actions">
                <button type="button" onClick={() => setForm(null)}>Hủy</button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

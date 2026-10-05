import React, { useState, useMemo } from "react";
import { MOCK_ROOMS, ROOM_STATUS_LIST } from "../../mocks/mockRooms";
import { MOCK_SPECIALTIES } from "../../mocks/mockAccounts";
import { MOCK_DOCTORS } from "../../mocks/mockDoctors";
import {
  Search, Plus, Pencil, Trash2, X, Check, DoorOpen, MapPin,
  Stethoscope, Phone, ChevronDown, AlertTriangle, RefreshCw
} from "lucide-react";

const STATUS_CONFIG = {
  "Đang hoạt động": { color: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
  "Sẵn sàng": { color: "bg-cyan-100 text-cyan-800 border-cyan-200", dot: "bg-cyan-500" },
  "Bảo trì": { color: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-500 animate-pulse" },
  "Đóng cửa": { color: "bg-red-100 text-red-800 border-red-200", dot: "bg-red-500" },
};

const EMPTY_FORM = { name: "", department: "", doctor: "", floor: "", wing: "", status: "Sẵn sàng", phone: "", capacity: 1 };

export const AdminRooms = () => {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rooms.filter(r => {
      const matchQ = r.name.toLowerCase().includes(q) || r.department.toLowerCase().includes(q) || r.doctor.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [rooms, search, statusFilter]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };
  const openEdit = (r) => {
    setSelected(r);
    setForm({ name: r.name, department: r.department, doctor: r.doctor, floor: r.floor || "", wing: r.wing || "", status: r.status, phone: r.phone || "", capacity: r.capacity });
    setModal("edit");
  };
  const openDelete = (r) => { setSelected(r); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleAdd = () => {
    if (!form.name) return;
    setRooms(prev => [...prev, { ...form, id: Date.now(), capacity: Number(form.capacity) }]);
    closeModal();
    showToast(`Đã thêm phòng "${form.name}"`);
  };

  const handleEdit = () => {
    setRooms(prev => prev.map(r => r.id === selected.id ? { ...r, ...form, capacity: Number(form.capacity) } : r));
    closeModal();
    showToast(`Đã cập nhật phòng "${form.name}"`);
  };

  const handleDelete = () => {
    setRooms(prev => prev.filter(r => r.id !== selected.id));
    closeModal();
    showToast(`Đã xóa phòng "${selected.name}"`, "error");
  };

  const handleStatusChange = (roomId, newStatus) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
    showToast(`Đã cập nhật trạng thái`);
  };

  const statusCounts = ROOM_STATUS_LIST.reduce((acc, s) => {
    acc[s] = rooms.filter(r => r.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 ${toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
          {toast.type === "error" ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản Lý Phòng Khám</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tổng cộng <span className="font-bold text-slate-700">{rooms.length}</span> phòng</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Thêm Phòng
        </button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ROOM_STATUS_LIST.map(s => {
          const sc = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}
              className={`bg-white rounded-xl border p-3 text-left transition-all hover:shadow-sm ${statusFilter === s ? "border-cyan-400 ring-2 ring-cyan-100" : "border-slate-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{s}</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{statusCounts[s] || 0}</p>
              <p className="text-[11px] text-slate-400">phòng</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên phòng, chuyên khoa, bác sĩ..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Phòng Khám</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Vị Trí</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Chuyên Khoa / Bác Sĩ</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Liên Hệ</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Trạng Thái</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">Không tìm thấy kết quả</td></tr>
            ) : filtered.map(r => {
              const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG["Sẵn sàng"];
              return (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-cyan-50 border border-cyan-200 rounded-xl flex items-center justify-center">
                        <DoorOpen className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{r.name}</p>
                        <p className="text-[11px] text-slate-400">Sức chứa: {r.capacity} người</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-xs text-slate-700 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {r.floor}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{r.wing}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-bold text-slate-800">{r.department}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Stethoscope className="w-3 h-3" /> {r.doctor}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {r.phone || "—"}
                    </p>
                  </td>
                  <td className="p-4">
                    {/* Inline status changer */}
                    <div className="relative group">
                      <button className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {r.status}
                        <ChevronDown className="w-3 h-3 opacity-60" />
                      </button>
                      <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 hidden group-hover:block min-w-[160px]">
                        {ROOM_STATUS_LIST.map(s => (
                          <button key={s} onClick={() => handleStatusChange(r.id, s)}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 ${s === r.status ? "text-cyan-600" : "text-slate-700"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s]?.dot || "bg-slate-400"}`} />
                            {s}
                            {s === r.status && <Check className="w-3 h-3 ml-auto text-cyan-600" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-cyan-50 text-slate-400 hover:text-cyan-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openDelete(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
          Hiển thị {filtered.length} / {rooms.length} phòng
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">
                {modal === "add" && "Thêm Phòng Khám Mới"}
                {modal === "edit" && `Chỉnh Sửa: ${selected?.name}`}
                {modal === "delete" && "Xác Nhận Xóa"}
              </h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="p-6">
              {modal === "delete" ? (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-sm text-slate-700">Bạn có chắc muốn xóa phòng <span className="font-bold">"{selected?.name}"</span>?</p>
                  <div className="flex gap-3">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
                    <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold">Xóa</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Tên phòng <span className="text-red-500">*</span></label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400"
                        placeholder="VD: Phòng 201" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Chuyên khoa</label>
                      <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                        <option value="">-- Chọn --</option>
                        {MOCK_SPECIALTIES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Bác sĩ phụ trách</label>
                    <select value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                      <option value="">-- Chọn bác sĩ --</option>
                      {MOCK_DOCTORS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Tầng</label>
                      <input value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400"
                        placeholder="VD: Tầng 2" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Khu</label>
                      <input value={form.wing} onChange={e => setForm(f => ({ ...f, wing: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400"
                        placeholder="VD: Khu A" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">SĐT phòng</label>
                      <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400"
                        placeholder="024-3825-xxxx" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Trạng thái</label>
                      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                        {ROOM_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
                    <button onClick={modal === "add" ? handleAdd : handleEdit}
                      className="flex-1 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-bold">
                      {modal === "add" ? "Thêm Mới" : "Lưu Thay Đổi"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
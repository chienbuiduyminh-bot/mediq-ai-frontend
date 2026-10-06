import React, { useState, useMemo } from "react";
import { MOCK_DOCTORS } from "../../mocks/mockDoctors";
import { MOCK_SPECIALTIES } from "../../mocks/mockAccounts";
import { MOCK_ROOMS } from "../../mocks/mockRooms";
import {
  Search, Plus, Pencil, Trash2, X, Check, Stethoscope, Star, Phone,
  Mail, Building2, Calendar, AlertTriangle, Clock, Award
} from "lucide-react";

const STATUS_CONFIG = {
  "Đang trực": { color: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
  "Nghỉ phép": { color: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-500" },
  "Nghỉ bệnh": { color: "bg-red-100 text-red-800 border-red-200", dot: "bg-red-500" },
  "Nghỉ ngơi": { color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};

const STATUS_LIST = ["Đang trực", "Nghỉ phép", "Nghỉ bệnh", "Nghỉ ngơi"];
const BADGE_LIST = ["Bác sĩ Chuyên khoa I", "Bác sĩ Chuyên khoa II", "Tiến sĩ", "Phó Giáo sư - Tiến sĩ", "Giáo sư - Tiến sĩ"];
const EMPTY_FORM = { name: "", email: "", phone: "", specialty: "", badge: "Bác sĩ Chuyên khoa I", room: "", experience: "", status: "Đang trực", rating: 4.5, joinDate: "" };

export const AdminDoctors = () => {
  const [doctors, setDoctors] = useState(MOCK_DOCTORS);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("ALL");
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
    return doctors.filter(d => {
      const matchQ = d.name.toLowerCase().includes(q) || d.email?.toLowerCase().includes(q) || d.specialty?.toLowerCase().includes(q) || d.phone?.includes(q);
      const matchSpec = specialtyFilter === "ALL" || d.specialty === specialtyFilter;
      const matchStatus = statusFilter === "ALL" || d.status === statusFilter;
      return matchQ && matchSpec && matchStatus;
    });
  }, [doctors, search, specialtyFilter, statusFilter]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };
  const openEdit = (d) => { setSelected(d); setForm({ ...d }); setModal("edit"); };
  const openDelete = (d) => { setSelected(d); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleAdd = () => {
    if (!form.name || !form.specialty) return;
    setDoctors(prev => [{ ...form, id: Date.now(), rating: Number(form.rating), avatar: null, availableSlots: [] }, ...prev]);
    closeModal();
    showToast(`Đã thêm bác sĩ "${form.name}"`);
  };

  const handleEdit = () => {
    setDoctors(prev => prev.map(d => d.id === selected.id ? { ...d, ...form, rating: Number(form.rating) } : d));
    closeModal();
    showToast(`Đã cập nhật bác sĩ "${form.name}"`);
  };

  const handleDelete = () => {
    setDoctors(prev => prev.filter(d => d.id !== selected.id));
    closeModal();
    showToast(`Đã xóa bác sĩ "${selected.name}"`, "error");
  };

  const statusCounts = STATUS_LIST.reduce((acc, s) => { acc[s] = doctors.filter(d => d.status === s).length; return acc; }, {});

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    return (
      <span className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-3 h-3 ${i < full ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
        ))}
        <span className="text-[11px] text-slate-500 ml-1 font-medium">{rating}</span>
      </span>
    );
  };

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
          <h1 className="text-2xl font-bold text-slate-900">Quản Lý Bác Sĩ</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tổng cộng <span className="font-bold text-slate-700">{doctors.length}</span> bác sĩ</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Thêm Bác Sĩ
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_LIST.map(s => {
          const sc = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}
              className={`bg-white rounded-xl border p-3 text-left transition-all hover:shadow-sm ${statusFilter === s ? "border-cyan-400 ring-2 ring-cyan-100" : "border-slate-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                <span className="text-[11px] font-bold text-slate-600 uppercase">{s}</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{statusCounts[s] || 0}</p>
            </button>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, email, chuyên khoa..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
        </div>
        <select value={specialtyFilter} onChange={e => setSpecialtyFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-cyan-400">
          <option value="ALL">Tất cả chuyên khoa</option>
          {MOCK_SPECIALTIES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      {/* Doctor Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">Không tìm thấy kết quả</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => {
            const sc = STATUS_CONFIG[d.status] || STATUS_CONFIG["Nghỉ ngơi"];
            return (
              <div key={d.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {d.avatar ? (
                      <img src={d.avatar} alt={d.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-lg font-bold text-cyan-700">
                        {d.name.split(" ").pop()[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{d.name}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${sc.color} mt-0.5`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} /> {d.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-cyan-50 text-slate-400 hover:text-cyan-600 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openDelete(d)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Stethoscope className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="font-semibold text-cyan-700">{d.specialty}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">{d.experience}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{d.badge}</span>
                  </div>
                  {d.room && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{d.room}</span>
                    </div>
                  )}
                  {d.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{d.phone}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {renderStars(d.rating)}
                  <div className="flex gap-1">
                    {(d.availableSlots || []).slice(0, 2).map(slot => (
                      <span key={slot} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md">{slot}</span>
                    ))}
                    {(d.availableSlots || []).length > 2 && (
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-medium rounded-md">+{d.availableSlots.length - 2}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 sticky top-0">
              <h2 className="text-base font-bold text-slate-900">
                {modal === "add" && "Thêm Bác Sĩ Mới"}
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
                  <p className="text-sm text-slate-700">Bạn có chắc muốn xóa bác sĩ <span className="font-bold">"{selected?.name}"</span>?</p>
                  <div className="flex gap-3">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50">Hủy</button>
                    <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold">Xóa</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Họ và tên <span className="text-red-500">*</span></label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400"
                      placeholder="BS. Nguyễn Văn A" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Email</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" placeholder="bs@mediq.ai" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">SĐT</label>
                      <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" placeholder="09xx xxx xxx" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Chuyên khoa <span className="text-red-500">*</span></label>
                      <select value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                        <option value="">-- Chọn --</option>
                        {MOCK_SPECIALTIES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Phòng khám</label>
                      <select value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                        <option value="">-- Chọn phòng --</option>
                        {MOCK_ROOMS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Học hàm / Học vị</label>
                    <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                      {BADGE_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Kinh nghiệm</label>
                      <input value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" placeholder="10 năm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Rating</label>
                      <input type="number" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} min={1} max={5} step={0.1}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Trạng thái</label>
                      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                        {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Ngày bắt đầu công tác</label>
                    <input type="date" value={form.joinDate} onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50">Hủy</button>
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
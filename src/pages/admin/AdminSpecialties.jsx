import React, { useState, useMemo } from "react";
import { MOCK_SPECIALTIES } from "../../mocks/mockAccounts";
import {
  Search, Plus, Pencil, Trash2, X, Check, Heart, Stethoscope, Activity,
  Sparkles, Brain, Baby, Users, MapPin, FileText
} from "lucide-react";

const ICON_MAP = {
  Heart, Stethoscope, Activity, Sparkles, Brain, Baby,
};

const COLOR_CONFIG = {
  rose: { bg: "bg-rose-50", icon: "text-rose-500", border: "border-rose-200", badge: "bg-rose-100 text-rose-800 border-rose-200" },
  cyan: { bg: "bg-cyan-50", icon: "text-cyan-500", border: "border-cyan-200", badge: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  amber: { bg: "bg-amber-50", icon: "text-amber-500", border: "border-amber-200", badge: "bg-amber-100 text-amber-800 border-amber-200" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", border: "border-purple-200", badge: "bg-purple-100 text-purple-800 border-purple-200" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-500", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-500", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

const ICON_OPTIONS = ["Heart", "Stethoscope", "Activity", "Sparkles", "Brain", "Baby"];
const COLOR_OPTIONS = ["rose", "cyan", "amber", "purple", "indigo", "emerald"];
const EMPTY_FORM = { name: "", description: "", icon: "Stethoscope", color: "cyan", room: "", doctorsCount: 0, patientsThisMonth: 0 };

export const AdminSpecialties = () => {
  const [specialties, setSpecialties] = useState(MOCK_SPECIALTIES);
  const [search, setSearch] = useState("");
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
    return specialties.filter(s => s.name.toLowerCase().includes(q) || s.room.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
  }, [specialties, search]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };
  const openEdit = (s) => {
    setSelected(s);
    setForm({ name: s.name, description: s.description || "", icon: s.icon, color: s.color || "cyan", room: s.room, doctorsCount: s.doctorsCount, patientsThisMonth: s.patientsThisMonth || 0 });
    setModal("edit");
  };
  const openDelete = (s) => { setSelected(s); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleAdd = () => {
    if (!form.name) return;
    setSpecialties(prev => [...prev, { ...form, id: Date.now(), doctorsCount: Number(form.doctorsCount), patientsThisMonth: Number(form.patientsThisMonth) }]);
    closeModal();
    showToast(`Đã thêm chuyên khoa "${form.name}"`);
  };

  const handleEdit = () => {
    setSpecialties(prev => prev.map(s => s.id === selected.id ? { ...s, ...form, doctorsCount: Number(form.doctorsCount), patientsThisMonth: Number(form.patientsThisMonth) } : s));
    closeModal();
    showToast(`Đã cập nhật chuyên khoa "${form.name}"`);
  };

  const handleDelete = () => {
    setSpecialties(prev => prev.filter(s => s.id !== selected.id));
    closeModal();
    showToast(`Đã xóa chuyên khoa "${selected.name}"`, "error");
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
          <h1 className="text-2xl font-bold text-slate-900">Quản Lý Chuyên Khoa</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tổng cộng <span className="font-bold text-slate-700">{specialties.length}</span> chuyên khoa</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Thêm Chuyên Khoa
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, vị trí, mô tả..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{specialties.length}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Chuyên Khoa</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-cyan-700">{specialties.reduce((s, x) => s + x.doctorsCount, 0)}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Tổng Bác Sĩ</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{specialties.reduce((s, x) => s + (x.patientsThisMonth || 0), 0)}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">BN Tháng Này</p>
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">Không tìm thấy kết quả</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => {
            const cc = COLOR_CONFIG[s.color] || COLOR_CONFIG.cyan;
            const IconComp = ICON_MAP[s.icon] || Stethoscope;
            return (
              <div key={s.id} className={`bg-white rounded-2xl border ${cc.border} shadow-sm p-5 hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 ${cc.bg} rounded-xl flex items-center justify-center`}>
                    <IconComp className={`w-5 h-5 ${cc.icon}`} />
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-cyan-600 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openDelete(s)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{s.name}</h3>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{s.description || "Chưa có mô tả"}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <MapPin className="w-3 h-3" /> {s.room}
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${cc.badge}`}>
                    <Users className="w-3 h-3" /> {s.doctorsCount} BS
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <FileText className="w-3 h-3" /> {s.patientsThisMonth || 0} BN/tháng
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">
                {modal === "add" && "Thêm Chuyên Khoa Mới"}
                {modal === "edit" && `Chỉnh Sửa: ${selected?.name}`}
                {modal === "delete" && "Xác Nhận Xóa"}
              </h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="p-6">
              {modal === "delete" ? (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-sm text-slate-700">Bạn có chắc muốn xóa chuyên khoa <span className="font-bold">"{selected?.name}"</span>?</p>
                  <div className="flex gap-3">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
                    <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold">Xóa</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Tên chuyên khoa <span className="text-red-500">*</span></label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                      placeholder="VD: Tim mạch" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Mô tả</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 resize-none"
                      placeholder="Mô tả ngắn về chuyên khoa..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Vị trí phòng</label>
                    <input value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400"
                      placeholder="VD: Khu A - Tầng 2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Số bác sĩ</label>
                      <input type="number" value={form.doctorsCount} onChange={e => setForm(f => ({ ...f, doctorsCount: e.target.value }))} min={0}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">BN/tháng</label>
                      <input type="number" value={form.patientsThisMonth} onChange={e => setForm(f => ({ ...f, patientsThisMonth: e.target.value }))} min={0}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Biểu tượng</label>
                      <select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                        {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Màu sắc</label>
                      <select value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                        {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
                    <button onClick={modal === "add" ? handleAdd : handleEdit}
                      className="flex-1 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-bold transition-colors">
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
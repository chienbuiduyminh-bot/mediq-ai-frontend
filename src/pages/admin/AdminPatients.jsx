import React, { useState, useMemo } from "react";
import { MOCK_PATIENTS } from "../../mocks/mockPatients";
import {
  Search, Plus, Pencil, Trash2, X, Check, User, Phone, Mail,
  Calendar, Droplets, MapPin, Activity, AlertTriangle
} from "lucide-react";

const STATUS_CONFIG = {
  "Chờ khám": { color: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-500 animate-pulse" },
  "Đang khám": { color: "bg-cyan-100 text-cyan-800 border-cyan-200", dot: "bg-cyan-500" },
  "Hoàn thành": { color: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
  "Chờ kết quả": { color: "bg-purple-100 text-purple-800 border-purple-200", dot: "bg-purple-500 animate-pulse" },
};

const STATUS_LIST = ["Chờ khám", "Đang khám", "Hoàn thành", "Chờ kết quả"];
const GENDER_LIST = ["Nam", "Nữ", "Khác"];
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const EMPTY_FORM = { name: "", email: "", phone: "", gender: "Nam", dob: "", address: "", bloodType: "O+", status: "Chờ khám", symptoms: "", code: "" };

export const AdminPatients = () => {
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return patients.filter(p => {
      const matchQ = p.name.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.phone?.includes(q) || p.code?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchGender = genderFilter === "ALL" || p.gender === genderFilter;
      return matchQ && matchStatus && matchGender;
    });
  }, [patients, search, statusFilter, genderFilter]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };
  const openEdit = (p) => { setSelected(p); setForm({ ...p }); setModal("edit"); };
  const openDelete = (p) => { setSelected(p); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleAdd = () => {
    if (!form.name || !form.phone) return;
    const code = `PAT-${Math.floor(10000 + Math.random() * 90000)}`;
    setPatients(prev => [{ ...form, id: Date.now(), code, joinDate: new Date().toISOString().slice(0, 10) }, ...prev]);
    closeModal();
    showToast(`Đã thêm bệnh nhân "${form.name}"`);
  };

  const handleEdit = () => {
    setPatients(prev => prev.map(p => p.id === selected.id ? { ...p, ...form } : p));
    closeModal();
    showToast(`Đã cập nhật bệnh nhân "${form.name}"`);
  };

  const handleDelete = () => {
    setPatients(prev => prev.filter(p => p.id !== selected.id));
    closeModal();
    showToast(`Đã xóa bệnh nhân "${selected.name}"`, "error");
  };

  const statusCounts = STATUS_LIST.reduce((acc, s) => { acc[s] = patients.filter(p => p.status === s).length; return acc; }, {});

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
          <h1 className="text-2xl font-bold text-slate-900">Quản Lý Bệnh Nhân</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tổng cộng <span className="font-bold text-slate-700">{patients.length}</span> bệnh nhân</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Thêm Bệnh Nhân
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatusFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${statusFilter === "ALL" ? "bg-cyan-600 text-white border-cyan-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
          Tất cả <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">{patients.length}</span>
        </button>
        {STATUS_LIST.map(s => {
          const sc = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${statusFilter === s ? "bg-cyan-600 text-white border-cyan-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
              {s} <span className="ml-1 opacity-70">{statusCounts[s] || 0}</span>
            </button>
          );
        })}
      </div>

      {/* Search + Gender Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, mã BN, email, SĐT..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
        </div>
        <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-cyan-400">
          <option value="ALL">Tất cả giới tính</option>
          {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Bệnh Nhân</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Liên Hệ</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Thông Tin</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Triệu Chứng</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Trạng Thái</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">Không tìm thấy kết quả</td></tr>
            ) : filtered.map(p => {
              const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG["Chờ khám"];
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-cyan-100 rounded-full flex items-center justify-center text-sm font-bold text-cyan-700">
                        {p.name.split(" ").pop()[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                        <p className="text-[11px] font-mono text-cyan-600">{p.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-xs text-slate-600 flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {p.phone}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {p.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs text-slate-600">{p.age} tuổi · {p.gender}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Droplets className="w-3 h-3 text-red-400" /> {p.bloodType || "—"}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs text-slate-600 flex items-center gap-1 max-w-[160px]">
                      <Activity className="w-3 h-3 text-orange-400 shrink-0" />
                      <span className="truncate">{p.symptoms || "—"}</span>
                    </p>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border w-fit ${sc.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} /> {p.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-cyan-50 text-slate-400 hover:text-cyan-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openDelete(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
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
          Hiển thị {filtered.length} / {patients.length} bệnh nhân
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 sticky top-0">
              <h2 className="text-base font-bold text-slate-900">
                {modal === "add" && "Thêm Bệnh Nhân Mới"}
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
                  <p className="text-sm text-slate-700">Bạn có chắc muốn xóa hồ sơ bệnh nhân <span className="font-bold">"{selected?.name}"</span>?</p>
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
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">SĐT <span className="text-red-500">*</span></label>
                      <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" placeholder="09xx xxx xxx" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Email</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Giới tính</label>
                      <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                        {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Nhóm máu</label>
                      <select value={form.bloodType} onChange={e => setForm(f => ({ ...f, bloodType: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                        {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
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
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Ngày sinh</label>
                    <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Địa chỉ</label>
                    <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" placeholder="Địa chỉ cư trú..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Triệu chứng</label>
                    <textarea value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} rows={2}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 resize-none"
                      placeholder="Mô tả triệu chứng..." />
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
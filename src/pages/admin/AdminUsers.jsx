import React, { useState, useMemo } from "react";
import { MOCK_ACCOUNTS } from "../../mocks/mockAccounts";
import { MOCK_DOCTORS } from "../../mocks/mockDoctors";
import { MOCK_PATIENTS } from "../../mocks/mockPatients";
import {
  Search, Plus, Pencil, Trash2, X, Check, Shield, Stethoscope, User, ChevronDown,
  Mail, Phone, Calendar, MapPin, Star
} from "lucide-react";

// ── Tổng hợp tất cả users từ mock data ──
const buildUsers = () => {
  const accounts = MOCK_ACCOUNTS.map(acc => ({
    id: acc.id,
    name: acc.name,
    email: acc.email,
    role: acc.role,
    phone: acc.phone || "—",
    joinDate: "2025-01-01",
    status: "Hoạt động",
    avatar: acc.avatar,
  }));

  const doctorUsers = MOCK_DOCTORS.filter(d => !accounts.find(a => a.id === d.id)).map(d => ({
    id: d.id,
    name: d.name,
    email: d.email,
    role: "DOCTOR",
    phone: d.phone,
    joinDate: d.joinDate,
    status: d.status === "Nghỉ phép" ? "Tạm nghỉ" : "Hoạt động",
    avatar: d.avatar,
  }));

  const patientUsers = MOCK_PATIENTS.filter(p => !accounts.find(a => a.email === p.email)).map(p => ({
    id: p.id + 2000,
    name: p.name,
    email: p.email,
    role: "PATIENT",
    phone: p.phone,
    joinDate: p.joinDate,
    status: "Hoạt động",
    avatar: null,
  }));

  return [...accounts, ...doctorUsers, ...patientUsers];
};

const INITIAL_USERS = buildUsers();

const ROLE_CONFIG = {
  ADMIN: { label: "Admin", color: "bg-purple-100 text-purple-800 border-purple-200", icon: Shield },
  DOCTOR: { label: "Bác sĩ", color: "bg-cyan-100 text-cyan-800 border-cyan-200", icon: Stethoscope },
  PATIENT: { label: "Bệnh nhân", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: User },
};

const STATUS_COLOR = {
  "Hoạt động": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Tạm nghỉ": "bg-amber-100 text-amber-800 border-amber-200",
  "Bị khóa": "bg-red-100 text-red-800 border-red-200",
};

const EMPTY_FORM = { name: "", email: "", phone: "", role: "PATIENT", status: "Hoạt động" };

export const AdminUsers = () => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modal, setModal] = useState(null); // null | "add" | "edit" | "delete"
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchQ = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone?.includes(q);
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
      return matchQ && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };
  const openEdit = (u) => { setSelected(u); setForm({ name: u.name, email: u.email, phone: u.phone, role: u.role, status: u.status }); setModal("edit"); };
  const openDelete = (u) => { setSelected(u); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    const newUser = { ...form, id: Date.now(), avatar: null, joinDate: new Date().toISOString().slice(0, 10) };
    setUsers(prev => [newUser, ...prev]);
    closeModal();
    showToast(`Đã thêm người dùng "${form.name}"`);
  };

  const handleEdit = () => {
    setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, ...form } : u));
    closeModal();
    showToast(`Đã cập nhật người dùng "${form.name}"`);
  };

  const handleDelete = () => {
    setUsers(prev => prev.filter(u => u.id !== selected.id));
    closeModal();
    showToast(`Đã xóa người dùng "${selected.name}"`, "error");
  };

  const counts = { ALL: users.length, ADMIN: users.filter(u => u.role === "ADMIN").length, DOCTOR: users.filter(u => u.role === "DOCTOR").length, PATIENT: users.filter(u => u.role === "PATIENT").length };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 animate-bounce-in ${toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
          {toast.type === "error" ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản Lý Người Dùng</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tổng cộng <span className="font-bold text-slate-700">{users.length}</span> tài khoản trong hệ thống</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Thêm User
        </button>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[["ALL", "Tất cả"], ["ADMIN", "Admin"], ["DOCTOR", "Bác sĩ"], ["PATIENT", "Bệnh nhân"]].map(([val, lbl]) => (
          <button key={val} onClick={() => setRoleFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${roleFilter === val ? "bg-cyan-600 text-white border-cyan-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
            {lbl} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${roleFilter === val ? "bg-white/20" : "bg-slate-100"}`}>{counts[val]}</span>
          </button>
        ))}
      </div>

      {/* Search + Status Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, email, SĐT..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-cyan-400">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="Hoạt động">Hoạt động</option>
          <option value="Tạm nghỉ">Tạm nghỉ</option>
          <option value="Bị khóa">Bị khóa</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Người Dùng</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Liên Hệ</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Vai Trò</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Trạng Thái</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Tham Gia</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">Không tìm thấy kết quả nào</td></tr>
            ) : filtered.map(u => {
              const rc = ROLE_CONFIG[u.role];
              return (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {u.name.split(" ").pop()[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                        <p className="text-xs text-slate-400 font-mono">#{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-xs text-slate-600 flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {u.email}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {u.phone}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${rc.color}`}>
                      <rc.icon className="w-3 h-3" /> {rc.label}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLOR[u.status] || STATUS_COLOR["Hoạt động"]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {u.joinDate}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-cyan-50 text-slate-400 hover:text-cyan-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openDelete(u)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
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
          Hiển thị {filtered.length} / {users.length} người dùng
        </div>
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">
                {modal === "add" && "Thêm Người Dùng Mới"}
                {modal === "edit" && `Chỉnh Sửa: ${selected?.name}`}
                {modal === "delete" && "Xác Nhận Xóa"}
              </h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              {modal === "delete" ? (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-sm text-slate-700">Bạn có chắc muốn xóa tài khoản <span className="font-bold text-slate-900">"{selected?.name}"</span>? Hành động này không thể hoàn tác.</p>
                  <div className="flex gap-3 mt-4">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Hủy</button>
                    <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors">Xóa</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Họ và tên <span className="text-red-500">*</span></label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                      placeholder="Nguyễn Văn A" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Email <span className="text-red-500">*</span></label>
                    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                      placeholder="example@mediq.ai" type="email" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Số điện thoại</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                      placeholder="09xx xxx xxx" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Vai trò</label>
                      <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                        <option value="PATIENT">Bệnh nhân</option>
                        <option value="DOCTOR">Bác sĩ</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Trạng thái</label>
                      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Tạm nghỉ">Tạm nghỉ</option>
                        <option value="Bị khóa">Bị khóa</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Hủy</button>
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
import React, { useState, useMemo } from "react";
import { MOCK_APPOINTMENTS, APPOINTMENT_STATUS_LIST } from "../../mocks/mockAppointments";
import { MOCK_DOCTORS } from "../../mocks/mockDoctors";
import { MOCK_PATIENTS } from "../../mocks/mockPatients";
import { MOCK_ROOMS } from "../../mocks/mockRooms";
import { MOCK_SPECIALTIES } from "../../mocks/mockAccounts";
import {
  Search, Plus, Pencil, Trash2, X, Check, Calendar, Clock, Filter,
  User, Stethoscope, DoorOpen, AlertTriangle, ChevronDown, CheckCircle2, XCircle, Hourglass
} from "lucide-react";

const STATUS_CONFIG = {
  "Xác nhận": { color: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle2 },
  "Đang chờ": { color: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-500 animate-pulse", icon: Hourglass },
  "Đã hoàn thành": { color: "bg-cyan-100 text-cyan-800 border-cyan-200", dot: "bg-cyan-500", icon: Check },
  "Đã hủy": { color: "bg-red-100 text-red-800 border-red-200", dot: "bg-red-400", icon: XCircle },
};

const EMPTY_FORM = {
  patientName: "", doctorName: "", specialty: "", date: "", time: "", room: "", type: "Khám trực tiếp", status: "Đang chờ", note: ""
};

export const AdminAppointments = () => {
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
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
    return appointments.filter(a => {
      const matchQ = a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.specialty?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
      const matchDate = !dateFilter || a.date === dateFilter;
      return matchQ && matchStatus && matchDate;
    });
  }, [appointments, search, statusFilter, dateFilter]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };
  const openEdit = (a) => { setSelected(a); setForm({ ...a }); setModal("edit"); };
  const openDelete = (a) => { setSelected(a); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleAdd = () => {
    if (!form.patientName || !form.doctorName || !form.date) return;
    const newApt = { ...form, id: `APT-${String(Date.now()).slice(-3)}` };
    setAppointments(prev => [newApt, ...prev]);
    closeModal();
    showToast(`Đã thêm lịch hẹn cho "${form.patientName}"`);
  };

  const handleEdit = () => {
    setAppointments(prev => prev.map(a => a.id === selected.id ? { ...a, ...form } : a));
    closeModal();
    showToast(`Đã cập nhật lịch hẹn ${selected.id}`);
  };

  const handleDelete = () => {
    setAppointments(prev => prev.filter(a => a.id !== selected.id));
    closeModal();
    showToast(`Đã xóa lịch hẹn ${selected.id}`, "error");
  };

  const handleStatusChange = (aptId, newStatus) => {
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: newStatus } : a));
    showToast(`Cập nhật trạng thái → ${newStatus}`);
  };

  const statusCounts = APPOINTMENT_STATUS_LIST.reduce((acc, s) => {
    acc[s] = appointments.filter(a => a.status === s).length;
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
          <h1 className="text-2xl font-bold text-slate-900">Quản Lý Lịch Hẹn</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tổng cộng <span className="font-bold text-slate-700">{appointments.length}</span> lịch hẹn</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Thêm Lịch Hẹn
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {APPOINTMENT_STATUS_LIST.map(s => {
          const sc = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}
              className={`bg-white rounded-xl border p-3 text-left transition-all hover:shadow-sm ${statusFilter === s ? "border-cyan-400 ring-2 ring-cyan-100" : "border-slate-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">{s}</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{statusCounts[s] || 0}</p>
            </button>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm bệnh nhân, bác sĩ, mã lịch hẹn..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
        </div>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-cyan-400" />
        {(dateFilter || statusFilter !== "ALL") && (
          <button onClick={() => { setDateFilter(""); setStatusFilter("ALL"); }}
            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors">
            <X className="w-3 h-3" /> Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Mã / Loại</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Bệnh Nhân</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Bác Sĩ / Chuyên Khoa</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Ngày & Giờ</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Phòng</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Trạng Thái</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">Không tìm thấy lịch hẹn nào</td></tr>
            ) : filtered.map(a => {
              const sc = STATUS_CONFIG[a.status] || STATUS_CONFIG["Đang chờ"];
              return (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-mono font-bold text-cyan-700 text-xs">{a.id}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{a.type}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                        {a.patientName.split(" ").pop()[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{a.patientName}</p>
                        {a.note && <p className="text-[11px] text-slate-400 truncate max-w-[120px]">{a.note}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-800 text-xs">{a.doctorName}</p>
                    <p className="text-[11px] text-cyan-600 font-medium mt-0.5">{a.specialty}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> {a.date}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {a.time}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs text-slate-700 flex items-center gap-1">
                      <DoorOpen className="w-3 h-3 text-slate-400" /> {a.room}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="relative group">
                      <button className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {a.status}
                        <ChevronDown className="w-3 h-3 opacity-60" />
                      </button>
                      <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 hidden group-hover:block min-w-[160px]">
                        {APPOINTMENT_STATUS_LIST.map(s => (
                          <button key={s} onClick={() => handleStatusChange(a.id, s)}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 flex items-center gap-2 ${s === a.status ? "text-cyan-600" : "text-slate-700"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s]?.dot || "bg-slate-400"}`} />
                            {s}
                            {s === a.status && <Check className="w-3 h-3 ml-auto text-cyan-600" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-cyan-50 text-slate-400 hover:text-cyan-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openDelete(a)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
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
          Hiển thị {filtered.length} / {appointments.length} lịch hẹn
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 sticky top-0">
              <h2 className="text-base font-bold text-slate-900">
                {modal === "add" && "Thêm Lịch Hẹn Mới"}
                {modal === "edit" && `Chỉnh Sửa: ${selected?.id}`}
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
                  <p className="text-sm text-slate-700">Bạn có chắc muốn xóa lịch hẹn <span className="font-bold">"{selected?.id}"</span> của bệnh nhân <span className="font-bold">"{selected?.patientName}"</span>?</p>
                  <div className="flex gap-3">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
                    <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold">Xóa</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Bệnh nhân <span className="text-red-500">*</span></label>
                    <select value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                      <option value="">-- Chọn bệnh nhân --</option>
                      {MOCK_PATIENTS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Bác sĩ <span className="text-red-500">*</span></label>
                    <select value={form.doctorName} onChange={e => {
                      const doc = MOCK_DOCTORS.find(d => d.name === e.target.value);
                      setForm(f => ({ ...f, doctorName: e.target.value, specialty: doc?.specialty || f.specialty }));
                    }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                      <option value="">-- Chọn bác sĩ --</option>
                      {MOCK_DOCTORS.map(d => <option key={d.id} value={d.name}>{d.name} · {d.specialty}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Chuyên khoa</label>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Ngày hẹn <span className="text-red-500">*</span></label>
                      <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Giờ hẹn</label>
                      <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Loại khám</label>
                      <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                        <option>Khám trực tiếp</option>
                        <option>Tư vấn AI & Khám trực tiếp</option>
                        <option>Tái khám</option>
                        <option>Khám lần đầu</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Trạng thái</label>
                      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400">
                        {APPOINTMENT_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Ghi chú</label>
                    <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 resize-none"
                      placeholder="Ghi chú về tình trạng bệnh nhân..." />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
                    <button onClick={modal === "add" ? handleAdd : handleEdit}
                      className="flex-1 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-bold transition-colors">
                      {modal === "add" ? "Thêm Lịch Hẹn" : "Lưu Thay Đổi"}
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
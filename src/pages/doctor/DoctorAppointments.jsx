import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Calendar, Clock, Search, Filter, Stethoscope, CheckCircle2,
  XCircle, AlertCircle, Eye, RefreshCcw, ChevronRight, User,
  Check, X, DoorOpen, FileText, ArrowRight
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { doctorDataService } from "../../services/doctorDataService";

const STATUS_BADGES = {
  "Xác nhận": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Đang chờ": "bg-amber-100 text-amber-800 border-amber-200",
  "Đã hoàn thành": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Đã hủy": "bg-rose-100 text-rose-800 border-rose-200",
};

export const DoctorAppointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateFromQuery = searchParams.get("date") || "";

  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState(dateFromQuery);
  const [selectedApt, setSelectedApt] = useState(null);
  const [toast, setToast] = useState(null);

  const loadAppointments = () => {
    const list = doctorDataService.getAppointments();
    // Ưu tiên các lịch hẹn của bác sĩ hoặc cùng chuyên khoa
    const doctorList = list.filter(
      (a) => !user?.name || a.doctorName?.includes(user?.name) || a.specialty === "Tim mạch"
    );
    setAppointments(doctorList);
  };

  useEffect(() => {
    loadAppointments();
    const handleUpdate = () => loadAppointments();
    window.addEventListener("mediq_data_updated", handleUpdate);
    return () => window.removeEventListener("mediq_data_updated", handleUpdate);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateStatus = (id, newStatus) => {
    doctorDataService.updateAppointmentStatus(id, newStatus);
    showToast(`Đã chuyển trạng thái lịch hẹn ${id} sang "${newStatus}"`);
    if (selectedApt && selectedApt.id === id) {
      setSelectedApt((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleStartExam = (apt) => {
    // Chuyển sang Doctor Workspace kèm theo thông tin bệnh nhân và lịch hẹn
    navigate(
      `/doctor/workspace?patientName=${encodeURIComponent(apt.patientName)}&appointmentId=${apt.id}`
    );
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        a.patientName.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.note?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
      const matchDate = !dateFilter || a.date === dateFilter;
      return matchSearch && matchStatus && matchDate;
    });
  }, [appointments, search, statusFilter, dateFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản Lý Lịch Hẹn Khám Bệnh</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách bệnh nhân đặt lịch với <b className="text-slate-800">{user?.name || "BS. Lê Hoài Nam"}</b> • Chuyên khoa: <b className="text-slate-800">{user?.specialty || "Tim mạch"}</b>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDateFilter("2026-10-06")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              dateFilter === "2026-10-06"
                ? "bg-cyan-600 text-white border-cyan-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Hôm nay (06/10)
          </button>
          <button
            onClick={() => setDateFilter("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              dateFilter === ""
                ? "bg-cyan-600 text-white border-cyan-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Tất cả ngày
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên bệnh nhân, mã hẹn (APT-101)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Date Filter */}
        <div className="sm:col-span-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Đang chờ">Đang chờ</option>
            <option value="Xác nhận">Xác nhận</option>
            <option value="Đã hoàn thành">Đã hoàn thành</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>

        {/* Reset */}
        <div className="sm:col-span-1 flex items-center justify-end">
          <button
            onClick={() => {
              setSearch("");
              setDateFilter("");
              setStatusFilter("ALL");
            }}
            title="Đặt lại bộ lọc"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Danh Sách Lịch Hẹn ({filteredAppointments.length})
          </span>
          <span className="text-xs text-slate-400">
            Cập nhật tự động theo thời gian thực
          </span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-medium">Không tìm thấy lịch hẹn nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAppointments.map((apt) => {
              const isCompleted = apt.status === "Đã hoàn thành";
              const isCancelled = apt.status === "Đã hủy";

              return (
                <div
                  key={apt.id}
                  className="p-4 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-800 font-bold flex flex-col items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 text-cyan-600 mb-0.5" />
                      <span className="text-xs">{apt.time}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{apt.patientName}</span>
                        <span className="text-[10px] font-mono font-bold text-cyan-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {apt.id}
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${STATUS_BADGES[apt.status] || "bg-slate-100 text-slate-700"}`}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-y-1 gap-x-3">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" /> {apt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <DoorOpen className="w-3 h-3 text-slate-400" /> {apt.room}
                        </span>
                        <span>Loại: <b>{apt.type}</b></span>
                      </div>

                      {apt.note && (
                        <p className="text-xs text-slate-600 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100 max-w-xl">
                          Triệu chứng/Ghi chú: {apt.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedApt(apt)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> Chi Tiết
                    </button>

                    {!isCompleted && !isCancelled && (
                      <>
                        {apt.status === "Đang chờ" && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, "Xác nhận")}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1 transition"
                          >
                            <Check className="w-3.5 h-3.5" /> Xác Nhận
                          </button>
                        )}

                        <button
                          onClick={() => handleStartExam(apt)}
                          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs transition"
                        >
                          <Stethoscope className="w-3.5 h-3.5" /> Bắt Đầu Khám
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(apt.id, "Đã hủy")}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hủy lịch hẹn"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => navigate("/doctor/records")}
                        className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold text-xs rounded-xl border border-cyan-200 flex items-center gap-1 transition"
                      >
                        <FileText className="w-3.5 h-3.5" /> Xem Bệnh Án
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL CHI TIẾT LỊCH HẸN */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Chi Tiết Lịch Hẹn</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                  {selectedApt.id}
                </span>
              </h3>
              <button
                onClick={() => setSelectedApt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Bệnh nhân:</span>
                <span className="font-bold text-slate-800">{selectedApt.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bác sĩ phụ trách:</span>
                <span className="font-bold text-slate-800">{selectedApt.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chuyên khoa / Phòng:</span>
                <span className="font-medium text-slate-700">{selectedApt.specialty} • {selectedApt.room}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian khám:</span>
                <span className="font-mono font-bold text-cyan-700">{selectedApt.time} - {selectedApt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hình thức:</span>
                <span className="font-medium text-slate-700">{selectedApt.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Trạng thái hiện tại:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${STATUS_BADGES[selectedApt.status]}`}>
                  {selectedApt.status}
                </span>
              </div>
              {selectedApt.note && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Ghi chú lâm sàng / Lý do khám:</span>
                  <p className="text-slate-800 bg-white p-2 rounded-lg border border-slate-200">{selectedApt.note}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedApt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Đóng
              </button>

              {selectedApt.status !== "Đã hoàn thành" && selectedApt.status !== "Đã hủy" && (
                <button
                  onClick={() => {
                    handleStartExam(selectedApt);
                    setSelectedApt(null);
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Stethoscope className="w-4 h-4" /> Bắt Đầu Khám Ngay
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
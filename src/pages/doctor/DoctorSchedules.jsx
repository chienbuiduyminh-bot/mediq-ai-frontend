import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, Building2, DoorOpen, Users, CheckCircle2,
  CalendarDays, ChevronLeft, ChevronRight, Stethoscope, ArrowUpRight
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { doctorDataService } from "../../services/doctorDataService";

const DAYS_OF_WEEK = [
  { day: "Thứ Hai", date: "2026-10-05", morning: "07:30 - 11:30", afternoon: "13:30 - 17:00", room: "P.201", status: "Hoàn thành" },
  { day: "Thứ Ba (Hôm nay)", date: "2026-10-06", morning: "07:30 - 11:30", afternoon: "13:30 - 17:00", room: "P.201", status: "Đang trực" },
  { day: "Thứ Tư", date: "2026-10-07", morning: "07:30 - 11:30", afternoon: "13:30 - 17:00", room: "P.201", status: "Sắp tới" },
  { day: "Thứ Năm", date: "2026-10-08", morning: "07:30 - 11:30", afternoon: "Nghỉ nghiên cứu", room: "P.201", status: "Sắp tới" },
  { day: "Thứ Sáu", date: "2026-10-09", morning: "07:30 - 11:30", afternoon: "13:30 - 17:00", room: "P.201", status: "Sắp tới" },
  { day: "Thứ Bảy", date: "2026-10-10", morning: "08:00 - 12:00", afternoon: "Nghỉ", room: "P.201", status: "Sắp tới" },
  { day: "Chủ Nhật", date: "2026-10-11", morning: "Nghỉ tuần", afternoon: "Nghỉ tuần", room: "-", status: "Nghỉ" },
];

export const DoctorSchedules = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("week"); // 'week' | 'day'
  const [selectedDate, setSelectedDate] = useState("2026-10-06");
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const list = doctorDataService.getAppointments();
    setAppointments(list);
  }, []);

  // Lấy danh sách lịch hẹn của ngày được chọn
  const appointmentsForSelectedDate = appointments.filter(
    (a) => a.date === selectedDate && (!user?.name || a.doctorName?.includes(user?.name) || a.specialty === "Tim mạch")
  );

  return (
    <div className="space-y-6">
      {/* Header Profile & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Lịch Làm Việc & Ca Trực Bác Sĩ</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phòng: <b className="text-slate-800">{user?.room || "Phòng 201 - Chuyên khoa Tim Mạch"}</b> • Bác sĩ: <b className="text-slate-800">{user?.name || "BS. Lê Hoài Nam"}</b>
          </p>
        </div>

        {/* View mode toggle & CTA */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-200/70 p-1 rounded-xl flex text-xs font-semibold">
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === "week" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Lịch Tuần
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === "day" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Lịch Ngày
            </button>
          </div>

          <button
            onClick={() => navigate(`/doctor/appointments?date=${selectedDate}`)}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <span>Quản Lý Lịch Hẹn</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
            <DoorOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Phòng Khám Chỉ Định</div>
            <div className="text-sm font-bold text-slate-800">{user?.room || "Phòng 201 (Khu A - Tầng 2)"}</div>
            <div className="text-[11px] text-slate-500">Chuyên khoa: {user?.specialty || "Tim mạch"}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Ca Trực Hiện Tại</div>
            <div className="text-sm font-bold text-slate-800">Ca Trọn Gói (Sáng & Chiều)</div>
            <div className="text-[11px] text-emerald-600 font-semibold">07:30 - 11:30 & 13:30 - 17:00</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Lịch Hẹn Hôm Nay (06/10)</div>
            <div className="text-sm font-bold text-slate-800">
              {appointments.filter(a => a.date === "2026-10-06").length} Bệnh nhân đặt trước
            </div>
            <div className="text-[11px] text-cyan-600 font-semibold">Sẵn sàng tiếp đón tại Workspace</div>
          </div>
        </div>
      </div>

      {/* WEEK VIEW */}
      {viewMode === "week" && (
        <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-cyan-600" />
              <h2 className="text-sm font-bold text-slate-800">
                Lịch Phân Ca Tuần (05/10/2026 - 11/10/2026)
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Khoa Tim Mạch • Bệnh Viện MEDIQ AI</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {DAYS_OF_WEEK.map((item, idx) => {
              const isToday = item.date === "2026-10-06";
              const dayAppts = appointments.filter(a => a.date === item.date);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedDate(item.date);
                    setViewMode("day");
                  }}
                  className={`rounded-2xl p-3.5 border transition cursor-pointer flex flex-col justify-between min-h-[170px] ${
                    isToday
                      ? "bg-cyan-50/70 border-cyan-400 ring-2 ring-cyan-200"
                      : "bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold ${isToday ? "text-cyan-800" : "text-slate-800"}`}>
                        {item.day}
                      </span>
                      {isToday && (
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mb-3">{item.date}</div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="bg-white/80 p-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold">Ca Sáng:</span>
                        <span className="font-medium text-slate-700">{item.morning}</span>
                      </div>
                      <div className="bg-white/80 p-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold">Ca Chiều:</span>
                        <span className="font-medium text-slate-700">{item.afternoon}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Phòng: <b>{item.room}</b></span>
                    <span className="font-bold text-cyan-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {dayAppts.length} ca
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === "day" && (
        <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-xs font-bold text-slate-700">
                {DAYS_OF_WEEK.find(d => d.date === selectedDate)?.day || "Chi tiết ngày"}
              </span>
            </div>

            <div className="text-xs text-slate-500">
              Tổng số ca đăng ký ngày này: <b className="text-cyan-700">{appointmentsForSelectedDate.length} ca</b>
            </div>
          </div>

          {appointmentsForSelectedDate.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-medium">Chưa có lịch hẹn bệnh nhân nào được đặt vào ngày {selectedDate}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointmentsForSelectedDate.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-800 font-bold flex flex-col items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 mb-0.5 text-cyan-600" />
                      <span className="text-xs">{apt.time}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{apt.patientName}</span>
                        <span className="text-[10px] font-mono font-bold text-cyan-700 px-1.5 py-0.5 rounded bg-white border border-slate-200">
                          {apt.id}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          apt.status === "Đã hoàn thành" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Loại khám: <b>{apt.type}</b> • Phòng: <b>{apt.room}</b>
                        {apt.note && <span> • Ghi chú: <i>{apt.note}</i></span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/doctor/workspace?patientName=${encodeURIComponent(apt.patientName)}&appointmentId=${apt.id}`)}
                      className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition shadow-xs"
                    >
                      <Stethoscope className="w-3.5 h-3.5" /> Bắt Đầu Khám
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
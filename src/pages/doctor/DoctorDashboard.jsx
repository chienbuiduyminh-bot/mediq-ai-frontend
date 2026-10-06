import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Clock, Stethoscope, CheckCircle2, Calendar, ArrowRight,
  UserCheck, AlertCircle, ChevronRight, Activity, FileText,
  CalendarCheck, DoorOpen, Play, Server, Cpu, Database, Eye
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { doctorDataService } from "../../services/doctorDataService";

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const loadData = () => {
    const pList = doctorDataService.getPatients();
    const aList = doctorDataService.getAppointments();
    setPatients(pList);
    setAppointments(aList);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("mediq_data_updated", handleUpdate);
    return () => window.removeEventListener("mediq_data_updated", handleUpdate);
  }, []);

  // Lấy bệnh nhân đang được khám
  const inProgressPatient = patients.find(
    (p) => p.status === "Đang khám"
  ) || patients[1] || null;

  // Lọc hàng chờ (Chờ khám)
  const waitingPatients = patients.filter(
    (p) => p.status === "Chờ khám" || p.status === "Đang chờ"
  );

  // Lịch hẹn hôm nay (06/10/2026)
  const todayAppointments = appointments.filter(
    (a) => a.date === "2026-10-06" || (!a.date && a.time)
  );

  // Tính toán KPI động
  const totalPatientsToday = 24;
  const waitingCount = waitingPatients.length > 0 ? waitingPatients.length : 6;
  const inProgressCount = 1;
  const completedCount = 17;

  // Lấy lời chào theo thời gian
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER DASHBOARD */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.name || "BS. Lê Hoài Nam"}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Đang trực
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Thứ Ba, 06/10/2026</span>
            <span>·</span>
            <span>{user?.room || "Phòng 201"}</span>
            <span>·</span>
            <span className="text-cyan-700 font-semibold">{user?.specialty || "Khoa Tim mạch"}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (inProgressPatient) {
                navigate(`/doctor/workspace?patientId=${inProgressPatient.id}`);
              } else {
                navigate("/doctor/workspace");
              }
            }}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition active:scale-98"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Bắt Đầu Khám</span>
          </button>
        </div>
      </div>

      {/* 2. KHU VỰC THỐNG KÊ TỔNG QUAN (4 KPI CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Bệnh nhân hôm nay</span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-4 h-4 text-cyan-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{totalPatientsToday}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              +4 so với hôm qua
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Đang chờ khám</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">0{waitingCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              Hàng đợi tại sảnh P.201
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Đang khám</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">0{inProgressCount}</div>
            <div className="text-[11px] text-cyan-700 font-medium mt-0.5">
              Trong phòng khám chính
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Đã hoàn thành</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{completedCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              Đã lập hồ sơ EMR & kê đơn
            </div>
          </div>
        </div>
      </div>

      {/* 3. ĐIỂM NHẤN: "BỆNH NHÂN ĐANG KHÁM" */}
      {inProgressPatient && (
        <div className="bg-white border border-cyan-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-cyan-50/40 via-white to-white">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {inProgressPatient.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wide">
                  Đang Khám
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
              </div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{inProgressPatient.name}</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({inProgressPatient.gender}, {inProgressPatient.age}t)
                </span>
                <span className="text-[11px] font-mono text-cyan-800 bg-cyan-100/70 px-1.5 py-0.2 rounded font-semibold">
                  {inProgressPatient.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bắt đầu lúc <b>09:15 AM</b> · Triệu chứng: <span className="italic">{inProgressPatient.symptoms || "Đau đầu, chóng mặt"}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/doctor/workspace?patientId=${inProgressPatient.id}`)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shrink-0 shadow-xs"
          >
            <span>Tiếp Tục Khám</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. KHU VỰC CHÍNH CỦA DASHBOARD: 2 CỘT LỚN CÂN BẰNG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CỘT TRÁI: HÀNG CHỜ KHÁM */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Hàng Chờ Khám</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                  {waitingPatients.length} bệnh nhân
                </span>
              </div>
              <button
                onClick={() => navigate("/doctor/patients")}
                className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-0.5"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-1">
              {waitingPatients.slice(0, 4).map((p, idx) => (
                <div
                  key={p.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 rounded-xl px-2 -mx-2 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 truncate">{p.name}</span>
                        <span className="text-[10px] text-slate-400">({p.gender}, {p.age}t)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {p.symptoms || "Khám định kỳ"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Chờ {10 + idx * 8}p
                    </span>
                    <button
                      onClick={() => navigate(`/doctor/workspace?patientId=${p.id}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 text-[11px] font-bold rounded-lg transition"
                    >
                      Gọi khám
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 text-center">
            <button
              onClick={() => navigate("/doctor/patients")}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              Xem danh sách toàn bộ bệnh nhân trong ngày →
            </button>
          </div>
        </div>

        {/* CỘT PHẢI: LỊCH HẸN HÔM NAY */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Lịch Hẹn Hôm Nay</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                  {todayAppointments.length} ca
                </span>
              </div>
              <button
                onClick={() => navigate("/doctor/appointments?date=2026-10-06")}
                className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-0.5"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 mt-3">
              {todayAppointments.slice(0, 4).map((apt, idx) => {
                const isCurrent = idx === 1; // Highlight nhẹ lịch hiện tại
                const isCompleted = apt.status === "Đã hoàn thành";

                return (
                  <div
                    key={apt.id || idx}
                    className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                      isCurrent
                        ? "bg-cyan-50/60 border-cyan-200"
                        : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded-lg text-xs font-mono font-bold shrink-0 ${
                        isCurrent ? "bg-cyan-600 text-white" : "bg-white text-slate-700 border border-slate-200"
                      }`}>
                        {apt.time || "09:30"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>{apt.patientName}</span>
                          {isCurrent && (
                            <span className="text-[10px] text-cyan-700 font-semibold">
                              (Ca hiện tại)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {apt.specialty || "Tim mạch"} · {apt.room || "Phòng 201"}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : isCurrent
                        ? "bg-cyan-100 text-cyan-800 border-cyan-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      {apt.status || "Xác nhận"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 text-center">
            <button
              onClick={() => navigate("/doctor/appointments?date=2026-10-06")}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              Xem chi tiết tiến độ lịch hẹn khám trong ngày →
            </button>
          </div>
        </div>
      </div>

      {/* 5. KHU VỰC DƯỚI: LỊCH LÀM VIỆC + QUICK ACTIONS + SYSTEM STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Lịch làm việc hôm nay có Progress Bar */}
        <div className="md:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase">Lịch Làm Việc Hôm Nay</span>
            <span className="text-xs font-bold text-cyan-700">P.201 · Tim mạch</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-lg font-bold text-slate-900">08:00 – 17:00</div>
            <div className="text-xs text-slate-500">Ca ban ngày</div>
          </div>

          {/* Timeline Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-cyan-500 rounded-full"
                style={{ width: "45%" }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>08:00</span>
              <span className="font-bold text-cyan-700">10:30 (Hiện tại)</span>
              <span>17:00</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => navigate("/doctor/schedules")}
              className="text-xs text-cyan-700 hover:text-cyan-800 font-semibold flex items-center gap-1"
            >
              <span>Xem lịch làm việc</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase mb-2">Thao Tác Nhanh</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-cyan-50 hover:border-cyan-200 text-slate-700 font-semibold flex items-center gap-2 transition"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-600" />
              <span>Lịch hẹn</span>
            </button>
            <button
              onClick={() => navigate("/doctor/patients")}
              className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-cyan-50 hover:border-cyan-200 text-slate-700 font-semibold flex items-center gap-2 transition"
            >
              <Users className="w-3.5 h-3.5 text-cyan-600" />
              <span>Bệnh nhân</span>
            </button>
            <button
              onClick={() => navigate("/doctor/records")}
              className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-cyan-50 hover:border-cyan-200 text-slate-700 font-semibold flex items-center gap-2 transition"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-600" />
              <span>Bệnh án EMR</span>
            </button>
            <button
              onClick={() => navigate("/doctor/schedules")}
              className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-cyan-50 hover:border-cyan-200 text-slate-700 font-semibold flex items-center gap-2 transition"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-cyan-600" />
              <span>Lịch làm việc</span>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="md:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase mb-2">Trạng Thái Hệ Thống</span>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">AI Clinical Engine</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Medical Record (EMR)</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Appointment Service</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
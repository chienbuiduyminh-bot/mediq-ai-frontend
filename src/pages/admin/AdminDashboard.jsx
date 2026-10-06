import React, { useState, useMemo } from "react";
import { MOCK_APPOINTMENTS } from "../../mocks/mockAppointments";
import { MOCK_DOCTORS } from "../../mocks/mockDoctors";
import { MOCK_PATIENTS } from "../../mocks/mockPatients";
import { MOCK_SPECIALTIES } from "../../mocks/mockAccounts";
import {
  Users, Stethoscope, CalendarCheck, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle,
  Shield, Brain, Database, Zap, Server, Activity, Filter,
  ChevronRight, Minus, CalendarDays, X
} from "lucide-react";

// ─────────────────────────────────────────────
//  DỮ LIỆU LỊCH SỬ THEO TỪNG KHOẢNG THỜI GIAN
// ─────────────────────────────────────────────
const TIME_RANGES = [
  { key: "today",   label: "Hôm nay" },
  { key: "7days",   label: "7 ngày" },
  { key: "30days",  label: "30 ngày" },
  { key: "3months", label: "3 tháng" },
];

const RANGE_DATA = {
  today: {
    kpi: { users: 1248, usersDelta: 3, doctors: 4, doctorsDelta: 0, appointments: 86, aptDelta: 11, completion: 94.2, completionDelta: -1.3 },
    chart: [
      { label: "08:00", apt: 12, done: 10, cancel: 2 },
      { label: "09:00", apt: 18, done: 15, cancel: 1 },
      { label: "10:00", apt: 22, done: 19, cancel: 2 },
      { label: "11:00", apt: 15, done: 13, cancel: 1 },
      { label: "13:00", apt: 9,  done: 8,  cancel: 0 },
      { label: "14:00", apt: 14, done: 11, cancel: 2 },
      { label: "15:00", apt: 10, done: 7,  cancel: 1 },
      { label: "16:00", apt: 6,  done: 4,  cancel: 1 },
    ],
    newPatients: 8, prevPatients: 5,
    cancelRate: 5.8, prevCancelRate: 7.2,
    specialties: [
      { name: "Tim mạch",  count: 22, color: "#f43f5e" },
      { name: "Nội khoa",  count: 30, color: "#06b6d4" },
      { name: "Nhi khoa",  count: 18, color: "#10b981" },
      { name: "Da liễu",   count: 10, color: "#a855f7" },
      { name: "Ngoại khoa",count: 6,  color: "#f59e0b" },
    ],
    trend: [72, 80, 65, 88, 76, 91, 86],
    trendLabels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
  },
  "7days": {
    kpi: { users: 1248, usersDelta: 24, doctors: 32, doctorsDelta: 2, appointments: 438, aptDelta: 52, completion: 93.8, completionDelta: 1.2 },
    chart: [
      { label: "T2 (29/9)", apt: 58, done: 46, cancel: 7 },
      { label: "T3 (30/9)", apt: 74, done: 60, cancel: 8 },
      { label: "T4 (1/10)", apt: 62, done: 50, cancel: 6 },
      { label: "T5 (2/10)", apt: 91, done: 75, cancel: 9 },
      { label: "T6 (3/10)", apt: 86, done: 70, cancel: 7 },
      { label: "T7 (4/10)", apt: 43, done: 35, cancel: 4 },
      { label: "CN (5/10)", apt: 24, done: 20, cancel: 2 },
    ],
    newPatients: 38, prevPatients: 29,
    cancelRate: 6.2, prevCancelRate: 8.1,
    specialties: [
      { name: "Tim mạch",  count: 88,  color: "#f43f5e" },
      { name: "Nội khoa",  count: 124, color: "#06b6d4" },
      { name: "Nhi khoa",  count: 95,  color: "#10b981" },
      { name: "Da liễu",   count: 67,  color: "#a855f7" },
      { name: "Ngoại khoa",count: 64,  color: "#f59e0b" },
    ],
    trend: [58, 74, 62, 91, 86, 43, 24],
    trendLabels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
  },
  "30days": {
    kpi: { users: 1248, usersDelta: 87, doctors: 32, doctorsDelta: 4, appointments: 1820, aptDelta: 210, completion: 92.5, completionDelta: 2.8 },
    chart: [
      { label: "Tuần 1", apt: 380, done: 318, cancel: 42 },
      { label: "Tuần 2", apt: 445, done: 374, cancel: 48 },
      { label: "Tuần 3", apt: 512, done: 438, cancel: 51 },
      { label: "Tuần 4", apt: 483, done: 415, cancel: 44 },
    ],
    newPatients: 142, prevPatients: 118,
    cancelRate: 5.5, prevCancelRate: 7.8,
    specialties: [
      { name: "Tim mạch",  count: 340, color: "#f43f5e" },
      { name: "Nội khoa",  count: 520, color: "#06b6d4" },
      { name: "Nhi khoa",  count: 410, color: "#10b981" },
      { name: "Da liễu",   count: 290, color: "#a855f7" },
      { name: "Ngoại khoa",count: 260, color: "#f59e0b" },
    ],
    trend: [340, 385, 410, 398, 445, 472, 483, 461, 512, 483],
    trendLabels: ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10"],
  },
  "3months": {
    kpi: { users: 1248, usersDelta: 312, doctors: 32, doctorsDelta: 8, appointments: 5640, aptDelta: 820, completion: 91.2, completionDelta: 4.1 },
    chart: [
      { label: "Tháng 8", apt: 1620, done: 1412, cancel: 168 },
      { label: "Tháng 9", apt: 1890, done: 1654, cancel: 192 },
      { label: "Tháng 10",apt: 2130, done: 1879, cancel: 198 },
    ],
    newPatients: 489, prevPatients: 398,
    cancelRate: 5.1, prevCancelRate: 8.9,
    specialties: [
      { name: "Tim mạch",  count: 980,  color: "#f43f5e" },
      { name: "Nội khoa",  count: 1540, color: "#06b6d4" },
      { name: "Nhi khoa",  count: 1240, color: "#10b981" },
      { name: "Da liễu",   count: 890,  color: "#a855f7" },
      { name: "Ngoại khoa",count: 990,  color: "#f59e0b" },
    ],
    trend: [1620, 1720, 1810, 1890, 1950, 2020, 2080, 2130],
    trendLabels: ["T1","T2","T3","T4","T5","T6","T7","T8"],
  },
};

const SERVICES = [
  { name: "Auth Service",            status: "online",    latency: "12ms" },
  { name: "Patient Service",         status: "online",    latency: "28ms" },
  { name: "Doctor Service",          status: "online",    latency: "19ms" },
  { name: "Appointment Service",     status: "online",    latency: "35ms" },
  { name: "Medical Record Service",  status: "online",    latency: "22ms" },
  { name: "AI Triage Service",       status: "online",    latency: "142ms" },
  { name: "Notification Service",    status: "degraded",  latency: "480ms" },
  { name: "API Gateway",             status: "online",    latency: "8ms" },
];

const ACTIVITIES = [
  { color: "emerald", label: "Lịch hẹn APT-108 xác nhận thành công",        time: "2 phút trước" },
  { color: "cyan",    label: "Bệnh nhân mới: Bùi Thị Mai đăng ký",         time: "15 phút trước" },
  { color: "red",     label: "APT-104 bị hủy bởi bệnh nhân",               time: "32 phút trước" },
  { color: "indigo",  label: "BS. Phạm Minh Đức cập nhật lịch trực",       time: "1 giờ trước" },
  { color: "amber",   label: "Phòng 305 đang bảo trì – cần kiểm tra",      time: "2 giờ trước" },
  { color: "purple",  label: "AI Triage xử lý 24 yêu cầu triage hôm nay", time: "3 giờ trước" },
];

// ─────────────────────────────────────────────
//  SVG AREA / LINE CHART
// ─────────────────────────────────────────────
const AreaChart = ({ data, color = "#06b6d4", label = "apt" }) => {
  const W = 460, H = 90, pad = { l: 8, r: 8, t: 8, b: 20 };
  const vals = data.map(d => d[label]);
  const max  = Math.max(...vals, 1);
  const min  = Math.min(...vals);
  const pts  = vals.map((v, i) => {
    const x = pad.l + (i / Math.max(vals.length - 1, 1)) * (W - pad.l - pad.r);
    const y = pad.t + (1 - (v - min) / (max - min || 1)) * (H - pad.t - pad.b);
    return [x, y];
  });
  const lineD  = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const areaD  = `${lineD} L${pts[pts.length - 1][0].toFixed(1)} ${(H - pad.b).toFixed(1)} L${pts[0][0].toFixed(1)} ${(H - pad.b).toFixed(1)} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`ag-${label}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#ag-${label})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={color} stroke="white" strokeWidth="1.5" />
      ))}
      {/* x labels */}
      {data.map((d, i) => {
        const x = pad.l + (i / Math.max(data.length - 1, 1)) * (W - pad.l - pad.r);
        return <text key={i} x={x} y={H - 3} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">{d.label}</text>;
      })}
    </svg>
  );
};

// ─────────────────────────────────────────────
//  SVG GROUPED BAR CHART
// ─────────────────────────────────────────────
const BarChart = ({ data }) => {
  const W = 460, H = 160;
  const padL = 28, padR = 8, padT = 10, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxVal = Math.max(...data.map(d => d.apt), 1);
  const groupW = innerW / data.length;
  const barW   = Math.min((groupW - 6) / 2, 22);

  // Y grid lines
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      {/* Grid lines */}
      {yTicks.map((t, i) => {
        const y = padT + (1 - t) * innerH;
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padL - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#cbd5e1" fontFamily="sans-serif">
              {Math.round(t * maxVal)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const groupX = padL + i * groupW + groupW / 2;
        const aptH   = (d.apt  / maxVal) * innerH;
        const doneH  = (d.done / maxVal) * innerH;
        return (
          <g key={i}>
            {/* apt bar */}
            <rect
              x={groupX - barW - 2} y={padT + innerH - aptH}
              width={barW} height={aptH} rx="3"
              fill="#06b6d4" opacity="0.85"
            />
            {/* done bar */}
            <rect
              x={groupX + 2} y={padT + innerH - doneH}
              width={barW} height={doneH} rx="3"
              fill="#10b981" opacity="0.85"
            />
            {/* x label */}
            <text x={groupX} y={H - padB + 14} textAnchor="middle" fontSize="8.5" fill="#94a3b8" fontFamily="sans-serif">
              {d.label.length > 8 ? d.label.slice(0, 7) + "." : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ─────────────────────────────────────────────
//  DONUT CHART
// ─────────────────────────────────────────────
const DonutChart = ({ data }) => {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  let angle   = -Math.PI / 2;
  const R = 44, r = 28, cx = 54, cy = 54;

  const slices = data.map((d) => {
    const sweep  = (d.count / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle);
    const y1 = cy + R * Math.sin(angle);
    angle += sweep;
    const x2 = cx + R * Math.cos(angle);
    const y2 = cy + R * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const ix1 = cx + r * Math.cos(angle - sweep);
    const iy1 = cy + r * Math.sin(angle - sweep);
    const ix2 = cx + r * Math.cos(angle);
    const iy2 = cy + r * Math.sin(angle);
    return {
      d: `M${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L${ix2.toFixed(2)} ${iy2.toFixed(2)} A${r} ${r} 0 ${large} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z`,
      color: d.color,
    };
  });

  return (
    <svg viewBox="0 0 108 108" className="w-24 h-24 shrink-0">
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.color} opacity="0.9" />
      ))}
      <circle cx={cx} cy={cy} r={r - 1} fill="white" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e293b" fontFamily="sans-serif">
        {total.toLocaleString()}
      </text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7.5" fill="#94a3b8" fontFamily="sans-serif">lượt khám</text>
    </svg>
  );
};

// ─────────────────────────────────────────────
//  KPI CARD
// ─────────────────────────────────────────────
const KpiCard = ({ label, value, delta, deltaLabel, sub, icon: Icon, gradient, deltaUp }) => {
  const up = deltaUp !== undefined ? deltaUp : delta >= 0;
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-md ${gradient}`}>
      {/* background blob */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-2 bottom-2 w-14 h-14 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${up ? "bg-white/20 text-white" : "bg-white/15 text-white"}`}>
          {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {typeof delta === "number" && delta > 0 ? "+" : ""}{delta}{typeof delta === "number" && Math.abs(delta) < 50 && delta % 1 !== 0 ? "%" : ""}
        </span>
      </div>
      <div className="relative mt-3">
        <p className="text-3xl font-black tracking-tight">{value}</p>
        <p className="text-sm font-semibold opacity-90 mt-0.5">{label}</p>
        <p className="text-[11px] opacity-60 mt-0.5">{sub}</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  COMPONENT CHÍNH
// ─────────────────────────────────────────────
// ─── Hàm tạo chart data từ danh sách lịch hẹn trong ngày (nhóm theo giờ) ───
const buildDayChart = (apts) => {
  const slots = {};
  apts.forEach(a => {
    const h = a.time ? a.time.slice(0, 5) : "00:00";
    if (!slots[h]) slots[h] = { label: h, apt: 0, done: 0, cancel: 0 };
    slots[h].apt++;
    if (a.status === "Đã hoàn thành") slots[h].done++;
    if (a.status === "Đã hủy")        slots[h].cancel++;
  });
  return Object.values(slots).sort((a, b) => a.label.localeCompare(b.label));
};

const buildSpecialties = (apts) => {
  const COLORS = { "Tim mạch": "#f43f5e", "Nội khoa": "#06b6d4", "Nhi khoa": "#10b981", "Da liễu": "#a855f7", "Ngoại khoa": "#f59e0b", "Thần kinh": "#6366f1" };
  const map = {};
  apts.forEach(a => { if (a.specialty) map[a.specialty] = (map[a.specialty] || 0) + 1; });
  return Object.entries(map).map(([name, count]) => ({ name, count, color: COLORS[name] || "#94a3b8" }));
};

export const AdminDashboard = () => {
  const [range, setRange] = useState("7days");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDate, setCustomDate] = useState("");

  // ── Chế độ ngày cụ thể: tính toán từ MOCK data thực ──
  const isCustomDate = showDatePicker && customDate !== "";

  const customApts = useMemo(() => {
    if (!isCustomDate) return [];
    return MOCK_APPOINTMENTS.filter(a => a.date === customDate);
  }, [isCustomDate, customDate]);

  const customSpecialties = useMemo(() => buildSpecialties(customApts), [customApts]);
  const customChart       = useMemo(() => buildDayChart(customApts), [customApts]);

  const customDone    = customApts.filter(a => a.status === "Đã hoàn thành").length;
  const customWaiting = customApts.filter(a => a.status === "Đang chờ").length;
  const customConfirm = customApts.filter(a => a.status === "Xác nhận").length;
  const customCancel  = customApts.filter(a => a.status === "Đã hủy").length;
  const customTotal   = customApts.length;
  const customCompletion = customTotal > 0 ? ((customDone / customTotal) * 100).toFixed(1) : "0.0";

  // ── Dữ liệu theo range preset ──
  const rd = RANGE_DATA[range];
  const { kpi, chart, newPatients, prevPatients, cancelRate, prevCancelRate, specialties, trend, trendLabels } = rd;

  const totalDoctorsActive = MOCK_DOCTORS.filter(d => d.status === "Đang trực").length;

  // Apt status dist — dùng data thực nếu ngày cụ thể
  const aptStatusDist = isCustomDate
    ? [
        { label: "Xác nhận",      count: customConfirm, color: "#10b981" },
        { label: "Đang chờ",      count: customWaiting, color: "#f59e0b" },
        { label: "Đã hoàn thành", count: customDone,    color: "#06b6d4" },
        { label: "Đã hủy",        count: customCancel,  color: "#f43f5e" },
      ]
    : [
        { label: "Xác nhận",      count: MOCK_APPOINTMENTS.filter(a => a.status === "Xác nhận").length,      color: "#10b981" },
        { label: "Đang chờ",      count: MOCK_APPOINTMENTS.filter(a => a.status === "Đang chờ").length,      color: "#f59e0b" },
        { label: "Đã hoàn thành", count: MOCK_APPOINTMENTS.filter(a => a.status === "Đã hoàn thành").length, color: "#06b6d4" },
        { label: "Đã hủy",        count: MOCK_APPOINTMENTS.filter(a => a.status === "Đã hủy").length,        color: "#f43f5e" },
      ];

  // Hiển thị: chart và specialty dùng custom hoặc range
  const activeChart       = isCustomDate ? customChart       : chart;
  const activeSpecialties = isCustomDate ? customSpecialties : specialties;
  const maxSpec = Math.max(...activeSpecialties.map(s => s.count), 1);

  // Trend data for area chart
  const trendData = trendLabels.map((lbl, i) => ({ label: lbl, apt: trend[i] }));

  // Định dạng tiêu đề ngày cụ thể
  const formatCustomDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // KPI cards
  const kpiCards = isCustomDate
    ? [
        {
          label: "Tổng Lịch Hẹn", value: customTotal,
          delta: customTotal > 0 ? `${customTotal} lịch` : "Không có", deltaUp: customTotal > 0,
          sub: customTotal > 0 ? `${customConfirm} xác nhận · ${customCancel} đã hủy` : "Không có dữ liệu ngày này",
          icon: CalendarCheck, gradient: "bg-gradient-to-br from-emerald-500 to-emerald-700",
        },
        {
          label: "Đã Xác Nhận", value: customConfirm,
          delta: customTotal > 0 ? `${((customConfirm / customTotal) * 100).toFixed(0)}%` : "0%", deltaUp: true,
          sub: customTotal > 0 ? `${((customConfirm / customTotal) * 100).toFixed(1)}% tổng lịch` : "—",
          icon: CheckCircle2, gradient: "bg-gradient-to-br from-cyan-500 to-cyan-700",
        },
        {
          label: "Bác Sĩ Đang Trực", value: totalDoctorsActive,
          delta: `+0`, deltaUp: true,
          sub: `${MOCK_DOCTORS.filter(d => d.status === "Nghỉ phép").length} đang nghỉ phép`,
          icon: Stethoscope, gradient: "bg-gradient-to-br from-indigo-500 to-indigo-700",
        },
        {
          label: "Tỷ Lệ Hoàn Thành", value: `${customCompletion}%`,
          delta: parseFloat(customCompletion), deltaUp: parseFloat(customCompletion) >= 80,
          sub: customTotal > 0 ? `${customDone}/${customTotal} lịch hoàn thành` : "Chưa có dữ liệu",
          icon: TrendingUp, gradient: "bg-gradient-to-br from-rose-500 to-rose-700",
        },
      ]
    : [
        {
          label: "Tổng Người Dùng", value: kpi.users.toLocaleString(),
          delta: `+${kpi.usersDelta}`, deltaUp: true,
          sub: range === "today" ? "đăng ký hôm nay" : `+${kpi.usersDelta} trong kỳ`,
          icon: Users, gradient: "bg-gradient-to-br from-cyan-500 to-cyan-700",
        },
        {
          label: "Bác Sĩ Đang Trực", value: range === "today" ? totalDoctorsActive : kpi.doctors,
          delta: `+${kpi.doctorsDelta}`, deltaUp: kpi.doctorsDelta >= 0,
          sub: `${MOCK_DOCTORS.filter(d => d.status === "Nghỉ phép").length} đang nghỉ phép`,
          icon: Stethoscope, gradient: "bg-gradient-to-br from-indigo-500 to-indigo-700",
        },
        {
          label: range === "today" ? "Lịch Hẹn Hôm Nay" : "Tổng Lịch Hẹn",
          value: range === "today" ? MOCK_APPOINTMENTS.filter(a => a.date === "2026-10-05").length : kpi.appointments.toLocaleString(),
          delta: `+${kpi.aptDelta}`, deltaUp: true,
          sub: `+${kpi.aptDelta} so với kỳ trước`,
          icon: CalendarCheck, gradient: "bg-gradient-to-br from-emerald-500 to-emerald-700",
        },
        {
          label: "Tỷ Lệ Hoàn Thành", value: `${kpi.completion}%`,
          delta: kpi.completionDelta, deltaUp: kpi.completionDelta >= 0,
          sub: `${kpi.completionDelta >= 0 ? "Tăng" : "Giảm"} ${Math.abs(kpi.completionDelta)}% so với kỳ trước`,
          icon: TrendingUp, gradient: "bg-gradient-to-br from-rose-500 to-rose-700",
        },
      ];

  return (
    <div className="space-y-5">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bảng Điều Khiển Quản Trị</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tổng quan hệ thống MEDIQ AI · Cập nhật lúc {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* System status pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            7/8 services online
          </div>

          {/* Time range selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {TIME_RANGES.map(tr => (
              <button key={tr.key}
                onClick={() => { setRange(tr.key); setShowDatePicker(false); setCustomDate(""); }}
                className={`px-3 py-2 text-xs font-bold transition-all ${
                  !showDatePicker && range === tr.key ? "bg-cyan-600 text-white" : "text-slate-500 hover:bg-slate-50"
                }`}>
                {tr.label}
              </button>
            ))}
            {/* Ngày cụ thể button */}
            <button
              onClick={() => setShowDatePicker(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-l border-slate-200 transition-all ${
                showDatePicker ? "bg-violet-600 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}>
              <CalendarDays className="w-3.5 h-3.5" />
              {isCustomDate
                ? new Date(customDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
                : "Ngày cụ thể"}
            </button>
          </div>

          {/* Date picker dropdown */}
          {showDatePicker && (
            <div className="flex items-center gap-2 bg-white border border-violet-300 rounded-xl shadow-md px-3 py-1.5">
              <CalendarDays className="w-4 h-4 text-violet-500 shrink-0" />
              <input
                type="date"
                value={customDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={e => setCustomDate(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              />
              {customDate && (
                <button
                  onClick={() => setCustomDate("")}
                  className="p-0.5 hover:bg-slate-100 rounded-md transition-colors">
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── CUSTOM DATE BANNER ── */}
      {isCustomDate && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-violet-50 border border-violet-200 rounded-xl">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-bold text-violet-800">Đang xem: {formatCustomDate(customDate)}</span>
            {customTotal === 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 border border-amber-200 text-amber-700 text-[11px] font-bold rounded-full">
                Không có dữ liệu
              </span>
            )}
            {customTotal > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-violet-100 border border-violet-200 text-violet-700 text-[11px] font-bold rounded-full">
                {customTotal} lịch hẹn
              </span>
            )}
          </div>
          <button
            onClick={() => { setCustomDate(""); setShowDatePicker(false); }}
            className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors">
            <X className="w-3.5 h-3.5" /> Xóa bộ lọc
          </button>
        </div>
      )}

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((c, i) => <KpiCard key={i} {...c} />)}
      </div>

      {/* ── ROW 2: Bar Chart + Specialty Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* BAR CHART — chiếm 3/5 */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Thống Kê Lịch Hẹn
                {isCustomDate && <span className="ml-2 text-[11px] font-normal text-violet-500">· {new Date(customDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tổng: <span className="font-bold text-slate-700">{activeChart.reduce((s, d) => s + d.apt, 0).toLocaleString()}</span> lịch hẹn &nbsp;·&nbsp;
                Hoàn thành: <span className="font-bold text-emerald-600">{activeChart.reduce((s, d) => s + d.done, 0).toLocaleString()}</span>
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" /> Tổng lịch</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Hoàn thành</span>
            </div>
          </div>
          <div className="h-40">
            {activeChart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <CalendarDays className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-medium">Không có lịch hẹn nào trong ngày này</p>
              </div>
            ) : (
              <BarChart data={activeChart} />
            )}
          </div>
        </div>

        {/* SPECIALTY DONUT — chiếm 2/5 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Phân Bổ Chuyên Khoa
            {isCustomDate && <span className="ml-1 text-[11px] font-normal text-violet-500">· ngày đã chọn</span>}
          </h3>
          <div className="flex items-center gap-4">
            <DonutChart data={activeSpecialties.length > 0 ? activeSpecialties : [{ name: "—", count: 1, color: "#e2e8f0" }]} />
            <div className="flex-1 space-y-2 min-w-0">
              {activeSpecialties.length === 0 && isCustomDate ? (
                <p className="text-xs text-slate-400 italic">Không có dữ liệu chuyên khoa</p>
              ) : activeSpecialties.map((s, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] font-semibold text-slate-700 truncate">{s.name}</span>
                    <span className="text-[11px] text-slate-500 ml-2 shrink-0">{s.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(s.count / maxSpec) * 100}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Trend + Apt Status + Mini Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* TREND LINE — xu hướng lịch hẹn */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-900">Xu Hướng Lịch Hẹn</h3>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +{kpi.aptDelta}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">Tổng lịch hẹn theo {range === "today" ? "giờ" : range === "7days" ? "ngày" : range === "30days" ? "tuần" : "tháng"}</p>
          <div className="h-28">
            <AreaChart data={trendData} color="#06b6d4" label="apt" />
          </div>
        </div>

        {/* APPOINTMENT STATUS PIE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Trạng Thái Lịch Hẹn</h3>
          <div className="flex items-center gap-4">
            <DonutChart data={aptStatusDist} />
            <div className="flex-1 space-y-2">
              {aptStatusDist.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-[11px] font-medium text-slate-700">{s.label}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-900">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MINI STATS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-900">Chỉ Số Hiệu Suất</h3>

          {/* New Patients */}
          <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-cyan-700">Bệnh Nhân Mới</span>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${newPatients >= prevPatients ? "text-emerald-600" : "text-red-500"}`}>
                {newPatients >= prevPatients ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(newPatients - prevPatients)}
              </span>
            </div>
            <p className="text-2xl font-black text-cyan-800">{newPatients}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-cyan-200 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min((newPatients / (newPatients + prevPatients)) * 100, 100)}%` }} />
              </div>
              <span className="text-[10px] text-cyan-600 font-medium">vs {prevPatients} kỳ trước</span>
            </div>
          </div>

          {/* Cancel Rate */}
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-rose-700">Tỷ Lệ Hủy</span>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${cancelRate <= prevCancelRate ? "text-emerald-600" : "text-red-500"}`}>
                {cancelRate <= prevCancelRate ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                {Math.abs((cancelRate - prevCancelRate).toFixed(1))}%
              </span>
            </div>
            <p className="text-2xl font-black text-rose-800">{cancelRate}%</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-rose-200 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${cancelRate * 5}%` }} />
              </div>
              <span className="text-[10px] text-rose-600 font-medium">vs {prevCancelRate}% kỳ trước</span>
            </div>
          </div>

          {/* AI Triage */}
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-purple-700">AI Triage Hôm Nay</span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +8
              </span>
            </div>
            <p className="text-2xl font-black text-purple-800">24</p>
            <p className="text-[10px] text-purple-500 font-medium mt-1">yêu cầu đã xử lý · 100% thành công</p>
          </div>
        </div>
      </div>

      {/* ── ROW 4: Service Health + Activity + Doctor Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* SERVICE HEALTH */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Microservices</h3>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              7/8 Online
            </div>
          </div>
          <div className="space-y-1.5">
            {SERVICES.map((svc, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg ${svc.status === "degraded" ? "bg-amber-50 border border-amber-100" : "bg-slate-50"}`}>
                <span className={`text-xs font-semibold ${svc.status === "degraded" ? "text-amber-700" : "text-slate-700"}`}>{svc.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{svc.latency}</span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold ${svc.status === "online" ? "text-emerald-600" : "text-amber-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${svc.status === "online" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                    {svc.status === "online" ? "OK" : "Warn"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVITY FEED */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Hoạt Động Gần Đây</h3>
            <button className="text-[11px] font-bold text-cyan-600 hover:underline">Xem tất cả</button>
          </div>
          <div className="space-y-1">
            {ACTIVITIES.map((act, i) => {
              const colorMap = {
                emerald: "bg-emerald-100 border-emerald-200",
                cyan:    "bg-cyan-100 border-cyan-200",
                red:     "bg-red-100 border-red-200",
                indigo:  "bg-indigo-100 border-indigo-200",
                amber:   "bg-amber-100 border-amber-200",
                purple:  "bg-purple-100 border-purple-200",
              };
              const dotMap = {
                emerald: "bg-emerald-500",
                cyan:    "bg-cyan-500",
                red:     "bg-red-500",
                indigo:  "bg-indigo-500",
                amber:   "bg-amber-500",
                purple:  "bg-purple-500",
              };
              return (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
                  <div className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${colorMap[act.color]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotMap[act.color]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 font-medium leading-snug">{act.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {act.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DOCTOR + ROOM STATUS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
          {/* Doctor statuses */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Trạng Thái Bác Sĩ</h3>
            <div className="space-y-2">
              {MOCK_DOCTORS.map(d => (
                <div key={d.id} className="flex items-center gap-2.5">
                  <img src={d.avatar} alt={d.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{d.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{d.specialty}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    d.status === "Đang trực"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-amber-100 text-amber-700 border-amber-200"
                  }`}>{d.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Quick stats from real data */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Lịch Hẹn Thực Tế (Mock DB)</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Tổng", val: MOCK_APPOINTMENTS.length, color: "text-slate-800" },
                { label: "Xác nhận", val: MOCK_APPOINTMENTS.filter(a => a.status === "Xác nhận").length, color: "text-emerald-700" },
                { label: "Đang chờ", val: MOCK_APPOINTMENTS.filter(a => a.status === "Đang chờ").length, color: "text-amber-600" },
                { label: "Đã hủy", val: MOCK_APPOINTMENTS.filter(a => a.status === "Đã hủy").length, color: "text-red-600" },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center">
                  <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

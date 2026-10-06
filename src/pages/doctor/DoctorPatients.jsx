import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search, Eye, Stethoscope, FileText, Phone, Mail, MapPin,
  Calendar, Heart, AlertCircle, X, CheckCircle2, User, Clock
} from "lucide-react";
import { doctorDataService } from "../../services/doctorDataService";

export const DoctorPatients = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("id");

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);

  const loadData = () => {
    const list = doctorDataService.getPatients();
    setPatients(list);

    if (highlightId) {
      const p = list.find((item) => String(item.id) === String(highlightId));
      if (p) {
        handleViewPatient(p);
      }
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("mediq_data_updated", handleUpdate);
    return () => window.removeEventListener("mediq_data_updated", handleUpdate);
  }, [highlightId]);

  const handleViewPatient = (p) => {
    setSelectedPatient(p);
    // Tải các hồ sơ bệnh án cũ của bệnh nhân này
    const records = doctorDataService.getRecordsByPatientName(p.name);
    setPatientRecords(records);
  };

  const handleStartExam = (p) => {
    navigate(`/doctor/workspace?patientId=${p.id}&patientName=${encodeURIComponent(p.name)}`);
  };

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.symptoms?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Danh Sách Bệnh Nhân Đăng Ký Khám</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý hồ sơ bệnh nhân, theo dõi tiền sử bệnh án và chỉ định khám lâm sàng
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã BN (PAT-88291), họ tên, số điện thoại, triệu chứng..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Chờ khám">Chờ khám</option>
            <option value="Đang khám">Đang khám</option>
            <option value="Chờ kết quả">Chờ kết quả</option>
            <option value="Hoàn thành">Hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mã BN</th>
                <th className="p-3.5">Họ Tên</th>
                <th className="p-3.5">Tuổi / Giới</th>
                <th className="p-3.5">Triệu Chứng</th>
                <th className="p-3.5">Trạng Thái</th>
                <th className="p-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((p) => {
                const isDone = p.status === "Hoàn thành" || p.status === "Đã hoàn thành";
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-cyan-700">{p.code}</td>
                    <td className="p-3.5 font-bold text-slate-900">
                      <div>{p.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{p.phone}</span>
                    </td>
                    <td className="p-3.5">{p.age} / {p.gender}</td>
                    <td className="p-3.5 max-w-xs truncate" title={p.symptoms}>
                      {p.symptoms}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full font-semibold border text-[11px] ${
                        isDone
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : p.status === "Đang khám"
                          ? "bg-cyan-100 text-cyan-800 border-cyan-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewPatient(p)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> Chi tiết
                        </button>
                        <button
                          onClick={() => handleStartExam(p)}
                          className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg flex items-center gap-1 transition shadow-xs"
                        >
                          <Stethoscope className="w-3.5 h-3.5" /> Khám
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CHI TIẾT BỆNH NHÂN & LỊCH SỬ KHÁM */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-400 font-mono font-bold">
                    Mã hồ sơ: {selectedPatient.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thông tin nhân khẩu học */}
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase mb-2">Thông Tin Cá Nhân</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Tuổi / Giới tính</span>
                  <span className="font-bold text-slate-800">{selectedPatient.age} tuổi • {selectedPatient.gender}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Nhóm máu</span>
                  <span className="font-bold text-rose-600">{selectedPatient.bloodType || "A+"}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Số điện thoại</span>
                  <span className="font-bold text-slate-800">{selectedPatient.phone}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Email</span>
                  <span className="font-medium text-slate-700 truncate block">{selectedPatient.email}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Ngày sinh</span>
                  <span className="font-medium text-slate-700">{selectedPatient.dob || "1992-05-15"}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Địa chỉ</span>
                  <span className="font-medium text-slate-700 truncate block">{selectedPatient.address || "Hà Nội"}</span>
                </div>
              </div>
            </div>

            {/* Lý do khám hiện tại */}
            <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl text-xs space-y-1">
              <span className="font-bold text-amber-900 block">Lý do khám / Triệu chứng hiện tại:</span>
              <p className="text-amber-800 font-medium">{selectedPatient.symptoms || "Không có triệu chứng cụ thể"}</p>
            </div>

            {/* Lịch sử khám bệnh & EMR */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Lịch Sử Khám & Hồ Sơ Bệnh Án ({patientRecords.length})
                </span>
                {patientRecords.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedPatient(null);
                      navigate("/doctor/records");
                    }}
                    className="text-xs text-cyan-600 hover:underline font-bold"
                  >
                    Xem tất cả hồ sơ EMR
                  </button>
                )}
              </div>

              {patientRecords.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400">
                  Chưa có lịch sử bệnh án nào được ghi nhận cho bệnh nhân này.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {patientRecords.map((rec) => (
                    <div key={rec.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-cyan-700">{rec.id}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{rec.date}</span>
                      </div>
                      <div className="font-bold text-slate-800">{rec.diagnosis}</div>
                      <div className="text-slate-500 text-[11px]">Bác sĩ: <b>{rec.doctorName}</b></div>
                      {rec.prescription && (
                        <div className="bg-white p-1.5 rounded border border-slate-100 text-[11px] text-cyan-800 font-mono">
                          Đơn thuốc: {rec.prescription}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  handleStartExam(selectedPatient);
                  setSelectedPatient(null);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Stethoscope className="w-4 h-4" /> Bắt Đầu Khám Bệnh Nhân Này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
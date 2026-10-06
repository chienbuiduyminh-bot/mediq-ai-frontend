import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileText, Search, Filter, Calendar, User, Stethoscope,
  Printer, Eye, RefreshCw, CheckCircle2, Heart, Activity,
  Thermometer, Wind, X, Pill, ShieldCheck
} from "lucide-react";
import { doctorDataService } from "../../services/doctorDataService";
import { useAuth } from "../../auth/AuthContext";

export const DoctorMedicalRecords = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialPatient = searchParams.get("patient") || "";

  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState(initialPatient);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dateFilter, setDateFilter] = useState("");

  const loadRecords = () => {
    const list = doctorDataService.getMedicalRecords();
    setRecords(list);
  };

  useEffect(() => {
    loadRecords();
    const handleUpdate = () => loadRecords();
    window.addEventListener("mediq_data_updated", handleUpdate);
    return () => window.removeEventListener("mediq_data_updated", handleUpdate);
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        r.patientName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.diagnosis?.toLowerCase().includes(q) ||
        r.doctorName?.toLowerCase().includes(q);
      const matchDate = !dateFilter || r.date === dateFilter;
      return matchSearch && matchDate;
    });
  }, [records, search, dateFilter]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Hồ Sơ Bệnh Án Điện Tử (EMR)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold border border-cyan-200">
              {records.length} Hồ sơ
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu trữ, tra cứu và trích xuất hồ sơ bệnh án khám lâm sàng của bệnh nhân
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã bệnh án (REC-99201), họ tên bệnh nhân, chẩn đoán..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="sm:col-span-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="sm:col-span-1 flex items-center justify-end">
          <button
            onClick={() => {
              setSearch("");
              setDateFilter("");
            }}
            title="Đặt lại bộ lọc"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Records Grid */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 shadow-xs">
          <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <p className="text-xs font-medium">Không tìm thấy hồ sơ bệnh án nào phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white border border-slate-200 hover:border-cyan-300 shadow-xs rounded-2xl p-5 space-y-3 transition flex flex-col justify-between"
            >
              <div>
                {/* Header item */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                      {rec.id}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{rec.patientName}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {rec.date}
                  </span>
                </div>

                {/* Chẩn đoán */}
                <div className="mt-2.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                    Chẩn đoán (ICD-10):
                  </span>
                  <div className="text-xs font-bold text-slate-800 line-clamp-2">
                    {rec.diagnosis}
                  </div>
                </div>

                {/* Triệu chứng & Đơn thuốc */}
                <div className="grid grid-cols-1 gap-2 text-xs mt-3">
                  {rec.symptoms && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] font-semibold mb-0.5">
                        Triệu chứng:
                      </span>
                      <span className="text-slate-700 font-medium line-clamp-1">{rec.symptoms}</span>
                    </div>
                  )}

                  {rec.prescription && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] font-semibold mb-0.5">
                        Chỉ định đơn thuốc:
                      </span>
                      <span className="text-cyan-800 font-mono font-bold line-clamp-2">
                        {rec.prescription}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer info & CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  BS: <b className="text-slate-800">{rec.doctorName}</b>
                </span>
                <button
                  onClick={() => setSelectedRecord(rec)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5" /> Chi Tiết Bệnh Án
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CHI TIẾT BỆNH ÁN & IN ẤN */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-700">{selectedRecord.id}</span>
                <h3 className="text-base font-bold text-slate-900">Phiếu Khám Bệnh & Bệnh Án Điện Tử</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition"
                  title="In phiếu khám"
                >
                  <Printer className="w-3.5 h-3.5" /> In Phiếu
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chi tiết EMR Printable */}
            <div className="space-y-4 text-xs">
              {/* Thông tin hành chính */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Họ tên bệnh nhân:</span>
                  <span className="font-bold text-sm text-slate-900">{selectedRecord.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Ngày khám:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedRecord.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Bác sĩ thực hiện:</span>
                  <span className="font-bold text-slate-800">{selectedRecord.doctorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Trạng thái:</span>
                  <span className="text-emerald-700 font-bold">{selectedRecord.status || "Đã hoàn thành"}</span>
                </div>
              </div>

              {/* Vitals nếu có */}
              {selectedRecord.vitals && (
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1.5">
                    Chỉ số sinh tồn (Vitals):
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block">Huyết áp</span>
                      <span className="font-bold text-slate-800">{selectedRecord.vitals.bp || "-"} mmHg</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block">Nhịp tim</span>
                      <span className="font-bold text-slate-800">{selectedRecord.vitals.hr || "-"} bpm</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block">Nhiệt độ</span>
                      <span className="font-bold text-slate-800">{selectedRecord.vitals.temp || "-"} °C</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block">SpO2</span>
                      <span className="font-bold text-slate-800">{selectedRecord.vitals.spo2 || "-"} %</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Chẩn đoán */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Chẩn đoán xác định:
                </span>
                <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl font-bold text-slate-900">
                  {selectedRecord.diagnosis}
                </div>
              </div>

              {/* Quá trình khám & Note */}
              {selectedRecord.note && (
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Ghi chép lâm sàng & Diễn tiến:
                  </span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedRecord.note}
                  </div>
                </div>
              )}

              {/* Đơn thuốc */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5 text-cyan-600" /> Đơn thuốc & Hướng dẫn sử dụng:
                </span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-cyan-900 whitespace-pre-line leading-relaxed">
                  {selectedRecord.prescription || "Không có đơn thuốc chỉ định"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
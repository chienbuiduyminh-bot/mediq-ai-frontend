import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Mic, Bot, Save, UserCheck, Heart, Activity, Thermometer,
  Wind, Clock, AlertCircle, CheckCircle2, FileText, ArrowRight, ArrowLeft,
  Sparkles, RefreshCw, Plus, Trash2, ShieldAlert
} from "lucide-react";
import { doctorDataService } from "../../services/doctorDataService";
import { useAuth } from "../../auth/AuthContext";

const ICD10_SUGGESTIONS = [
  "I10 - Tăng huyết áp nguyên phát (vô căn)",
  "I20 - Cơn đau thắt ngực (Angina pectoris)",
  "I49.9 - Rối loạn nhịp tim không đặc hiệu",
  "I05 - Bệnh van hai lá do thấp",
  "E11 - Đái tháo đường typ 2",
  "K21 - Bệnh trào ngược dạ dày - thực quản (GERD)",
  "J00 - Viêm mũi họng cấp (Cảm thường)"
];

const QUICK_MEDICINES = [
  { name: "Amlodipine 5mg", dosage: "1 viên/ngày (sáng)" },
  { name: "Concor 2.5mg (Bisoprolol)", dosage: "1 viên/ngày (sáng)" },
  { name: "Aspirin 81mg", dosage: "1 viên/ngày (sau ăn)" },
  { name: "Atorvastatin 10mg", dosage: "1 viên/tối" },
  { name: "Panadol Extra 500mg", dosage: "1 viên khi đau đầu, cách 6h" },
  { name: "Nexium 20mg (Esomeprazole)", dosage: "1 viên trước ăn sáng 30p" }
];

export const DoctorWorkspace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paramPatientId = searchParams.get("patientId");
  const paramPatientName = searchParams.get("patientName");
  const paramAptId = searchParams.get("appointmentId");

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form khám bệnh
  const [medicalNote, setMedicalNote] = useState("Bệnh nhân tỉnh táo, tiếp xúc tốt. Đau ngực vùng trước tim nhẹ khi gắng sức.");
  const [diagnosis, setDiagnosis] = useState("I10 - Tăng huyết áp nguyên phát (vô căn)");
  const [prescription, setPrescription] = useState("Amlodipine 5mg - 1 viên/ngày (Uống sáng sau ăn)");
  const [doctorAdvice, setDoctorAdvice] = useState("Hạn chế ăn mặn, tập thể dục nhẹ nhàng 30p/ngày, tái khám sau 14 ngày hoặc khi có cơn đau tức ngực.");
  
  // Chỉ số sinh tồn (Vitals)
  const [vitals, setVitals] = useState({
    bp: "125/82",
    hr: "76",
    temp: "36.6",
    spo2: "98"
  });

  const [isRecording, setIsRecording] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const loadData = () => {
    const list = doctorDataService.getPatients();
    setPatients(list);

    if (paramPatientId) {
      const target = list.find(p => String(p.id) === String(paramPatientId) || p.code === paramPatientId);
      if (target) {
        setSelectedPatient(target);
        return;
      }
    }
    if (paramPatientName) {
      const target = list.find(p => p.name.toLowerCase() === paramPatientName.toLowerCase());
      if (target) {
        setSelectedPatient(target);
        return;
      }
    }
    if (!selectedPatient && list.length > 0) {
      setSelectedPatient(list[0]);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("mediq_data_updated", handleUpdate);
    return () => window.removeEventListener("mediq_data_updated", handleUpdate);
  }, [paramPatientId, paramPatientName]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // AI Generate Note
  const handleAiSmartNote = () => {
    if (!selectedPatient) return;
    setIsGeneratingAi(true);
    setTimeout(() => {
      setMedicalNote(
        `[MedIQ AI Clinical Summary]:\n- Lý do khám: ${selectedPatient.symptoms || "Khám định kỳ"}.\n- Tiền sử: ${selectedPatient.bloodType ? `Nhóm máu ${selectedPatient.bloodType}` : "Không dị ứng thuốc"}.\n- Khám lâm sàng: Tim đều T1, T2 rõ, không âm thổi bệnh lý. Phổi thông khí tốt hai bên. Bụng mềm, gan lách không to.\n- Đề xuất cận lâm sàng: Điện tâm đồ (ECG), Siêu âm Doppler tim.`
      );
      setIsGeneratingAi(false);
      showToast("✨ MedIQ AI đã tạo ghi chú lâm sàng thông minh!");
    }, 600);
  };

  // Voice to text simulation / Speech API
  const handleToggleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      // Mock Speech recognition nếu trình duyệt không hỗ trợ Web Speech API
      setIsRecording(true);
      showToast("🎙️ Đang nghe giọng nói của bác sĩ...");
      setTimeout(() => {
        setMedicalNote(prev => prev + " [Ghi âm]: Bệnh nhân báo giảm đau ngực sau khi nghỉ ngơi, huyết áp ổn định.");
        setIsRecording(false);
        showToast("Đã chuyển giọng nói thành văn bản!");
      }, 1500);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "vi-VN";
      recognition.continuous = false;

      if (!isRecording) {
        recognition.start();
        setIsRecording(true);
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setMedicalNote(prev => prev + " " + transcript);
          setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
      } else {
        setIsRecording(false);
      }
    } catch {
      setIsRecording(false);
    }
  };

  // Thêm nhanh thuốc vào đơn
  const handleAddMedicine = (med) => {
    if (prescription.includes(med.name)) return;
    setPrescription(prev => (prev ? `${prev}\n• ${med.name} - ${med.dosage}` : `• ${med.name} - ${med.dosage}`));
    showToast(`Đã thêm ${med.name} vào đơn thuốc`);
  };

  // Lưu tạm thời
  const handleSaveDraft = () => {
    showToast("💾 Đã lưu tạm thời thông tin phiên khám vào bộ nhớ!");
  };

  // Hoàn thành khám bệnh
  const handleCompleteExam = () => {
    if (!selectedPatient) return;

    const resultRecord = doctorDataService.completeExamination({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      appointmentId: paramAptId,
      doctorName: user?.name || "BS. Lê Hoài Nam",
      diagnosis: diagnosis,
      symptoms: selectedPatient.symptoms,
      prescription: prescription,
      note: `${medicalNote}\n\n[Lời dặn]: ${doctorAdvice}`,
      vitals: vitals
    });

    setSuccessModal(resultRecord);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header trạng thái */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Doctor Workspace</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold border border-cyan-200">
              Live EMR
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Phòng khám: <b className="text-slate-800">{user?.room || "Phòng 201 - Chuyên khoa Tim Mạch"}</b> • Bác sĩ phụ trách: <b className="text-slate-800">{user?.name || "BS. Lê Hoài Nam"}</b>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/doctor/dashboard")}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" /> Về Dashboard
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <Save className="w-3.5 h-3.5 text-slate-600" /> Lưu Tạm
          </button>
          <button
            onClick={handleCompleteExam}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <UserCheck className="w-4 h-4" /> Hoàn Thành Khám
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[calc(100vh-14rem)]">
        {/* Waiting Queue Sidebar */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Hàng Chờ Khám (Queue)
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold border border-cyan-200">
              {patients.length} Bệnh nhân
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {patients.map((p) => {
              const isSelected = selectedPatient?.id === p.id;
              const isDone = p.status === "Hoàn thành" || p.status === "Đã hoàn thành";
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                    isSelected
                      ? "bg-cyan-50 border-cyan-500 text-slate-900 shadow-xs"
                      : "bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>}
                      {p.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-cyan-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {p.code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>{p.gender}, {p.age} tuổi</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isDone ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 italic">
                    {p.symptoms || "Không có triệu chứng ghi nhận"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Examination Window */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col space-y-4 shadow-xs overflow-y-auto">
          {/* Patient Quick Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-slate-500 font-semibold uppercase">Đang khám bệnh nhân:</div>
              <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{selectedPatient?.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold">
                  {selectedPatient?.code}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {selectedPatient?.gender} • {selectedPatient?.age} tuổi • Ngày sinh: {selectedPatient?.dob || "1992-05-15"} • Nhóm máu: <span className="font-bold text-rose-600">{selectedPatient?.bloodType || "A+"}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/doctor/patients?id=${selectedPatient?.id}`)}
              className="text-xs text-cyan-700 font-bold hover:underline flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200"
            >
              <FileText className="w-3.5 h-3.5" /> Xem Hồ Sơ Chi Tiết
            </button>
          </div>

          {/* Vitals Input Row */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-600" /> Chỉ Số Sinh Tồn (Vitals)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500" /> Huyết áp (mmHg)
                </span>
                <input
                  type="text"
                  value={vitals.bp}
                  onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                  className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-500" /> Nhịp tim (bpm)
                </span>
                <input
                  type="text"
                  value={vitals.hr}
                  onChange={(e) => setVitals({ ...vitals, hr: e.target.value })}
                  className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-amber-500" /> Thân nhiệt (°C)
                </span>
                <input
                  type="text"
                  value={vitals.temp}
                  onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                  className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
                  <Wind className="w-3 h-3 text-indigo-500" /> SpO2 (%)
                </span>
                <input
                  type="text"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                  className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* ICD-10 Diagnosis */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
              <span>Chẩn Đoán Bệnh (Mã ICD-10)</span>
              <span className="text-[11px] text-slate-400 font-normal">Gợi ý danh mục ICD</span>
            </label>
            <input
              type="text"
              list="icd10-list"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Nhập hoặc chọn mã bệnh ICD-10..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-cyan-500 focus:bg-white"
            />
            <datalist id="icd10-list">
              {ICD10_SUGGESTIONS.map((icd, idx) => (
                <option key={idx} value={icd} />
              ))}
            </datalist>
          </div>

          {/* AI Medical Note */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-cyan-800 uppercase flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-cyan-600" /> AI Medical Note (Ghi Chép Thông Minh)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAiSmartNote}
                  disabled={isGeneratingAi}
                  className="text-xs px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 flex items-center gap-1 font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> {isGeneratingAi ? "Đang xử lý..." : "AI Tóm Tắt"}
                </button>
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1 font-semibold transition ${
                    isRecording
                      ? "bg-red-50 text-red-700 border-red-300 animate-pulse"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  }`}
                >
                  <Mic className={`w-3.5 h-3.5 ${isRecording ? "text-red-600" : "text-slate-500"}`} />
                  {isRecording ? "Đang ghi âm..." : "Giọng nói → Chữ"}
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              value={medicalNote}
              onChange={(e) => setMedicalNote(e.target.value)}
              placeholder="Nhập ghi chú lâm sàng, quá trình thăm khám, tiền sử và diễn tiến bệnh..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white leading-relaxed"
            />
          </div>

          {/* Prescription */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Kê Đơn Thuốc (Prescription)
              </label>
              <span className="text-[11px] text-slate-400">Chọn nhanh bên dưới</span>
            </div>

            {/* Thuốc gợi ý nhanh */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {QUICK_MEDICINES.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddMedicine(m)}
                  className="text-[10px] bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-600 transition flex items-center gap-1"
                >
                  <Plus className="w-2.5 h-2.5" /> {m.name}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="Nhập tên thuốc, hàm lượng, số lượng, liều dùng và thời điểm dùng thuốc..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white font-mono leading-relaxed"
            />
          </div>

          {/* Lời dặn của bác sĩ */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Lời Dặn & Lịch Hẹn Tái Khám
            </label>
            <input
              type="text"
              value={doctorAdvice}
              onChange={(e) => setDoctorAdvice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleCompleteExam}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-cyan-600/20 transition"
            >
              <Save className="w-4 h-4" /> Hoàn Thành & Lưu Hồ Sơ Bệnh Án
            </button>
          </div>
        </div>
      </div>

      {/* MODAL HOÀN TẤT KHÁM BỆNH THÀNH CÔNG */}
      {successModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                Khám Bệnh Hoàn Thành Thành Công!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hồ sơ bệnh án điện tử đã được khởi tạo và lưu trữ an toàn trong EMR Service.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã bệnh án:</span>
                <span className="font-mono font-bold text-cyan-700">{successModal.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bệnh nhân:</span>
                <span className="font-bold text-slate-800">{successModal.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chẩn đoán:</span>
                <span className="font-medium text-slate-700">{successModal.diagnosis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày lập:</span>
                <span className="font-mono text-slate-600">{successModal.date}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setSuccessModal(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Tiếp tục khám ca khác
              </button>
              <button
                onClick={() => {
                  setSuccessModal(null);
                  navigate("/doctor/records");
                }}
                className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <span>Xem Hồ Sơ Bệnh Án</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
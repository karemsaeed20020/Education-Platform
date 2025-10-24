/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, CheckCircle, XCircle, Clock, Search, Filter, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AttendanceRecord {
  _id: string;
  studentName: string;
  grade: string;
  date: string;
  status: "present" | "absent" | "late";
  notes?: string;
}

// Define a type for valid status values
type AttendanceStatus = "present" | "absent" | "late";

const AttendanceReportPage = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    grade: "",
    student: "",
    startDate: "",
    endDate: "",
  });

  const grades = ["الصف الثاني الثانوي", "الصف الثالث الثانوي"];

  // Type guard to check if a string is a valid status
  const isValidStatus = (status: string): status is AttendanceStatus => {
    return ["present", "absent", "late"].includes(status);
  };

  const getStatusBadge = (status: string) => {
    // Use the type guard
    const validStatus: AttendanceStatus = isValidStatus(status) ? status : "present";

    const colors: Record<AttendanceStatus, string> = {
      present: "bg-green-100 text-green-800 border-green-200",
      absent: "bg-red-100 text-red-800 border-red-200",
      late: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    const icons: Record<AttendanceStatus, React.ReactNode> = {
      present: <CheckCircle className="w-4 h-4" />,
      absent: <XCircle className="w-4 h-4" />,
      late: <Clock className="w-4 h-4" />,
    };

    const text: Record<AttendanceStatus, string> = {
      present: "حاضر",
      absent: "غائب",
      late: "متأخر",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[validStatus]}`}
      >
        {icons[validStatus]}
        {text[validStatus]}
      </span>
    );
  };

  // Fetch data on component mount
  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }
    fetchReport();
  }, []);

  // Apply filters locally for better performance
  useEffect(() => {
    applyFilters();
  }, [records, filters, searchTerm]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/report`,
        { credentials: "include" }
      );

      const data = await res.json();
      if (res.ok) {
        setRecords(data.data || []);
        setFilteredRecords(data.data || []);
      } else {
        toast.error(data.message || "فشل في تحميل التقارير");
      }
    } catch {
      toast.error("حدث خطأ أثناء تحميل تقارير الحضور");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // Apply grade filter
    if (filters.grade) {
      filtered = filtered.filter(record => record.grade === filters.grade);
    }

    // Apply date range filter
    if (filters.startDate) {
      filtered = filtered.filter(record => 
        new Date(record.date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(record => 
        new Date(record.date) <= new Date(filters.endDate)
      );
    }

    // Apply student name filter
    if (filters.student) {
      filtered = filtered.filter(record =>
        record.studentName.toLowerCase().includes(filters.student.toLowerCase())
      );
    }

    // Apply search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(record =>
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      grade: "",
      student: "",
      startDate: "",
      endDate: "",
    });
    setSearchTerm("");
  };

  const hasActiveFilters = filters.grade || filters.student || filters.startDate || filters.endDate || searchTerm;

  // ✅ Safe Base64 encode for large fonts
  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk as any);
    }
    return btoa(binary);
  };

  const generatePDF = async () => {
    try {
      const fontUrl = "/fonts/Amiri-Regular.ttf";
      const fontRes = await fetch(fontUrl);
      if (!fontRes.ok)
        throw new Error("Font file not found. Ensure Amiri-Regular.ttf exists in /public/fonts");

      const fontBuffer = await fontRes.arrayBuffer();
      const fontBase64 = arrayBufferToBase64(fontBuffer);

      const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

      // ✅ Embed Arabic font
      doc.addFileToVFS("Amiri-Regular.ttf", fontBase64);
      doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
      doc.setFont("Amiri");

      // ✅ Header
      doc.setFontSize(20);
      doc.text("تقرير الحضور", 300, 50, { align: "center" });

      const tableData = filteredRecords.map((r) => [
        r.notes || "-",
        r.status === "present" ? "حاضر" : r.status === "absent" ? "غائب" : "متأخر",
        new Date(r.date).toLocaleDateString("ar-EG"),
        r.grade,
        r.studentName,
      ]);

      autoTable(doc, {
        head: [["ملاحظات", "الحالة", "التاريخ", "الصف", "اسم الطالب"]],
        body: tableData,
        theme: "grid",
        styles: { font: "Amiri", halign: "right", fontSize: 11 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: "center" },
        startY: 80,
        margin: { left: 30, right: 30 },
      });

      doc.save("تقرير_الحضور.pdf");
      toast.success("تم تحميل التقرير بنجاح ✅");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("حدث خطأ أثناء إنشاء ملف PDF");
    }
  };

  const generateExcel = () => {
    try {
      // Create CSV content
      const headers = ["اسم الطالب", "الصف", "التاريخ", "الحالة", "ملاحظات"];
      const csvContent = [
        headers.join(","),
        ...filteredRecords.map(record => [
          `"${record.studentName}"`,
          `"${record.grade}"`,
          `"${new Date(record.date).toLocaleDateString('ar-EG')}"`,
          `"${record.status === 'present' ? 'حاضر' : record.status === 'absent' ? 'غائب' : 'متأخر'}"`,
          `"${record.notes || '-'}"`
        ].join(","))
      ].join("\n");

      // Create and download file
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", "تقرير_الحضور.csv");
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("تم تحميل التقرير كملف Excel بنجاح ✅");
    } catch (error) {
      console.error("Excel Generation Error:", error);
      toast.error("حدث خطأ أثناء إنشاء ملف Excel");
    }
  };

  const stats = {
    total: records.length,
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    late: records.filter((r) => r.status === "late").length,
    filteredTotal: filteredRecords.length,
    filteredPresent: filteredRecords.filter((r) => r.status === "present").length,
    filteredAbsent: filteredRecords.filter((r) => r.status === "absent").length,
    filteredLate: filteredRecords.filter((r) => r.status === "late").length,
  };

  const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
  const filteredAttendanceRate = stats.filteredTotal > 0 ? Math.round((stats.filteredPresent / stats.filteredTotal) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقارير الحضور</h1>
            <p className="text-gray-600 mt-1">عرض وتحليل تقارير الحضور لجميع الطلاب</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={generatePDF}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button
              onClick={generateExcel}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="ابحث في جميع الحقول (الاسم، الصف، الحالة، الملاحظات)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">الصف الدراسي</label>
                <select
                  value={filters.grade}
                  onChange={(e) => handleFilterChange('grade', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">الكل</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">اسم الطالب</label>
                <input
                  type="text"
                  placeholder="ابحث بالاسم..."
                  value={filters.student}
                  onChange={(e) => handleFilterChange('student', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">من تاريخ</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">إلى تاريخ</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Active Filters Info */}
            {hasActiveFilters && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  عرض <span className="font-semibold">{stats.filteredTotal}</span> من أصل{' '}
                  <span className="font-semibold">{stats.total}</span> سجل
                  {stats.filteredTotal !== stats.total && (
                    <span className="text-blue-600 mr-2"> (نتائج البحث)</span>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                  مسح الفلاتر
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {hasActiveFilters ? stats.filteredTotal : stats.total}
              </div>
              <div className="text-sm text-gray-600">
                {hasActiveFilters ? 'السجلات المطابقة' : 'إجمالي السجلات'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center bg-green-50 border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {hasActiveFilters ? stats.filteredPresent : stats.present}
              </div>
              <div className="text-sm text-green-600">حاضر</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center bg-red-50 border-red-200">
              <div className="text-2xl font-bold text-red-700">
                {hasActiveFilters ? stats.filteredAbsent : stats.absent}
              </div>
              <div className="text-sm text-red-600">غائب</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center bg-blue-50 border-blue-200">
              <div className="text-2xl font-bold text-blue-700">
                {hasActiveFilters ? filteredAttendanceRate : attendanceRate}%
              </div>
              <div className="text-sm text-blue-600">نسبة الحضور</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {hasActiveFilters ? (
                <>
                  <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">لا توجد نتائج مطابقة للبحث</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    عرض جميع السجلات
                  </button>
                </>
              ) : (
                <p className="text-lg">لا توجد بيانات للعرض</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اسم الطالب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الصف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ملاحظات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecords.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{r.studentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{r.grade}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(r.date).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(r.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{r.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AttendanceReportPage;
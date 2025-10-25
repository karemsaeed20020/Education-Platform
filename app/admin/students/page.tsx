/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { Plus, AlertTriangle, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Components
import StudentsTable from '@/components/admin/StudentsTable';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';
import AddStudentModal from '@/components/admin/AddStudentModal';
import EditStudentModal from '@/components/admin/EditStudentModal';
import StudentDetailsModal from '@/components/admin/StudentDetailsModal';

// Types
import { Student, PaginationInfo } from '@/types';
import Loading from '@/app/loading';
import { api } from '@/redux/slices/authSlice';

export default function StudentsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalStudents: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    student: null as Student | null,
    isLoading: false,
  });

  const [addStudentModal, setAddStudentModal] = useState({
    isOpen: false,
  });

  const [editStudentModal, setEditStudentModal] = useState({
    isOpen: false,
    student: null as Student | null,
  });

  const [studentDetailsModal, setStudentDetailsModal] = useState({
    isOpen: false,
    student: null as Student | null,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  // Fetch students function
  const fetchStudents = async (page: number = 1, limit: number = itemsPerPage) => {
    try {
      setLoading(true);
      
      // ✅ USE API INSTANCE INSTEAD OF FETCH
      const res = await api.get(
        `/api/users/students?page=${page}&limit=${limit}`
      );

      const data = res.data;

      let studentsData: Student[] = [];
      let paginationData: PaginationInfo = {
        currentPage: page,
        totalPages: 1,
        totalStudents: 0,
        hasNext: false,
        hasPrev: false,
      };

      if (data.students) {
        studentsData = data.students;
      } else if (data.data?.students) {
        studentsData = data.data.students;
      } else if (data.data) {
        studentsData = data.data;
      }

      if (data.pagination) {
        paginationData = {
          currentPage: data.pagination.currentPage || page,
          totalPages: data.pagination.totalPages || 1,
          totalStudents: data.pagination.totalStudents || studentsData.length,
          hasNext: data.pagination.hasNext || false,
          hasPrev: data.pagination.hasPrev || false,
        };
      } else if (data.meta) {
        paginationData = {
          currentPage: data.meta.currentPage || page,
          totalPages: data.meta.totalPages || 1,
          totalStudents: data.meta.totalCount || studentsData.length,
          hasNext: data.meta.hasNext || false,
          hasPrev: data.meta.hasPrev || false,
        };
      }

      setStudents(studentsData);
      setFilteredStudents(studentsData);
      setPagination(paginationData);
      setError(null);

    } catch (err: any) {
      console.error('Fetch students error:', err);
      const message = err.response?.data?.message || 'حدث خطأ أثناء جلب البيانات';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  // Initial fetch
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStudents(1, itemsPerPage);
    }
  }, [user, itemsPerPage]);

  // Filter students based on search term
 useEffect(() => {
  if (searchTerm.trim() === '') {
    setFilteredStudents(students);
  } else {
    const filtered = students.filter(student =>
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.username?.toLowerCase().includes(searchTerm.toLowerCase()) // Fallback to username
    );
    setFilteredStudents(filtered);
  }
}, [searchTerm, students]);

  const handleDeleteStudent = async (studentId: string) => {
    setDeleteModal(prev => ({ ...prev, isLoading: true }));
    
    try {
      // ✅ USE API INSTANCE INSTEAD OF FETCH
      await api.delete(`/api/users/${studentId}`);

      // Remove student from local state
      setStudents(prev => prev.filter(student => student._id !== studentId));
      
      // Show success message
      setError(null);
      toast.success('تم حذف الطالب بنجاح');
      
      // Close modal
      setDeleteModal({ isOpen: false, student: null, isLoading: false });
      
      // Refresh students list
      fetchStudents(pagination.currentPage, itemsPerPage);
      
    } catch (err: any) {
      console.error('Delete student error:', err);
      const message = err.response?.data?.message || 'حدث خطأ أثناء حذف الطالب';
      setError(message);
      toast.error(message);
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };


  // Modal handlers
  const openDeleteModal = (student: Student) => {
    setDeleteModal({
      isOpen: true,
      student,
      isLoading: false,
    });
  };

  const closeDeleteModal = () => {
    if (!deleteModal.isLoading) {
      setDeleteModal({
        isOpen: false,
        student: null,
        isLoading: false,
      });
    }
  };

  const openEditModal = (student: Student) => {
    setEditStudentModal({
      isOpen: true,
      student,
    });
  };

  const closeEditModal = () => {
    setEditStudentModal({
      isOpen: false,
      student: null,
    });
  };

  const openDetailsModal = (student: Student) => {
    setStudentDetailsModal({
      isOpen: true,
      student,
    });
  };

  const closeDetailsModal = () => {
    setStudentDetailsModal({
      isOpen: false,
      student: null,
    });
  };

  // Refresh students list
  const refreshStudents = () => {
    fetchStudents(pagination.currentPage, itemsPerPage);
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchStudents(newPage, itemsPerPage);
    }
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    fetchStudents(1, newLimit);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Modals */}
      <StudentDetailsModal
        isOpen={studentDetailsModal.isOpen}
        onClose={closeDetailsModal}
        onEdit={openEditModal}
        student={studentDetailsModal.student}
      />

      <EditStudentModal
        isOpen={editStudentModal.isOpen}
        onClose={closeEditModal}
        onStudentUpdated={refreshStudents}
        student={editStudentModal.student}
      />

      <AddStudentModal
        isOpen={addStudentModal.isOpen}
        onClose={() => setAddStudentModal({ isOpen: false })}
        onStudentAdded={refreshStudents}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteStudent(deleteModal.student!._id)}
        student={deleteModal.student}
        isLoading={deleteModal.isLoading}
      />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">قائمة الطلاب</h1>
          <p className="text-gray-600 mt-1">إدارة حسابات الطلاب في المنصة</p>
        </div>
        
        <button
          onClick={() => setAddStudentModal({ isOpen: true })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          إضافة طالب جديد
        </button>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search Section */}
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="ابحث بالاسم، البريد الإلكتروني، أو رقم الطالب..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
              عرض:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">عناصر في الصفحة</span>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600">
            {searchTerm ? (
              <>
                عرض <span className="font-semibold">{filteredStudents.length}</span> من أصل{' '}
                <span className="font-semibold">{pagination.totalStudents}</span> طالب
                {filteredStudents.length !== students.length && (
                  <span className="text-blue-600 mr-2"> (نتائج البحث)</span>
                )}
              </>
            ) : (
              <>
                إجمالي الطلاب: <span className="font-semibold">{pagination.totalStudents}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 ml-2" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Students Table */}
          <StudentsTable
            students={filteredStudents}
            onView={openDetailsModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />

          {/* No results message */}
          {searchTerm && filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">لم يتم العثور على نتائج</p>
              <p className="text-sm mt-2">لا توجد نتائج تطابق بحثك: {searchTerm}</p>
              <button
                onClick={handleClearSearch}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                عرض جميع الطلاب
              </button>
            </div>
          )}

          {/* Pagination - Only show if not searching */}
          {!searchTerm && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-6">
              {/* Page info */}
              <div className="text-sm text-gray-600">
                عرض <span className="font-semibold">{students.length}</span> من أصل{' '}
                <span className="font-semibold">{pagination.totalStudents}</span> طالب
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-2">
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className={`p-2 rounded-lg border ${
                    pagination.hasPrev
                      ? 'text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                      : 'text-gray-400 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {generatePageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[40px] px-3 py-2 text-sm rounded-lg border ${
                        page === pagination.currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next button */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className={`p-2 rounded-lg border ${
                    pagination.hasNext
                      ? 'text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                      : 'text-gray-400 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-600">
                الصفحة <span className="font-semibold">{pagination.currentPage}</span> من{' '}
                <span className="font-semibold">{pagination.totalPages}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
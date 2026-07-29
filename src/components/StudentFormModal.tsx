import React, { useState } from 'react';
import { X, User, Save } from 'lucide-react';
import { Student } from '../types';
import { ALL_CLASSES } from '../utils/feeCalculator';

interface StudentFormModalProps {
  studentToEdit?: Student | null;
  onClose: () => void;
  onSave: (studentData: Partial<Student>) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  studentToEdit,
  onClose,
  onSave,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [name, setName] = useState(studentToEdit?.name || '');
  const [studentClass, setStudentClass] = useState(studentToEdit?.studentClass || '8th');
  const [monthlyFee, setMonthlyFee] = useState<number>(studentToEdit?.monthlyFee || 800);
  const [joiningDate, setJoiningDate] = useState(studentToEdit?.joiningDate || todayStr);
  const [feeStartDate, setFeeStartDate] = useState(studentToEdit?.feeStartDate || todayStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      studentClass: studentClass.trim(),
      fatherName: studentToEdit?.fatherName || '',
      mobileNumber: studentToEdit?.mobileNumber || '',
      monthlyFee: Number(monthlyFee) || 800,
      joiningDate,
      feeStartDate: feeStartDate || joiningDate,
      notes: studentToEdit?.notes || '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col">
        {/* Header - Geometric Navy #1E3A8A */}
        <div className="p-5 bg-[#1E3A8A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {studentToEdit ? 'Edit Student Details' : 'Add New Student'}
              </h2>
              <p className="text-xs text-blue-200">Verma Classes Student Entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Name */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rohan Kumar"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
              />
            </div>

            {/* Student Class */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student Class *
              </label>
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none cursor-pointer"
              >
                {ALL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Fee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Fee (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                placeholder="800"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none font-mono"
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Joining Date *
              </label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
              />
            </div>

            {/* Fee Start Date */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Fee Start Date *
              </label>
              <input
                type="date"
                required
                value={feeStartDate}
                onChange={(e) => setFeeStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 bg-[#FCD34D] hover:bg-amber-400 text-[#1E3A8A] font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Student</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { X, Database, Download, Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Student } from '../types';

interface BackupRestoreModalProps {
  students: Student[];
  onRestoreData: (restoredStudents: Student[]) => void;
  onClose: () => void;
}

// Helper to generate dynamic filename with current date and time
const getFormattedBackupFilename = (): string => {
  const now = new Date();
  const pad = (num: number) => String(num).padStart(2, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());

  return `AttendanceBackup-${year}-${month}-${day}-${hours}-${minutes}.db`;
};

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  students,
  onRestoreData,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Download timestamped AttendanceBackup file
  const handleDownloadBackup = () => {
    const backupObj = {
      app: 'Verma Classes Attendance Record',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      studentCount: students.length,
      students,
    };

    const filename = getFormattedBackupFilename();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setStatusMsg({
      type: 'success',
      text: `${filename} exported successfully!`,
    });
  };

  // Restore file picker handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let restoredList: Student[] = [];
        if (Array.isArray(parsed)) {
          restoredList = parsed;
        } else if (parsed && Array.isArray(parsed.students)) {
          restoredList = parsed.students;
        } else {
          throw new Error('Invalid backup file structure.');
        }

        if (restoredList.length === 0) {
          throw new Error('Backup file contains no valid student records.');
        }

        onRestoreData(restoredList);
        setStatusMsg({
          type: 'success',
          text: `Successfully restored database with ${restoredList.length} student records!`,
        });
      } catch (err: any) {
        setStatusMsg({
          type: 'error',
          text: err.message || 'Failed to parse backup file.',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-bold">Backup & Restore Database</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create an offline database backup file (e.g. <code>AttendanceBackup-YYYY-MM-DD.db</code>) or restore your database if Windows or browser cache is reinstalled.
          </p>

          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-sm font-semibold ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/50 border-red-200 text-red-800 dark:text-red-300'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Backup Button */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              1. Download Backup File
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Exports current student list, attendance history, and fee records to a timestamped <code>.db</code> file.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Backup Database</span>
            </button>
          </div>

          {/* Restore Button */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              2. Restore from File
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload a previously generated <code>AttendanceBackup.db</code> file to restore data.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".db,.json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Restore Backup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
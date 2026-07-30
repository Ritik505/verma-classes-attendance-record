import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student } from '../types';
import { calculateAttendanceStats, calculateStudentFeeSummary, formatDateReadable, getMonthDisplayName } from './feeCalculator';

/**
 * Generate PDF for single student for a given month or overall
 * Note: Does NOT show fee amounts (rupee values), ONLY shows 'Paid' or 'Pending' status.
 * Professional PDF layout matching Geometric Balance theme.
 */
export function generateStudentPDF(student: Student, monthKey?: string) {
  const doc = new jsPDF();
  const todayStr = new Date().toISOString().split('T')[0];
  const formattedToday = formatDateReadable(todayStr);

  const stats = calculateAttendanceStats(student, monthKey);
  const feeSummary = calculateStudentFeeSummary(student, todayStr);

  // Determine month fee status if monthKey is provided
  let currentMonthFeeStatus = 'Pending';
  if (monthKey && student.fees[monthKey]) {
    currentMonthFeeStatus = student.fees[monthKey].status === 'Paid' ? 'Paid' : 'Pending';
  } else {
    currentMonthFeeStatus = feeSummary.isPending ? 'Pending' : 'Paid';
  }

  // 1. Top Geometric Header Banner - Navy Deep Royal Blue #1E3A8A
  doc.setFillColor(30, 58, 138); // #1E3A8A
  doc.rect(0, 0, 210, 36, 'F');

  // Gold Accent line under header
  doc.setFillColor(252, 211, 77); // #FCD34D
  doc.rect(0, 36, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('VERMA CLASSES', 105, 17, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(252, 211, 77); // Yellow Gold accent text
  const reportSubtitle = monthKey
    ? `MONTHLY ATTENDANCE & FEE REPORT • ${getMonthDisplayName(monthKey).toUpperCase()}`
    : 'STUDENT ATTENDANCE & FEE RECORD';
  doc.text(reportSubtitle, 105, 27, { align: 'center' });

  let yPos = 46;

  // 2. Student Info Card (Geometric Bordered Box)
  doc.setLineWidth(0.6);
  doc.setDrawColor(203, 213, 225); // #CBD5E1
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.roundedRect(14, yPos, 182, 40, 3, 3, 'FD');

  // Left Column Details
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Student Name:`, 20, yPos + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138); // Navy
  doc.text(student.name, 52, yPos + 12);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`Class:`, 20, yPos + 22);
  doc.setFont('helvetica', 'normal');
  doc.text(`Class ${student.studentClass}`, 52, yPos + 22);

  doc.setFont('helvetica', 'bold');
  doc.text(`Joining Date:`, 20, yPos + 32);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDateReadable(student.joiningDate), 52, yPos + 32);

  // Right Column Details
  doc.setFont('helvetica', 'bold');
  doc.text(`Report Period:`, 115, yPos + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(monthKey ? getMonthDisplayName(monthKey) : 'Overall', 148, yPos + 12);

  doc.setFont('helvetica', 'bold');
  doc.text(`Generated On:`, 115, yPos + 22);
  doc.setFont('helvetica', 'normal');
  doc.text(formattedToday, 148, yPos + 22);

  // Fee Status Badge - NO numeric amount shown!
  doc.setFont('helvetica', 'bold');
  doc.text(`Fee Status:`, 115, yPos + 32);
  if (currentMonthFeeStatus === 'Paid') {
    doc.setFillColor(222, 247, 236); // #DEF7EC
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(147, yPos + 26, 28, 8, 2, 2, 'FD');
    doc.setTextColor(3, 84, 63); // #03543F
    doc.setFontSize(9);
    doc.text('PAID ✓', 161, yPos + 31.5, { align: 'center' });
  } else {
    doc.setFillColor(253, 242, 242); // #FDF2F2
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(147, yPos + 26, 32, 8, 2, 2, 'FD');
    doc.setTextColor(155, 28, 28); // #9B1C1C
    doc.setFontSize(9);
    doc.text('PENDING', 163, yPos + 31.5, { align: 'center' });
  }

  yPos += 48;

  // 3. Attendance Summary Box
  doc.setFillColor(239, 246, 255); // #EFF6FF
  doc.setDrawColor(191, 219, 254); // #BFDBFE
  doc.roundedRect(14, yPos, 182, 22, 3, 3, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');

  // Present
  doc.setTextColor(5, 150, 105);
  doc.text(`Present: ${stats.present}`, 18, yPos + 13.5);

  // Absent
  doc.setTextColor(220, 38, 38);
  doc.text(`Absent: ${stats.absent}`, 56, yPos + 13.5);

  // Holiday
  doc.setTextColor(99, 102, 241);
  doc.text(`Holidays: ${stats.holiday}`, 96, yPos + 13.5);

  // Attendance Ratio Percentage (Right-aligned to ensure it stays within box)
  doc.setTextColor(30, 58, 138);
  doc.text(
    `Attendance: ${stats.percentage}% (${stats.badgeLabel})`,
    191,
    yPos + 13.5,
    { align: 'right' }
  );

  yPos += 28;

  // 4. Attendance History Table Title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Attendance Log', 14, yPos);

  yPos += 4;

  const sortedRecords = Object.values(student.attendance)
    .filter((r) => !monthKey || r.date.startsWith(monthKey))
    .sort((a, b) => a.date.localeCompare(b.date));

  const tableBody = sortedRecords.map((r) => [
    formatDateReadable(r.date),
    r.status,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Date', 'Status']],
    body:
      tableBody.length > 0
        ? tableBody
        : [['No attendance records logged for this period.', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138], // Navy #1E3A8A
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 92, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        const val = data.cell.raw as string;
        if (val === 'Present') {
          data.cell.styles.textColor = [5, 150, 105];
        } else if (val === 'Absent') {
          data.cell.styles.textColor = [220, 38, 38];
        } else if (val === 'Holiday') {
          data.cell.styles.textColor = [124, 58, 237];
        }
      }
    },
  });

  // Footer / Professional Verification Note
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 16 : yPos + 30;

  doc.setLineWidth(0.4);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, finalY - 6, 196, finalY - 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  // Centered footer text across the page width (105mm is center for A4)
  doc.text(
    `Generated on: ${formattedToday} • Verma Classes Digital Record Portal`,
    105,
    finalY,
    { align: 'center' }
  );

  doc.save(`Verma_Classes_${student.name.replace(/\s+/g, '_')}_${monthKey || 'Report'}.pdf`);
}

/**
 * Generate Today's PDF summary for student
 */
export function generateTodayStudentPDF(student: Student) {
  const todayStr = new Date().toISOString().split('T')[0];
  generateStudentPDF(student, todayStr.substring(0, 7));
}
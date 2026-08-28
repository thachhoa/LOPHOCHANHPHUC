import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  AlignmentType,
  HeadingLevel,
  TableWidthUnit,
  WidthType,
  BorderStyle,
} from 'docx';
import { Classroom, Student, AttendanceStatus, PointTransaction } from '../types';

// Helper to translate attendance status to Vietnamese
const getStatusText = (status: AttendanceStatus) => {
  switch (status) {
    case 'present':
      return 'Có mặt';
    case 'late':
      return 'Đi muộn';
    case 'excused':
      return 'Vắng có phép';
    case 'unexcused':
      return 'Vắng không phép';
    default:
      return 'Chưa điểm danh';
  }
};

export const exportAttendanceReportDocx = async (
  activeClass: Classroom,
  selectedDate: string,
  students: Student[],
  todayAttendance: Record<string, AttendanceStatus>
) => {
  // Statistics
  const total = students.length;
  let present = 0;
  let late = 0;
  let excused = 0;
  let unexcused = 0;

  students.forEach((s) => {
    const status = todayAttendance[s.id] || 'present';
    if (status === 'present') present++;
    else if (status === 'late') late++;
    else if (status === 'excused') excused++;
    else if (status === 'unexcused') unexcused++;
  });

  const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

  // Table rows
  const tableRows = [
    // Table Header
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          shading: { fill: '059669' }, // emerald-600
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'STT', bold: true, color: 'FFFFFF', size: 22 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          shading: { fill: '059669' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Mã Học Sinh', bold: true, color: 'FFFFFF', size: 22 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 34, type: WidthType.PERCENTAGE },
          shading: { fill: '059669' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Họ và Tên', bold: true, color: 'FFFFFF', size: 22 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          shading: { fill: '059669' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Giới tính', bold: true, color: 'FFFFFF', size: 22 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          shading: { fill: '059669' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Trạng Thái', bold: true, color: 'FFFFFF', size: 22 })],
            }),
          ],
        }),
      ],
    }),
  ];

  // Student rows
  students.forEach((s, idx) => {
    const status = todayAttendance[s.id] || 'present';
    let statusColor = '10B981'; // Emerald (present)
    if (status === 'late') statusColor = 'F59E0B'; // Amber
    else if (status === 'excused') statusColor = '3B82F6'; // Blue
    else if (status === 'unexcused') statusColor = 'EF4444'; // Red

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `${idx + 1}`, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: s.studentCode, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: s.name, bold: true, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: s.gender === 'male' ? 'Nam' : 'Nữ', size: 20 })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: getStatusText(status),
                    bold: true,
                    color: statusColor,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'BÁO CÁO ĐIỂM DANH LỚP HỌC HẠNH PHÚC',
                bold: true,
                color: '047857', // emerald-700
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `Ngày: ${selectedDate} | Năm học: ${activeClass.academicYear}`,
                italics: true,
                size: 20,
              }),
            ],
          }),

          // Info block
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({ text: 'Lớp học: ', bold: true, size: 22 }),
              new TextRun({ text: `${activeClass.name} (${activeClass.code})   |   `, size: 22 }),
              new TextRun({ text: 'Giáo viên chủ nhiệm: ', bold: true, size: 22 }),
              new TextRun({ text: activeClass.teacherName, size: 22 }),
            ],
          }),

          // Summary Stats Block
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: 'I. Tổng Hợp Chuyên Cần', bold: true, color: '1F2937', size: 24 })],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: `• Tổng sĩ số lớp: `, size: 22 }),
              new TextRun({ text: `${total} học sinh\n`, bold: true, size: 22 }),
              new TextRun({ text: `• Số học sinh đi học (Đúng giờ & Muộn): `, size: 22 }),
              new TextRun({ text: `${present + late} em (Có mặt: ${present}, Muộn: ${late})\n`, bold: true, size: 22 }),
              new TextRun({ text: `• Số học sinh vắng mặt: `, size: 22 }),
              new TextRun({ text: `${excused + unexcused} em (Có phép: ${excused}, Không phép: ${unexcused})\n`, bold: true, size: 22 }),
              new TextRun({ text: `• Tỷ lệ chuyên cần của ngày: `, size: 22 }),
              new TextRun({ text: `${attendanceRate}%`, bold: true, color: '059669', size: 22 }),
            ],
          }),

          // Table Header Title
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: 'II. Danh Sách Chi Tiết', bold: true, color: '1F2937', size: 24 })],
          }),

          // Seating Table
          new Table({
            width: {
              size: 100,
              type: TableWidthUnit.PERCENTAGE,
            },
            rows: tableRows,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `BaoCao_DiemDanh_${activeClass.code}_${selectedDate}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

export const exportStudentHappinessReportDocx = async (
  activeClass: Classroom,
  student: Student,
  transactions: PointTransaction[]
) => {
  const studentTx = transactions.filter((t) => t.studentId === student.id);
  const positiveTx = studentTx.filter((t) => t.type === 'positive');
  const negativeTx = studentTx.filter((t) => t.type === 'negative');

  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          shading: { fill: '059669' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'STT', bold: true, color: 'FFFFFF', size: 22 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: '059669' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Thời gian', bold: true, color: 'FFFFFF', size: 22 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          shading: { fill: '059669' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Điểm sao', bold: true, color: 'FFFFFF', size: 22 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 55, type: WidthType.PERCENTAGE },
          shading: { fill: '059669' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Nội dung / Lý do ghi nhận', bold: true, color: 'FFFFFF', size: 22 })],
            }),
          ],
        }),
      ],
    }),
  ];

  studentTx.forEach((tx, idx) => {
    const dateStr = new Date(tx.timestamp).toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `${idx + 1}`, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: dateStr, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: tx.amount > 0 ? `+${tx.amount}` : `${tx.amount}`,
                    bold: true,
                    color: tx.amount >= 0 ? '10B981' : 'EF4444',
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: tx.reason, size: 20 })],
              }),
            ],
          }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'PHIẾU LIÊN LẠC HỌC TẬP HẠNH PHÚC',
                bold: true,
                color: 'D97706', // amber-600
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `Học sinh: ${student.name} | Mã HS: ${student.studentCode}`,
                bold: true,
                size: 22,
              }),
            ],
          }),

          // Info block
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({ text: 'Lớp học: ', bold: true, size: 22 }),
              new TextRun({ text: `${activeClass.name}   |   `, size: 22 }),
              new TextRun({ text: 'GVCN: ', bold: true, size: 22 }),
              new TextRun({ text: `${activeClass.teacherName}   |   `, size: 22 }),
              new TextRun({ text: 'Ngày sinh: ', bold: true, size: 22 }),
              new TextRun({ text: student.birthday, size: 22 }),
            ],
          }),

          // Summary Stats Block
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: 'I. Kết Quả Rèn Luyện & Học Tập', bold: true, color: '1F2937', size: 24 })],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: `• Tổng số điểm sao tích luỹ: `, size: 22 }),
              new TextRun({ text: `${student.stars} sao vàng\n`, bold: true, color: 'D97706', size: 22 }),
              new TextRun({ text: `• Số lần được khen thưởng: `, size: 22 }),
              new TextRun({ text: `${positiveTx.length} lần tích cực\n`, bold: true, color: '10B981', size: 22 }),
              new TextRun({ text: `• Số lần bị nhắc nhở: `, size: 22 }),
              new TextRun({ text: `${negativeTx.length} lần nhắc nhở\n`, bold: true, color: 'EF4444', size: 22 }),
              new TextRun({ text: `• Huy hiệu danh hiệu đã đạt: `, size: 22 }),
              new TextRun({ text: student.badges.join(', ') || 'Chưa nhận huy hiệu', bold: true, size: 22 }),
            ],
          }),

          // Note
          new Paragraph({
            spacing: { before: 100, after: 200 },
            children: [
              new TextRun({ text: 'Ghi chú của giáo viên: ', bold: true, size: 22 }),
              new TextRun({ text: student.notes || 'Em học tập ngoan ngoãn, hòa đồng cùng bạn bè.', size: 22, italics: true }),
            ],
          }),

          // Table Header Title
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: 'II. Nhật Ký Khen Thưởng & Nhắc Nhở', bold: true, color: '1F2937', size: 24 })],
          }),

          // Seating Table
          new Table({
            width: {
              size: 100,
              type: TableWidthUnit.PERCENTAGE,
            },
            rows: tableRows,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `HocBaHanhPhuc_${student.name.replace(/\s+/g, '_')}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

import pptxgen from 'pptxgenjs';
import { Classroom, Student } from '../types';

export const exportLeaderboardPptx = async (activeClass: Classroom, students: Student[]) => {
  const pptx = new pptxgen();
  
  // Define layout
  pptx.layout = 'LAYOUT_16x9';

  const sortedStudents = [...students].sort((a, b) => b.stars - a.stars);
  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];

  // Slide 1: Welcome & Intro
  const slide1 = pptx.addSlide();
  // Background gradient-like background (solid purple for premium look)
  slide1.background = { fill: '4C1D95' }; // purple-900

  // Title Box
  slide1.addText('🏆 BẢNG VINH DANH NGÔI SAO SÁNG 🏆', {
    x: 0.5,
    y: 1.8,
    w: 12.3,
    h: 1.0,
    fontSize: 36,
    bold: true,
    color: 'FBBF24', // yellow-400
    align: 'center',
    fontFace: 'Arial',
  });

  slide1.addText(`Lớp học: ${activeClass.name}\nNăm học: ${activeClass.academicYear}\nGiáo viên chủ nhiệm: ${activeClass.teacherName}`, {
    x: 0.5,
    y: 3.2,
    w: 12.3,
    h: 2.0,
    fontSize: 22,
    color: 'FFFFFF',
    align: 'center',
    lineSpacing: 32,
    fontFace: 'Arial',
  });

  // Footer
  slide1.addText('Ứng dụng Lớp Học Hạnh Phúc', {
    x: 0.5,
    y: 6.5,
    w: 12.3,
    h: 0.5,
    fontSize: 12,
    color: 'A78BFA',
    align: 'center',
  });

  // Slide 2: Top 3 Podium
  if (sortedStudents.length >= 3) {
    const slide2 = pptx.addSlide();
    slide2.background = { fill: '1E1B4B' }; // dark indigo

    slide2.addText('🌟 TOP 3 NGÔI SAO XUẤT SẮC 🌟', {
      x: 0.5,
      y: 0.5,
      w: 12.3,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: 'FBBF24',
      align: 'center',
      fontFace: 'Arial',
    });

    // Top 2: Silver (Left)
    if (top2) {
      // Podium block
      slide2.addShape(pptx.shapes.RECTANGLE, {
        x: 2.0,
        y: 4.2,
        w: 2.5,
        h: 2.0,
        fill: { color: '94A3B8' }, // Slate color
      });
      slide2.addText('🥈 HẠNG 2', {
        x: 2.0,
        y: 4.5,
        w: 2.5,
        h: 0.8,
        fontSize: 20,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
      });
      // Student details
      slide2.addText(`${top2.name}\n⭐ ${top2.stars} sao`, {
        x: 1.5,
        y: 3.0,
        w: 3.5,
        h: 1.0,
        fontSize: 18,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
      });
    }

    // Top 1: Gold (Center)
    if (top1) {
      // Podium block
      slide2.addShape(pptx.shapes.RECTANGLE, {
        x: 5.2,
        y: 3.5,
        w: 2.9,
        h: 2.7,
        fill: { color: 'F59E0B' }, // Gold color
      });
      slide2.addText('👑 QUÁN QUÂN', {
        x: 5.2,
        y: 3.8,
        w: 2.9,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: '1E1B4B',
        align: 'center',
      });
      // Student details
      slide2.addText(`${top1.name}\n⭐ ${top1.stars} sao`, {
        x: 4.7,
        y: 2.1,
        w: 3.9,
        h: 1.2,
        fontSize: 22,
        bold: true,
        color: 'FBBF24',
        align: 'center',
      });
    }

    // Top 3: Bronze (Right)
    if (top3) {
      // Podium block
      slide2.addShape(pptx.shapes.RECTANGLE, {
        x: 8.8,
        y: 4.6,
        w: 2.5,
        h: 1.6,
        fill: { color: 'B45309' }, // Bronze amber-700
      });
      slide2.addText('🥉 HẠNG 3', {
        x: 8.8,
        y: 4.8,
        w: 2.5,
        h: 0.8,
        fontSize: 18,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
      });
      // Student details
      slide2.addText(`${top3.name}\n⭐ ${top3.stars} sao`, {
        x: 8.3,
        y: 3.5,
        w: 3.5,
        h: 1.0,
        fontSize: 18,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
      });
    }
  }

  // Slide 3: Full Table
  const slide3 = pptx.addSlide();
  slide3.background = { fill: 'F8FAFC' }; // light slate

  slide3.addText('BẢNG XẾP HẠNG TOÀN LỚP', {
    x: 0.5,
    y: 0.4,
    w: 12.3,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: '047857',
    align: 'center',
  });

  // Table Columns Headers
  const tableData: any[][] = [
    [
      { text: 'Hạng', options: { bold: true, color: 'FFFFFF', fill: '059669', align: 'center' } },
      { text: 'Mã Học Sinh', options: { bold: true, color: 'FFFFFF', fill: '059669', align: 'center' } },
      { text: 'Họ và Tên', options: { bold: true, color: 'FFFFFF', fill: '059669' } },
      { text: 'Số Sao', options: { bold: true, color: 'FFFFFF', fill: '059669', align: 'center' } },
      { text: 'Danh Hiệu', options: { bold: true, color: 'FFFFFF', fill: '059669' } },
    ],
  ];

  // Fill in Top 10
  const displayLimit = Math.min(10, sortedStudents.length);
  for (let i = 0; i < displayLimit; i++) {
    const s = sortedStudents[i];
    let badgeText = s.badges.join(', ');
    if (badgeText.length > 25) badgeText = badgeText.substring(0, 22) + '...';

    tableData.push([
      { text: `${i + 1}`, options: { align: 'center' } },
      { text: s.studentCode, options: { align: 'center' } },
      { text: s.name, options: { bold: i < 3 } },
      { text: `${s.stars} sao`, options: { align: 'center', bold: true } },
      { text: badgeText || 'Học sinh tích cực' },
    ]);
  }

  slide3.addTable(tableData, {
    x: 1.0,
    y: 1.2,
    w: 11.3,
    rowH: 0.4,
    colW: [1.0, 2.0, 4.0, 1.8, 2.5],
    fontSize: 14,
    border: { color: 'E2E8F0', pt: 1 },
  });

  if (sortedStudents.length > 10) {
    slide3.addText(`* Chỉ hiển thị Top 10 học sinh xuất sắc nhất trên tổng số ${sortedStudents.length} học sinh.`, {
      x: 1.0,
      y: 6.2,
      w: 11.3,
      h: 0.4,
      fontSize: 10,
      color: '64748B',
      italics: true,
    });
  }

  await pptx.writeFile({ fileName: `VinhDanh_${activeClass.code}.pptx` });
};

export const exportSeatingPptx = async (activeClass: Classroom, students: Student[]) => {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const slide = pptx.addSlide();
  slide.background = { fill: 'F1F5F9' }; // slate-100

  // Title blackboard
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 2.0,
    y: 0.3,
    w: 9.3,
    h: 0.7,
    fill: { color: '065F46' }, // dark emerald
    line: { color: 'B45309', width: 3 }, // bronze border
  });

  slide.addText(`🏫 SƠ ĐỒ CHỖ NGỒI - LỚP ${activeClass.name.toUpperCase()}`, {
    x: 2.0,
    y: 0.3,
    w: 9.3,
    h: 0.7,
    fontSize: 20,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle',
  });

  // Teacher desk
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 5.4,
    y: 1.2,
    w: 2.5,
    h: 0.5,
    fill: { color: 'FEF3C7' }, // amber-100
    line: { color: 'F59E0B', width: 1 },
  });
  slide.addText('🧑‍🏫 Bàn Giáo Viên', {
    x: 5.4,
    y: 1.2,
    w: 2.5,
    h: 0.5,
    fontSize: 11,
    bold: true,
    color: '78350F',
    align: 'center',
    valign: 'middle',
  });

  // Physical grid layout coordinates calculation
  // PowerPoint width 13.33 inches, height 7.5 inches
  const rowsCount = activeClass.rows || 4;
  const colsCount = activeClass.cols || 6;

  const startX = 0.8;
  const startY = 2.0;
  const availableW = 11.7;
  const availableH = 4.8;

  const deskW = availableW / colsCount - 0.2;
  const deskH = availableH / rowsCount - 0.2;

  for (let r = 0; r < rowsCount; r++) {
    for (let c = 0; c < colsCount; c++) {
      const student = students.find((s) => s.seatRow === r && s.seatCol === c);
      const xPos = startX + c * (deskW + 0.2);
      const yPos = startY + r * (deskH + 0.2);

      if (student) {
        // Seat rectangle
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
          x: xPos,
          y: yPos,
          w: deskW,
          h: deskH,
          fill: { color: 'FFFFFF' },
          line: { color: 'CBD5E1', width: 1 },
        });

        // Student name
        slide.addText(student.name, {
          x: xPos + 0.05,
          y: yPos + 0.08,
          w: deskW - 0.1,
          h: deskH * 0.45,
          fontSize: 10,
          bold: true,
          color: '1E293B',
          align: 'center',
          valign: 'middle',
        });

        // Student Code & Stars
        slide.addText(`${student.studentCode} | ⭐ ${student.stars}`, {
          x: xPos + 0.05,
          y: yPos + deskH * 0.5,
          w: deskW - 0.1,
          h: deskH * 0.35,
          fontSize: 8,
          color: 'F59E0B',
          align: 'center',
          valign: 'top',
        });
      } else {
        // Empty Desk
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
          x: xPos,
          y: yPos,
          w: deskW,
          h: deskH,
          fill: { color: 'E2E8F0' },
          line: { color: 'CBD5E1', width: 1, dashType: 'dash' },
        });
        slide.addText('Bàn Trống', {
          x: xPos,
          y: yPos,
          w: deskW,
          h: deskH,
          fontSize: 9,
          color: '94A3B8',
          align: 'center',
          valign: 'middle',
        });
      }
    }
  }

  await pptx.writeFile({ fileName: `SoDoLop_${activeClass.code}.pptx` });
};

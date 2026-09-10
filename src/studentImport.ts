import { Student } from '../types';

export const STUDENT_FILE_TEMPLATE_HEADER = 'Họ tên học sinh,Ngày sinh,Giới tính,Họ tên phụ huynh,Số điện thoại';

export const STUDENT_FILE_TEMPLATE_CSV = `\uFEFF${STUDENT_FILE_TEMPLATE_HEADER}
Nguyễn Minh Anh,2016-04-12,Nữ,Nguyễn Văn Hùng,0912345678
Trần Bảo Long,2016-08-20,Nam,Trần Đình Trọng,0987654321
Lê Gia Hân,2016-01-15,Nữ,Lê Thanh Bình,0903112233
Phạm Đức Duy,2016-11-05,Nam,Phạm Văn Nam,0978990011
Vũ Thảo Nguyên,2016-03-28,Nữ,Vũ Đức Thắng,0934567890`;

export const downloadStudentTemplate = () => {
  const blob = new Blob([STUDENT_FILE_TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Mau_Danh_Sach_Hoc_Sinh.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Robustly parses a single CSV line accounting for quoted text and escaped quotes
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' || char === "'") {
      if (inQuotes && line[i + 1] === char) {
        current += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Remove Vietnamese accents and convert to lowercase for flexible header matching
 */
function normalizeHeader(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim();
}

/**
 * Convert date strings like DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD format
 */
function normalizeDate(dateStr: string): string {
  if (!dateStr) return '2016-01-01';
  const cleanStr = dateStr.trim();
  
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    return cleanStr;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const parts = cleanStr.split(/[\/\-\.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) { // YYYY/MM/DD
      const [y, m, d] = parts;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    } else if (parts[2].length === 4) { // DD/MM/YYYY
      const [d, m, y] = parts;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return cleanStr || '2016-01-01';
}

export interface ParsedImportResult {
  success: boolean;
  message?: string;
  students: Omit<Student, 'id' | 'stars' | 'badges' | 'seatRow' | 'seatCol'>[];
}

export function parseStudentListText(text: string, activeClassId: string): ParsedImportResult {
  if (!text || !text.trim()) {
    return { success: false, message: 'Tệp danh sách trống, vui lòng chọn tệp có chứa dữ liệu học sinh!', students: [] };
  }

  // Strip BOM \uFEFF if present
  let cleanText = text.replace(/^\uFEFF/, '').trim();

  // Check for binary Excel / ZIP content (PK\x03\x04 or non-printable ASCII count)
  if (cleanText.startsWith('PK\x03\x04') || cleanText.startsWith('D0-CF-11-E0')) {
    return {
      success: false,
      message: 'Tệp bạn chọn là tệp Excel nhị phân (.xlsx / .xls). Vui lòng lưu tệp Excel dưới dạng CSV (UTF-8) hoặc tải tệp mẫu CSV của hệ thống!',
      students: [],
    };
  }

  const rawLines = cleanText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (rawLines.length === 0) {
    return { success: false, message: 'Tệp danh sách không có dữ liệu!', students: [] };
  }

  // Auto detect delimiter: check count of ',', ';', '\t' in first line
  const firstLine = rawLines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  let delimiter = ',';
  if (semiCount > commaCount && semiCount >= tabCount) {
    delimiter = ';';
  } else if (tabCount > commaCount && tabCount > semiCount) {
    delimiter = '\t';
  }

  // Analyze headers
  const firstLineCols = parseCSVLine(firstLine, delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
  const normalizedCols = firstLineCols.map(normalizeHeader);

  let nameIdx = -1;
  let bdayIdx = -1;
  let genderIdx = -1;
  let parentIdx = -1;
  let phoneIdx = -1;
  let isHeaderRow = false;

  normalizedCols.forEach((col, idx) => {
    if (col.includes('ho ten') || col.includes('ten hoc sinh') || col.includes('ten hs') || col === 'ten' || col === 'ho va ten') {
      nameIdx = idx;
      isHeaderRow = true;
    } else if (col.includes('ngay sinh') || col.includes('namsinh') || col === 'birthday' || col.includes('sinh nhat')) {
      bdayIdx = idx;
      isHeaderRow = true;
    } else if (col.includes('gioi tinh') || col === 'gender' || col.includes('nam/nu')) {
      genderIdx = idx;
      isHeaderRow = true;
    } else if (col.includes('phu huynh') || col.includes('ho ten phu huynh') || col === 'parent' || col.includes('cha me')) {
      parentIdx = idx;
      isHeaderRow = true;
    } else if (col.includes('sdt') || col.includes('so dien thoai') || col.includes('phone') || col.includes('dien thoai')) {
      phoneIdx = idx;
      isHeaderRow = true;
    }
  });

  let startIndex = 0;
  if (isHeaderRow) {
    startIndex = 1;
  } else {
    // Default mapping for 5 columns requirement:
    // Col 0: Họ tên học sinh, Col 1: Ngày sinh, Col 2: Giới tính, Col 3: Họ tên phụ huynh, Col 4: SĐT
    // If col 0 is a number (STT) or Student Code (e.g. HS-01), adjust index offsets
    const isFirstColIndex = /^\d+$/.test(firstLineCols[0]) || /^HS/i.test(firstLineCols[0]);
    if (isFirstColIndex && firstLineCols.length >= 6) {
      nameIdx = 1;
      bdayIdx = 3;
      genderIdx = 2;
      parentIdx = 4;
      phoneIdx = 5;
    } else {
      nameIdx = 0;
      bdayIdx = 1;
      genderIdx = 2;
      parentIdx = 3;
      phoneIdx = 4;
    }
  }

  const parsedStudents: Omit<Student, 'id' | 'stars' | 'badges' | 'seatRow' | 'seatCol'>[] = [];

  for (let i = startIndex; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line, delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
    if (cols.length === 0) continue;

    // Get student name
    const rawName = nameIdx >= 0 && cols[nameIdx] ? cols[nameIdx] : (cols[0] || '');
    if (!rawName || /^(stt|mã|mã hs|họ và tên|họ tên)$/i.test(rawName)) continue;

    const rawBday = bdayIdx >= 0 && cols[bdayIdx] ? cols[bdayIdx] : (cols[1] || '');
    const rawGender = genderIdx >= 0 && cols[genderIdx] ? cols[genderIdx] : (cols[2] || '');
    const rawParent = parentIdx >= 0 && cols[parentIdx] ? cols[parentIdx] : (cols[3] || '');
    const rawPhone = phoneIdx >= 0 && cols[phoneIdx] ? cols[phoneIdx] : (cols[4] || '');

    const genderNormalized = normalizeHeader(rawGender);
    const gender: 'male' | 'female' = genderNormalized.includes('nu') || genderNormalized === 'female' || genderNormalized === 'f'
      ? 'female'
      : 'male';

    const formattedBday = normalizeDate(rawBday);
    const studentCode = `HS-${String(parsedStudents.length + 1).padStart(2, '0')}`;

    parsedStudents.push({
      classId: activeClassId,
      studentCode,
      name: rawName,
      gender,
      birthday: formattedBday,
      avatar: '',
      parentName: rawParent || 'Phụ huynh học sinh',
      parentPhone: rawPhone || '0901 234 567',
      notes: 'Học sinh nhập theo danh sách cả lớp.',
      hobby: 'Học tập & Vui chơi',
      dream: 'Ước mơ tương lai',
    });
  }

  if (parsedStudents.length === 0) {
    return {
      success: false,
      message: 'Không tìm thấy tên học sinh hợp lệ nào trong tệp! Vui lòng kiểm tra lại định dạng tệp.',
      students: [],
    };
  }

  return {
    success: true,
    students: parsedStudents,
  };
}

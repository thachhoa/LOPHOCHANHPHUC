import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Upload, Sparkles } from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';

export const AvatarCropModal: React.FC = () => {
  const {
    isCropModalOpen,
    setIsCropModalOpen,
    cropTargetStudentId,
    cropSourceImage,
    updateStudentAvatar,
    students,
  } = useClassroom();

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetStudent = students.find(s => s.id === cropTargetStudentId);

  useEffect(() => {
    if (cropSourceImage) {
      setCurrentImageSrc(cropSourceImage);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else if (targetStudent?.avatar) {
      setCurrentImageSrc(targetStudent.avatar);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [cropSourceImage, targetStudent]);

  if (!isCropModalOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentImageSrc(reader.result as string);
        setScale(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCrop = () => {
    if (!currentImageSrc || !cropTargetStudentId) return;

    const canvas = document.createElement('canvas');
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      // Create circular clipping mask
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      // Compute scaled drawing
      const baseWidth = size;
      const baseHeight = (img.height / img.width) * size;
      const drawWidth = baseWidth * scale;
      const drawHeight = baseHeight * scale;

      const drawX = (size - drawWidth) / 2 + position.x;
      const drawY = (size - drawHeight) / 2 + position.y;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      updateStudentAvatar(cropTargetStudentId, croppedDataUrl);
      setIsCropModalOpen(false);
    };
    img.src = currentImageSrc;
  };

  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595454223600-91fbdd77e584?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=250&auto=format&fit=crop&q=80',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-emerald-50 to-teal-50">
            <div>
              <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Cắt & Chỉnh sửa Ảnh Đại Diện
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Học sinh: <span className="font-medium text-slate-700">{targetStudent?.name}</span>
              </p>
            </div>
            <button
              id="btn-close-crop-modal"
              onClick={() => setIsCropModalOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Crop Area */}
          <div className="p-6 flex flex-col items-center">
            {/* Interactive Viewport */}
            <div
              className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-emerald-500 shadow-inner bg-slate-100 cursor-move select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {currentImageSrc ? (
                <img
                  src={currentImageSrc}
                  alt="Crop preview"
                  draggable={false}
                  className="absolute pointer-events-none origin-center"
                  referrerPolicy="no-referrer"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    maxWidth: 'none',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Upload className="w-8 h-8 mb-2 text-slate-300" />
                  <span className="text-xs font-medium">Chưa có ảnh</span>
                </div>
              )}

              {/* Grid overlay */}
              <div className="absolute inset-0 border border-white/40 pointer-events-none rounded-full" />
            </div>

            <p className="text-xs text-slate-500 mt-3 text-center">
              💡 Kéo chuột để di chuyển ảnh, dùng thanh trượt bên dưới để phóng to / thu nhỏ
            </p>

            {/* Zoom Slider Controls */}
            <div className="w-full mt-5 px-4 flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-slate-400" />
              <input
                id="crop-zoom-slider"
                type="range"
                min="0.8"
                max="3"
                step="0.05"
                value={scale}
                onChange={e => setScale(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <ZoomIn className="w-4 h-4 text-slate-400" />
              <button
                id="btn-reset-crop"
                title="Khôi phục vị trí"
                onClick={() => {
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Upload or Preset Options */}
            <div className="w-full mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-600">Chọn ảnh mẫu hoặc tải ảnh từ máy:</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  id="btn-upload-avatar-file"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Tải ảnh từ máy
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentImageSrc(url);
                      setScale(1);
                      setPosition({ x: 0, y: 0 });
                    }}
                    className={`w-11 h-11 rounded-full overflow-hidden border-2 shrink-0 transition-transform hover:scale-105 ${
                      currentImageSrc === url ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'
                    }`}
                  >
                    <img src={url} alt="Preset" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              id="btn-cancel-crop"
              onClick={() => setIsCropModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Huỷ
            </button>
            <button
              id="btn-save-crop"
              onClick={handleSaveCrop}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs shadow-emerald-600/30 rounded-xl flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              Lưu Ảnh Đại Diện
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

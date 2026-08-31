import React, { useState } from 'react';
import {
  Gift,
  Star,
  Plus,
  Edit2,
  Trash2,
  Check,
  Sparkles,
  Award,
  Clock,
  History,
  ShoppingBag,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useClassroom } from '../../context/ClassroomContext';
import { RewardItem, Student } from '../../types';

export const RewardStoreView: React.FC = () => {
  const {
    rewards,
    redemptions,
    pointTransactions,
    currentStudents,
    redeemReward,
    addRewardItem,
    updateRewardItem,
    deleteRewardItem,
    activeClass,
    classes,
  } = useClassroom();

  const [activeTab, setActiveTab] = useState<'store' | 'history' | 'transactions'>('store');
  const [selectedRewardToRedeem, setSelectedRewardToRedeem] = useState<RewardItem | null>(null);
  const [selectedStudentForRedeem, setSelectedStudentForRedeem] = useState<string>('');
  const [redeemFeedback, setRedeemFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<Student | null>(null);

  const [isRewardFormOpen, setIsRewardFormOpen] = useState(false);
  const [editingRewardItem, setEditingRewardItem] = useState<RewardItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    cost: number;
    stock: number;
    category: 'stationery' | 'voucher' | 'badge' | 'toy' | 'book';
    description: string;
    color: string;
    icon: string;
    classIds: string[];
  }>({
    name: '',
    cost: 15,
    stock: 10,
    category: 'stationery',
    description: '',
    color: '#3B82F6',
    icon: 'Gift',
    classIds: [],
  });

  const handleOpenAddReward = () => {
    setEditingRewardItem(null);
    setFormData({
      name: '',
      cost: 15,
      stock: 10,
      category: 'stationery',
      description: '',
      color: '#3B82F6',
      icon: 'Gift',
      classIds: [activeClass.id],
    });
    setIsRewardFormOpen(true);
  };

  const handleOpenEditReward = (item: RewardItem) => {
    setEditingRewardItem(item);
    setFormData({
      name: item.name,
      cost: item.cost,
      stock: item.stock,
      category: item.category,
      description: item.description,
      color: item.color,
      icon: item.icon,
      classIds: item.classIds || [],
    });
    setIsRewardFormOpen(true);
  };

  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingRewardItem) {
      updateRewardItem({
        ...editingRewardItem,
        ...formData,
      });
    } else {
      addRewardItem(formData);
    }
    setIsRewardFormOpen(false);
  };

  const handleExecuteRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRewardToRedeem || !selectedStudentForRedeem) return;

    const res = redeemReward(selectedStudentForRedeem, selectedRewardToRedeem.id);

    if (res.success) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
      setRedeemFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setRedeemFeedback(null);
        setSelectedRewardToRedeem(null);
      }, 2000);
    } else {
      setRedeemFeedback({ type: 'error', message: res.message });
    }
  };

  const filteredRewards = rewards.filter(item => 
    !item.classIds || item.classIds.length === 0 || item.classIds.includes(activeClass.id)
  );

  const sortedAndFilteredStudents = currentStudents
    .filter(s => s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()))
    .sort((a, b) => b.stars - a.stars);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Gift className="w-6 h-6 text-amber-500" />
              Cửa Hàng Đổi Quà & Gamification
            </h2>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              {activeClass.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quy đổi sao thưởng thành các phần quà học tập và đặc quyền hấp dẫn
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              id="tab-reward-store"
              onClick={() => setActiveTab('store')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'store' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kho Quà ({filteredRewards.length})
            </button>
            <button
              id="tab-reward-history"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lịch Sử Đổi ({redemptions.length})
            </button>
            <button
              id="tab-reward-transactions"
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'transactions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nhật Ký Sao
            </button>
          </div>

          <button
            id="btn-add-new-reward"
            onClick={handleOpenAddReward}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-amber-500/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm Quà Mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'store' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRewards.map(item => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                      >
                        {item.category === 'stationery' ? 'Dụng cụ học tập' : item.category === 'voucher' ? 'Đặc quyền / Vé' : item.category === 'badge' ? 'Huy hiệu danh dự' : 'Sách & Truyện'}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditReward(item)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Xoá phần quà "${item.name}"?`)) {
                              deleteRewardItem(item.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-3 shadow-sm mx-auto group-hover:scale-105 transition-transform" style={{ backgroundColor: item.color }}>
                      <Gift className="w-7 h-7" />
                    </div>

                    <div className="text-center mb-4">
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-amber-600 transition-colors">{item.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 min-h-[32px]">{item.description || 'Không có mô tả chi tiết.'}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Sao cần đổi</span>
                      <span className="text-sm font-black text-amber-600 flex items-center gap-0.5">
                        {item.cost}
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      </span>
                    </div>

                    <button
                      disabled={item.stock <= 0}
                      onClick={() => {
                        setSelectedRewardToRedeem(item);
                        const firstEligible = currentStudents.find(s => s.stars >= item.cost);
                        setSelectedStudentForRedeem(firstEligible?.id || currentStudents[0]?.id || '');
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer ${
                        item.stock > 0
                          ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {item.stock > 0 ? (
                        <>
                          <span>Đổi quà</span>
                          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded">Tồn: {item.stock}</span>
                        </>
                      ) : (
                        <span>Hết hàng</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {filteredRewards.length === 0 && (
                <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs">
                  Chưa có phần quà nào trong kho. Nhấp "Thêm Quà Mới" để bắt đầu!
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50/70 border-b border-slate-100 font-bold text-xs text-slate-600 uppercase tracking-wider">
                Lịch sử quy đổi phần quà của lớp ({redemptions.length})
              </div>

              <div className="divide-y divide-slate-100">
                {redemptions.map(rd => (
                  <div key={rd.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        <Gift className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">
                          {rd.studentName} <span className="font-normal text-slate-400">đã đổi</span> {rd.itemName}
                        </h4>
                        <p className="text-slate-500 text-[10px]">Mã giao dịch: {rd.id.substring(0, 8)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500" />
                        -{rd.cost} sao
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(rd.timestamp).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}

                {redemptions.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">Chưa có lịch sử đổi quà nào.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50/70 border-b border-slate-100 font-bold text-xs text-slate-600 uppercase tracking-wider">
                Nhật ký thưởng & Trừ sao ({pointTransactions.length})
              </div>

              <div className="divide-y divide-slate-100">
                {pointTransactions.map(tx => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                          tx.type === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {tx.type === 'positive' ? '+' : '-'}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-800">{tx.studentName}</h4>
                        <p className="text-slate-500">{tx.reason}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${tx.type === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} sao
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(tx.timestamp).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-4 h-fit max-h-[calc(100vh-180px)] overflow-y-auto lg:sticky lg:top-6">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="flex items-center gap-1.5">⭐ Bảng Sao Học Sinh</span>
            <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              {currentStudents.length} HS
            </span>
          </h3>
          
          <input
            type="text"
            placeholder="Tìm nhanh học sinh..."
            value={studentSearchQuery}
            onChange={(e) => setStudentSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-bold"
          />

          <div className="space-y-1.5 max-h-[400px] lg:max-h-[550px] overflow-y-auto pr-1">
            {sortedAndFilteredStudents.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => setSelectedStudentDetails(s)}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-amber-50/50 hover:border-amber-200/60 transition-all border border-transparent bg-slate-50/25 cursor-pointer group/item hover:shadow-2xs"
                title="Nhấp để xem chi tiết sao & lịch sử đổi quà"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 w-4 text-center">{idx + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {s.avatar ? (
                      <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-[10px] font-bold text-blue-600 uppercase">{s.name.substring(0, 2)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-800 block truncate leading-tight group-hover/item:text-amber-700 transition-colors">{s.name}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">{s.studentCode}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-600 shrink-0 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                  ⭐ {s.stars}
                </span>
              </div>
            ))}
            {sortedAndFilteredStudents.length === 0 && (
              <div className="text-center text-slate-400 text-[11px] py-4">Không tìm thấy học sinh.</div>
            )}
          </div>
        </div>
      </div>

      {selectedRewardToRedeem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                Xác nhận Đổi Quà
              </h3>
              <button
                id="btn-close-redeem-modal"
                onClick={() => setSelectedRewardToRedeem(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: selectedRewardToRedeem.color }}>
                <Gift className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-sm">{selectedRewardToRedeem.name}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs">
                  <span className="font-bold text-amber-800">Cần: {selectedRewardToRedeem.cost} ⭐</span>
                  <span className="text-slate-400">• Tồn: {selectedRewardToRedeem.stock} món</span>
                </div>
              </div>
            </div>

            {redeemFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold mb-3 flex items-center gap-2 ${
                  redeemFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {redeemFeedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {redeemFeedback.message}
              </div>
            )}

            <form onSubmit={handleExecuteRedeem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn học sinh đổi món quà này:
                </label>
                <select
                  id="select-student-for-redeem"
                  value={selectedStudentForRedeem}
                  onChange={e => setSelectedStudentForRedeem(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  {currentStudents.map(s => {
                    const canAfford = s.stars >= selectedRewardToRedeem.cost;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.stars} ⭐) {canAfford ? '✅ Đủ sao' : '❌ Chưa đủ sao'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  id="btn-cancel-redeem-modal"
                  onClick={() => setSelectedRewardToRedeem(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  id="btn-confirm-redeem-modal"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs cursor-pointer"
                >
                  Xác nhận Đổi Quà
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRewardFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                {editingRewardItem ? 'Chỉnh Sửa Món Quà' : 'Thêm Quà Mới Vào Kho'}
              </h3>
              <button
                id="btn-close-reward-form"
                onClick={() => setIsRewardFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReward} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tên món quà *</label>
                <input
                  id="input-reward-name"
                  type="text"
                  required
                  placeholder="Ví dụ: Bút dạ quang Pastel"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Giá đổi (Sao) *</label>
                  <input
                    id="input-reward-cost"
                    type="number"
                    min="1"
                    required
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Số lượng tồn kho *</label>
                  <input
                    id="input-reward-stock"
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Phân loại quà</label>
                <select
                  id="input-reward-category"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as 'stationery' | 'voucher' | 'badge' | 'toy' | 'book' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="stationery">Dụng cụ học tập</option>
                  <option value="voucher">Đặc quyền / Vé miễn bài</option>
                  <option value="badge">Huy hiệu danh dự</option>
                  <option value="book">Sách & Truyện tranh</option>
                  <option value="toy">Đồ chơi trí tuệ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Mô tả quà tặng</label>
                <textarea
                  id="input-reward-desc"
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ghi chú chi tiết về món quà..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Lớp học được áp dụng quà tặng *
                </label>
                <div className="flex flex-wrap gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {classes.map(c => {
                    const isChecked = formData.classIds.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const updatedIds = isChecked
                              ? formData.classIds.filter(id => id !== c.id)
                              : [...formData.classIds, c.id];
                            setFormData({ ...formData, classIds: updatedIds });
                          }}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded border-slate-300 cursor-pointer"
                        />
                        <span>{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Màu chủ đạo</label>
                <div className="flex gap-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        formData.color === color ? 'border-slate-800 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  id="btn-cancel-reward-form"
                  onClick={() => setIsRewardFormOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  id="btn-submit-reward-form"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingRewardItem ? 'Lưu Thay Đổi' : 'Thêm Vào Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Student Stars & Redemption History Modal */}
      {selectedStudentDetails && (() => {
        const studentRedemptions = redemptions.filter(r => r.studentId === selectedStudentDetails.id);
        const totalSpent = studentRedemptions.reduce((sum, r) => sum + r.cost, 0);
        const initialStars = selectedStudentDetails.stars + totalSpent;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {selectedStudentDetails.avatar ? (
                      <img src={selectedStudentDetails.avatar} alt={selectedStudentDetails.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-xs font-bold text-blue-600 uppercase">{selectedStudentDetails.name.substring(0, 2)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base leading-tight">
                      {selectedStudentDetails.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                      Mã HS: {selectedStudentDetails.studentCode}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudentDetails(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Stars Summary Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Sao Ban Đầu</span>
                  <span className="text-lg font-black text-amber-600 block mt-1">
                    ⭐ {initialStars}
                  </span>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-amber-800/80 font-bold block uppercase tracking-wider">Quà Đã Đổi</span>
                  <span className="text-lg font-black text-amber-700 block mt-1">
                    🎁 {studentRedemptions.length}
                  </span>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">Sao Còn Lại</span>
                  <span className="text-lg font-black text-emerald-600 block mt-1">
                    ⭐ {selectedStudentDetails.stars}
                  </span>
                </div>
              </div>

              {/* Redemption History list */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Danh sách quà đã đổi ({studentRedemptions.length})
                </h4>
                
                <div className="max-h-[200px] overflow-y-auto pr-1 divide-y divide-slate-100 border border-slate-100 rounded-2xl bg-slate-50/30">
                  {studentRedemptions.map(rd => (
                    <div key={rd.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <h5 className="font-bold text-slate-800">{rd.itemName}</h5>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(rd.timestamp).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                        -{rd.cost} sao
                      </span>
                    </div>
                  ))}
                  {studentRedemptions.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Học sinh chưa thực hiện đổi quà nào.
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedStudentDetails(null)}
                  className="px-5 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

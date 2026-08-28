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
import { RewardItem } from '../../types';

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
    setSelectedStudent,
  } = useClassroom();

  const [activeTab, setActiveTab] = useState<'store' | 'history' | 'transactions'>('store');
  const [selectedRewardToRedeem, setSelectedRewardToRedeem] = useState<RewardItem | null>(null);
  const [selectedStudentForRedeem, setSelectedStudentForRedeem] = useState<string>('');
  const [redeemFeedback, setRedeemFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add / Edit Reward Item Form Modal
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
  }>({
    name: '',
    cost: 15,
    stock: 10,
    category: 'stationery',
    description: '',
    color: '#3B82F6',
    icon: 'Gift',
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

  // Filter students who can afford the selected reward
  const eligibleStudents = selectedRewardToRedeem
    ? currentStudents.filter(s => s.stars >= selectedRewardToRedeem.cost)
    : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
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

        {/* Tab & Add Button */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              id="tab-reward-store"
              onClick={() => setActiveTab('store')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'store' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kho Quà ({rewards.length})
            </button>
            <button
              id="tab-reward-history"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lịch Sử Đổi ({redemptions.length})
            </button>
            <button
              id="tab-reward-transactions"
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'transactions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nhật Ký Sao
            </button>
          </div>

          <button
            id="btn-add-new-reward"
            onClick={handleOpenAddReward}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-amber-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Thêm Quà Mới
          </button>
        </div>
      </div>

      {/* Main Content based on Tab */}
      {activeTab === 'store' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewards.map(item => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Category Badge & Actions */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    {item.category === 'stationery'
                      ? 'Dụng cụ học tập'
                      : item.category === 'voucher'
                      ? 'Đặc quyền / Vé'
                      : item.category === 'badge'
                      ? 'Huy hiệu danh dự'
                      : 'Sách & Truyện'}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`btn-edit-reward-${item.id}`}
                      onClick={() => handleOpenEditReward(item)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-delete-reward-${item.id}`}
                      onClick={() => {
                        if (window.confirm(`Xoá phần quà "${item.name}"?`)) {
                          deleteRewardItem(item.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Gift Visual Icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-3 shadow-sm mx-auto group-hover:scale-105 transition-transform" style={{ backgroundColor: item.color }}>
                  <Gift className="w-7 h-7" />
                </div>

                {/* Info */}
                <h3 className="font-bold text-slate-800 text-sm text-center mb-1 line-clamp-1">{item.name}</h3>
                <p className="text-xs text-slate-500 text-center mb-3 line-clamp-2 leading-relaxed min-h-[32px]">
                  {item.description}
                </p>
              </div>

              {/* Price & Stock */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Giá đổi:</span>
                  <div className="flex items-center gap-1 font-extrabold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{item.cost} sao</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Tồn kho:</span>
                  <span className={`font-semibold ${item.stock > 0 ? 'text-slate-700' : 'text-rose-600 font-bold'}`}>
                    {item.stock > 0 ? `${item.stock} món` : 'Hết quà'}
                  </span>
                </div>

                {/* Redeem Trigger Button */}
                <button
                  id={`btn-redeem-reward-${item.id}`}
                  onClick={() => {
                    setSelectedRewardToRedeem(item);
                    setSelectedStudentForRedeem(currentStudents[0]?.id || '');
                    setRedeemFeedback(null);
                  }}
                  disabled={item.stock <= 0}
                  className="w-full py-2 bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {item.stock > 0 ? 'Đổi Quà Cho Học Sinh' : 'Hết Hàng'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Redemption History View */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-100 font-bold text-xs text-slate-600 uppercase tracking-wider">
            Danh sách quà tặng đã đổi thành công ({redemptions.length})
          </div>

          <div className="divide-y divide-slate-100">
            {redemptions.map(rd => (
              <div key={rd.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <img
                    src={rd.studentAvatar}
                    alt={rd.studentName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{rd.studentName}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      Đã nhận: <strong className="text-amber-700">{rd.itemName}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
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

      {/* Star Point Transactions */}
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

      {/* Redeem Modal Dialog */}
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
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Gift preview */}
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
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
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  id="btn-confirm-redeem-modal"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs"
                >
                  Xác nhận Đổi Quà
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Reward Item Modal */}
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
                className="text-slate-400 hover:text-slate-600"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Màu chủ đạo</label>
                <div className="flex gap-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
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
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  id="btn-submit-reward-form"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs"
                >
                  {editingRewardItem ? 'Lưu Thay Đổi' : 'Thêm Vào Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

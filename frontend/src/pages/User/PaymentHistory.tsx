import { useState } from 'react';
import './PaymentHistory.css';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string;
  invoice?: string;
}

const PaymentHistory = () => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  const transactions: Transaction[] = [
    {
      id: 'TXN001',
      date: '2024-01-10',
      description: 'Gói Pro - Thanh toán tháng 1',
      amount: 299000,
      status: 'completed',
      method: 'Momo',
      invoice: 'INV-2024-001'
    },
    {
      id: 'TXN002',
      date: '2024-01-08',
      description: 'Buổi tư vấn với Dr. Trần Thị B',
      amount: 500000,
      status: 'completed',
      method: 'ZaloPay',
      invoice: 'INV-2024-002'
    },
    {
      id: 'TXN003',
      date: '2024-01-05',
      description: 'Gói Pro - Thanh toán tháng 12',
      amount: 299000,
      status: 'completed',
      method: 'Momo',
      invoice: 'INV-2023-12'
    },
    {
      id: 'TXN004',
      date: '2024-01-03',
      description: 'Buổi tư vấn với Dr. Nguyễn Văn A',
      amount: 450000,
      status: 'pending',
      method: 'Chuyển khoản'
    },
    {
      id: 'TXN005',
      date: '2023-12-28',
      description: 'Gói Pro - Thanh toán tháng 11',
      amount: 299000,
      status: 'completed',
      method: 'Thẻ visa',
      invoice: 'INV-2023-11'
    },
    {
      id: 'TXN006',
      date: '2023-12-20',
      description: 'Buổi tư vấn với Dr. Lê Văn C',
      amount: 550000,
      status: 'failed',
      method: 'Momo'
    }
  ];

  const filteredTransactions = transactions.filter(
    t => filter === 'all' || t.status === filter
  );

  const totalSpent = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { label: 'Thành công', class: 'status-success' },
      pending: { label: 'Đang xử lý', class: 'status-pending' },
      failed: { label: 'Thất bại', class: 'status-failed' }
    };
    return badges[status as keyof typeof badges];
  };

  return (
    <div className="payment-history-page">
      {/* Header */}
      <div className="payment-header">
        <div>
          <h1 className="payment-title">Lịch Sử Thanh Toán</h1>
          <p className="payment-subtitle">Quản lý hóa đơn và giao dịch</p>
        </div>
        <div className="total-spent">
          <div className="spent-label">Tổng chi tiêu</div>
          <div className="spent-amount">
            {(totalSpent / 1000000).toFixed(2)}M ₫
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="payment-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả ({transactions.length})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Thành công ({transactions.filter(t => t.status === 'completed').length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Đang xử lý ({transactions.filter(t => t.status === 'pending').length})
        </button>
        <button
          className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
          onClick={() => setFilter('failed')}
        >
          Thất bại ({transactions.filter(t => t.status === 'failed').length})
        </button>
      </div>

      {/* Transactions List */}
      <div className="transactions-list">
        {filteredTransactions.map(transaction => {
          const badge = getStatusBadge(transaction.status);
          return (
            <div key={transaction.id} className="transaction-card">
              <div className="transaction-icon">
                {transaction.status === 'completed' && '✅'}
                {transaction.status === 'pending' && '⏳'}
                {transaction.status === 'failed' && '❌'}
              </div>

              <div className="transaction-info">
                <div className="transaction-header">
                  <h3 className="transaction-description">
                    {transaction.description}
                  </h3>
                  <span className={`status-badge ${badge.class}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="transaction-details">
                  <span className="transaction-id">#{transaction.id}</span>
                  <span className="transaction-date">
                    📅 {new Date(transaction.date).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="transaction-method">
                    💳 {transaction.method}
                  </span>
                </div>
              </div>

              <div className="transaction-right">
                <div className="transaction-amount">
                  {(transaction.amount / 1000).toFixed(0)}k ₫
                </div>
                {transaction.invoice && (
                  <button className="btn btn-outline btn-xs">
                    Tải hóa đơn
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <h3>Không có giao dịch</h3>
          <p>Chưa có giao dịch nào trong danh mục này</p>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;

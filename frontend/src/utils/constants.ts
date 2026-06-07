export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
export const TOKEN_KEY = 'club_borrow_token';
export const USER_KEY = 'club_borrow_user';

export const BORROW_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  RETURNED: 'Đã trả',
  OVERDUE: 'Quá hạn',
  REJECTED: 'Bị từ chối',
  CANCELED: 'Đã hủy',
};

export const BORROW_STATUS_COLORS: Record<string, string> = {
  PENDING: 'gold',
  APPROVED: 'blue',
  REJECTED: 'red',
  RETURNED: 'green',
  OVERDUE: 'volcano',
  CANCELED: 'default',
};

export const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
  APPROVED: '✅',
  REJECTED: '❌',
  RETURN_REMINDER: '⏰',
  OVERDUE_WARNING: '🚨',
};

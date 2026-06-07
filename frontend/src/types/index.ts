// ===== Auth =====
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  studentId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  studentId: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  studentId?: string;
}

// ===== Equipment =====
export interface Equipment {
  id: number;
  name: string;
  description?: string;
  totalQuantity: number;
  availableQuantity: number;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentRequest {
  name: string;
  description?: string;
  totalQuantity: number;
  availableQuantity: number;
  imageUrl?: string;
}

// ===== Borrow =====
export type BorrowStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'OVERDUE';

export interface BorrowResponse {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userStudentId?: string;
  equipmentId: number;
  equipmentName: string;
  equipmentImageUrl?: string;
  quantity: number;
  borrowDate: string;
  returnDate: string;
  actualReturnDate?: string;
  status: BorrowStatus;
  note?: string;
  adminNote?: string;
  isExtended: boolean;
  createdAt: string;
}

export interface BorrowCreateRequest {
  equipmentId: number;
  quantity: number;
  borrowDate: string;
  returnDate: string;
  note?: string;
}

export interface ExtendBorrowRequest {
  days: number;
}

// ===== Notification =====
export type NotificationType = 'APPROVED' | 'REJECTED' | 'RETURN_REMINDER' | 'OVERDUE_WARNING' | 'EXTENDED';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

// ===== Statistics =====
export interface MonthlyStatItem {
  equipmentId: number;
  equipmentName: string;
  borrowCount: number;
}

export interface DashboardStats {
  totalEquipment: number;
  totalBorrowing: number;
  totalPending: number;
  totalOverdue: number;
  monthlyStats: MonthlyStatItem[];
}

// ===== API Response =====
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

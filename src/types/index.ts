export type UserRole = 'super_admin' | 'company_admin' | 'osh_responsible' | 'worker';

export type Permission = 'view' | 'create' | 'edit' | 'approve' | 'export' | 'delete';

export interface Company {
  id: string;
  name: string;
  logo?: string;
  plan?: 'starter' | 'professional' | 'enterprise';
  status?: 'active' | 'suspended' | 'trial';
  activeUsers?: number;
  storageUsage?: string;
  createdDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  companyId: string;
  jobTitle?: string;
  status?: 'active' | 'inactive';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  roles?: UserRole[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  tags?: string[];
}

export interface StatusType {
  label: string;
  variant: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive' | 'expired' | 'expiring';
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  details?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface Task {
  id: string;
  title: string;
  type: 'activity' | 'training' | 'evidence' | 'signature';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  status: 'pending' | 'overdue' | 'completed';
  assignee?: string;
}

export interface Template {
  id: string;
  name: string;
  type: 'hazard_matrix' | 'inspection' | 'training' | 'report';
  description: string;
  isPublic: boolean;
  createdBy: string;
  createdDate: string;
  usageCount: number;
}

export interface PermissionMatrix {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  approve: boolean;
  export: boolean;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'inactive';
}

export interface Training {
  id: string;
  title: string;
  date: string;
  status: 'upcoming' | 'completed' | 'missed';
  location: string;
  instructor?: string;
}

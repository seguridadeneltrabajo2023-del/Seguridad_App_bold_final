import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Company, User, Notification, Toast, UserRole } from '../types';

interface AppContextType {
  currentCompany: Company | null;
  setCurrentCompany: (company: Company) => void;
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('osh_responsible');

  const [currentCompany, setCurrentCompany] = useState<Company | null>({
    id: '1',
    name: 'Acme Corporation',
    plan: 'professional',
    status: 'active',
    activeUsers: 45,
    storageUsage: '2.3 GB',
    createdDate: '2023-06-15',
  });

  const [currentUser, setCurrentUser] = useState<User | null>({
    id: '1',
    name: 'John Smith',
    email: 'john.smith@acme.com',
    role: 'osh_responsible',
    companyId: '1',
    jobTitle: 'Safety Manager',
    status: 'active',
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Training Due',
      message: 'Safety training expires in 7 days',
      type: 'warning',
      read: false,
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'New Evidence',
      message: 'New evidence uploaded for Audit #142',
      type: 'info',
      read: false,
      createdAt: new Date(Date.now() - 3600000),
    },
  ]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const newToast = {
      ...toast,
      id: Date.now().toString(),
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => removeToast(newToast.id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentCompany,
        setCurrentCompany,
        currentUser,
        setCurrentUser,
        currentRole,
        switchRole,
        notifications,
        addNotification,
        markNotificationRead,
        toasts,
        addToast,
        removeToast,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

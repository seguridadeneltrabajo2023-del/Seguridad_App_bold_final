import { Search, Plus, Bell, ChevronDown, Building2, Menu } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Company, QuickAction } from '../../types';

const mockCompanies: Company[] = [
  { id: '1', name: 'Acme Corporation' },
  { id: '2', name: 'Global Industries Ltd' },
  { id: '3', name: 'SafeTech Solutions' },
];

const quickActions: QuickAction[] = [
  { id: '1', label: 'New Activity', icon: 'FileText', action: () => alert('New Activity') },
  { id: '2', label: 'New Training', icon: 'GraduationCap', action: () => alert('New Training') },
  { id: '3', label: 'Report Accident', icon: 'AlertTriangle', action: () => alert('Report Accident') },
  { id: '4', label: 'Upload Evidence', icon: 'Upload', action: () => alert('Upload Evidence') },
  { id: '5', label: 'Add Responsible Person', icon: 'UserPlus', action: () => alert('Add Responsible Person') },
];

export function TopBar() {
  const { currentCompany, setCurrentCompany, currentUser, notifications, sidebarCollapsed, setSidebarCollapsed } = useApp();
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OS</span>
            </div>
            <span className="font-semibold text-gray-900 hidden sm:inline">OSH Manager</span>
          </div>

          <div className="relative ml-4">
            <button
              onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 hidden md:inline">
                {currentCompany?.name}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showCompanyDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowCompanyDropdown(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-3 pb-2">
                    <input
                      type="text"
                      placeholder="Search companies..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {mockCompanies.map(company => (
                    <button
                      key={company.id}
                      onClick={() => {
                        setCurrentCompany(company);
                        setShowCompanyDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className={company.id === currentCompany?.id ? 'font-medium text-blue-600' : 'text-gray-700'}>
                        {company.name}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Create</span>
            </button>

            {showQuickActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowQuickActions(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  {quickActions.map(action => (
                    <button
                      key={action.id}
                      onClick={() => {
                        action.action();
                        setShowQuickActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                    >
                      <span className="text-gray-700">{action.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.createdAt.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {currentUser?.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{currentUser?.role}</p>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700">
                    Profile Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700">
                    Preferences
                  </button>
                  <div className="border-t border-gray-200 my-2" />
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600">
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

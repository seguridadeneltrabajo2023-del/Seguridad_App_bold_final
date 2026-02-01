import { UserRole } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { Shield, Building2, Users, Briefcase } from 'lucide-react';

const roles: Array<{ value: UserRole; label: string; icon: any; color: string }> = [
  {
    value: 'super_admin',
    label: 'Super Admin',
    icon: Shield,
    color: 'bg-red-100 text-red-700',
  },
  {
    value: 'company_admin',
    label: 'Company Admin',
    icon: Building2,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'osh_responsible',
    label: 'OSH Responsible',
    icon: Briefcase,
    color: 'bg-green-100 text-green-700',
  },
  {
    value: 'worker',
    label: 'Worker',
    icon: Users,
    color: 'bg-gray-100 text-gray-700',
  },
];

export function RoleSwitcher() {
  const { currentRole, switchRole, addToast } = useApp();

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    const selectedRole = roles.find(r => r.value === role);
    addToast({
      type: 'info',
      message: `Switched to ${selectedRole?.label} view`,
    });
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-lg border-2 border-orange-300 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
        <span className="text-xs font-semibold text-orange-700 uppercase">
          Demo Mode
        </span>
      </div>

      <p className="text-sm font-medium text-gray-900 mb-2">Switch Role:</p>

      <div className="space-y-1">
        {roles.map(role => {
          const Icon = role.icon;
          const isActive = currentRole === role.value;

          return (
            <button
              key={role.value}
              onClick={() => handleRoleChange(role.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? `${role.color} ring-2 ring-offset-1 ring-current`
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{role.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          This switcher is for demo purposes only
        </p>
      </div>
    </div>
  );
}

import React from 'react';
import { Check, X } from 'lucide-react';
import { MainContent } from '../components/layout/MainContent';
import { UserRole } from '../types';

interface PermissionRow {
  module: string;
  super_admin: {
    view: boolean;
    create: boolean;
    edit: boolean;
    approve: boolean;
    export: boolean;
  };
  company_admin: {
    view: boolean;
    create: boolean;
    edit: boolean;
    approve: boolean;
    export: boolean;
  };
  osh_responsible: {
    view: boolean;
    create: boolean;
    edit: boolean;
    approve: boolean;
    export: boolean;
  };
  worker: {
    view: boolean;
    create: boolean;
    edit: boolean;
    approve: boolean;
    export: boolean;
  };
}

const permissions: PermissionRow[] = [
  {
    module: 'Companies',
    super_admin: { view: true, create: true, edit: true, approve: true, export: true },
    company_admin: { view: false, create: false, edit: false, approve: false, export: false },
    osh_responsible: { view: false, create: false, edit: false, approve: false, export: false },
    worker: { view: false, create: false, edit: false, approve: false, export: false },
  },
  {
    module: 'Templates',
    super_admin: { view: true, create: true, edit: true, approve: true, export: true },
    company_admin: { view: true, create: false, edit: false, approve: false, export: false },
    osh_responsible: { view: true, create: false, edit: false, approve: false, export: false },
    worker: { view: false, create: false, edit: false, approve: false, export: false },
  },
  {
    module: 'Users & Roles',
    super_admin: { view: true, create: true, edit: true, approve: true, export: true },
    company_admin: { view: true, create: true, edit: true, approve: true, export: true },
    osh_responsible: { view: true, create: false, edit: false, approve: false, export: false },
    worker: { view: false, create: false, edit: false, approve: false, export: false },
  },
  {
    module: 'Organization Structure',
    super_admin: { view: true, create: true, edit: true, approve: true, export: true },
    company_admin: { view: true, create: true, edit: true, approve: true, export: true },
    osh_responsible: { view: true, create: false, edit: false, approve: false, export: false },
    worker: { view: false, create: false, edit: false, approve: false, export: false },
  },
  {
    module: 'Work Plan',
    super_admin: { view: true, create: true, edit: true, approve: true, export: true },
    company_admin: { view: true, create: true, edit: true, approve: true, export: true },
    osh_responsible: { view: true, create: true, edit: true, approve: false, export: true },
    worker: { view: false, create: false, edit: false, approve: false, export: false },
  },
  {
    module: 'Hazard Matrix',
    super_admin: { view: true, create: true, edit: true, approve: true, export: true },
    company_admin: { view: true, create: true, edit: true, approve: true, export: true },
    osh_responsible: { view: true, create: true, edit: true, approve: false, export: true },
    worker: { view: false, create: false, edit: false, approve: false, export: false },
  },
  {
    module: 'Work Accidents',
    super_admin: { view: true, create: true, edit: true, approve: true, export: true },
    company_admin: { view: true, create: true, edit: true, approve: true, export: true },
    osh_responsible: { view: true, create: true, edit: true, approve: false, export: true },
    worker: { view: false, create: false, edit: false, approve: false, export: false },
  },
  {
    module: 'Training',
    super_admin: { view: true, create: true, edit: true, approve: true, export: true },
    company_admin: { view: true, create: true, edit: true, approve: true, export: true },
    osh_responsible: { view: true, create: true, edit: true, approve: false, export: true },
    worker: { view: true, create: false, edit: false, approve: false, export: false },
  },
  {
    module: 'Evidence Library',
    super_admin: { view: true, create: true, edit: true, approve: true, export: true },
    company_admin: { view: true, create: true, edit: true, approve: true, export: true },
    osh_responsible: { view: true, create: true, edit: true, approve: false, export: true },
    worker: { view: true, create: true, edit: false, approve: false, export: false },
  },
  {
    module: 'Reports',
    super_admin: { view: true, create: true, edit: true, approve: true, export: true },
    company_admin: { view: true, create: true, edit: true, approve: true, export: true },
    osh_responsible: { view: true, create: true, edit: false, approve: false, export: true },
    worker: { view: false, create: false, edit: false, approve: false, export: false },
  },
];

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  company_admin: 'Company Admin',
  osh_responsible: 'OSH Responsible',
  worker: 'Worker',
};

const actionLabels = ['View', 'Create', 'Edit', 'Approve', 'Export'];

export function PermissionsMatrix() {
  return (
    <MainContent
      title="Permissions Matrix"
      subtitle="Role-based access control for all modules and actions"
    >
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50">
                  Module
                </th>
                {(['super_admin', 'company_admin', 'osh_responsible', 'worker'] as UserRole[]).map(role => (
                  <th
                    key={role}
                    colSpan={5}
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-l border-gray-200"
                  >
                    {roleLabels[role]}
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-2 sticky left-0 bg-gray-50"></th>
                {(['super_admin', 'company_admin', 'osh_responsible', 'worker'] as UserRole[]).map(role => (
                  <React.Fragment key={role}>
                    {actionLabels.map(action => (
                      <th
                        key={`${role}-${action}`}
                        className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-l border-gray-100"
                      >
                        {action}
                      </th>
                    ))}
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {permissions.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    {row.module}
                  </td>
                  {(['super_admin', 'company_admin', 'osh_responsible', 'worker'] as UserRole[]).map(role => {
                    const perms = row[role];
                    return (
                      <React.Fragment key={role}>
                        {['view', 'create', 'edit', 'approve', 'export'].map(action => {
                          const hasPermission = perms[action as keyof typeof perms];
                          return (
                            <td
                              key={`${role}-${action}`}
                              className="px-3 py-4 text-center border-l border-gray-100"
                            >
                              {hasPermission ? (
                                <Check className="w-4 h-4 text-green-600 mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-gray-300 mx-auto" />
                              )}
                            </td>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Legend
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">View:</span>
            <span className="text-gray-600">Read access</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">Create:</span>
            <span className="text-gray-600">Add new items</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">Edit:</span>
            <span className="text-gray-600">Modify existing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">Approve:</span>
            <span className="text-gray-600">Review & approve</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">Export:</span>
            <span className="text-gray-600">Download data</span>
          </div>
        </div>
      </div>
    </MainContent>
  );
}

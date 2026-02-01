import {
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  Upload,
  Users,
} from 'lucide-react';
import { MainContent } from '../components/layout/MainContent';
import { StatusChip } from '../components/common/StatusChip';
import { Task } from '../types';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Monthly Safety Inspection - Building A',
    type: 'activity',
    priority: 'high',
    dueDate: '2024-01-22',
    status: 'overdue',
    assignee: 'You',
  },
  {
    id: '2',
    title: 'Upload fire drill evidence',
    type: 'evidence',
    priority: 'high',
    dueDate: '2024-01-23',
    status: 'pending',
  },
  {
    id: '3',
    title: 'Sign off training attendance - First Aid',
    type: 'signature',
    priority: 'medium',
    dueDate: '2024-01-25',
    status: 'pending',
  },
  {
    id: '4',
    title: 'Complete PPE inspection checklist',
    type: 'activity',
    priority: 'medium',
    dueDate: '2024-01-26',
    status: 'pending',
  },
  {
    id: '5',
    title: 'Review hazard assessment report',
    type: 'activity',
    priority: 'low',
    dueDate: '2024-01-28',
    status: 'pending',
  },
];

const priorityColors = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-gray-600 bg-gray-50',
};

const typeIcons = {
  activity: FileText,
  training: Users,
  evidence: Upload,
  signature: CheckCircle2,
};

export function OSHDashboard() {
  const overdueCount = mockTasks.filter(t => t.status === 'overdue').length;
  const pendingCount = mockTasks.filter(t => t.status === 'pending').length;

  return (
    <MainContent
      title="My Tasks"
      subtitle="Your upcoming activities, missing evidence, and pending signatures"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overdueCount}</p>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600">Completed This Week</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Task Inbox</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {mockTasks.map(task => {
            const Icon = typeIcons[task.type];
            return (
              <div
                key={task.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {task.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          priorityColors[task.priority]
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">
                        Due: {task.dueDate}
                      </span>
                      <StatusChip
                        status={
                          task.status === 'overdue' ? 'rejected' : 'pending'
                        }
                        label={task.status}
                      />
                      {task.assignee && (
                        <span className="text-gray-500">
                          Assigned to: {task.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainContent>
  );
}

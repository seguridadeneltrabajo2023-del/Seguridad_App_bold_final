import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  X,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { useApp } from '../../contexts/AppContext';

type ViewType = 'month' | 'week' | 'day';

interface Activity {
  id: string;
  title: string;
  description: string;
  activityType: 'inspection' | 'training' | 'audit' | 'report_delivery';
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  startDate: Date;
  endDate: Date;
  site: string;
  location: string;
  owner: string;
  participants: number;
  color: string;
}

const activityTypeColors: Record<string, string> = {
  inspection: '#3B82F6',
  training: '#10B981',
  audit: '#F59E0B',
  report_delivery: '#8B5CF6',
};

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Safety Inspection - Building A',
    description: 'Monthly safety inspection of all facilities',
    activityType: 'inspection',
    status: 'planned',
    startDate: new Date(2026, 0, 25, 9, 0),
    endDate: new Date(2026, 0, 25, 11, 0),
    site: 'Building A',
    location: 'Main Facility',
    owner: 'Sarah Johnson',
    participants: 5,
    color: activityTypeColors.inspection,
  },
  {
    id: '2',
    title: 'Fire Safety Training',
    description: 'Quarterly fire safety and evacuation training',
    activityType: 'training',
    status: 'in_progress',
    startDate: new Date(2026, 0, 27, 14, 0),
    endDate: new Date(2026, 0, 27, 16, 0),
    site: 'Building B',
    location: 'Training Room',
    owner: 'Michael Chen',
    participants: 12,
    color: activityTypeColors.training,
  },
  {
    id: '3',
    title: 'Annual Compliance Audit',
    description: 'Annual OSH compliance audit',
    activityType: 'audit',
    status: 'planned',
    startDate: new Date(2026, 0, 30, 10, 0),
    endDate: new Date(2026, 0, 30, 15, 0),
    site: 'All Sites',
    location: 'Conference Room',
    owner: 'Sarah Johnson',
    participants: 8,
    color: activityTypeColors.audit,
  },
];

export function WorkPlanCalendar() {
  const { addToast } = useApp();
  const [viewType, setViewType] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getActivitiesForDate = (date: Date | null): Activity[] => {
    if (!date) return [];
    return mockActivities.filter(activity => {
      const activityDate = new Date(activity.startDate);
      return (
        activityDate.getDate() === date.getDate() &&
        activityDate.getMonth() === date.getMonth() &&
        activityDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDayClick = (date: Date | null) => {
    if (!date) return;
    const activities = getActivitiesForDate(date);
    if (activities.length > 0) {
      setSelectedActivity(activities[0]);
      setShowSidePanel(true);
    } else {
      addToast({ type: 'info', message: `Create activity for ${date.toLocaleDateString()}` });
    }
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowSidePanel(true);
  };

  const handleAction = (action: string) => {
    addToast({ type: 'info', message: action });
    setShowSidePanel(false);
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);

  return (
    <MainContent
      title="Work Plan Calendar"
      subtitle="Schedule and manage OSH activities"
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                viewType === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                viewType === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewType('day')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                viewType === 'day'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Day
            </button>
          </div>
          <button
            onClick={() => handleAction('Creating new activity')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Activity
          </button>
        </div>
      }
    >
      <div className="flex gap-6">
        <div className={`transition-all duration-300 ${showSidePanel ? 'flex-1' : 'w-full'}`}>
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-gray-600">Inspection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-gray-600">Training</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-gray-600">Audit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span className="text-gray-600">Report</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((date, index) => {
                  const activities = getActivitiesForDate(date);
                  const isTodayDate = isToday(date);

                  return (
                    <div
                      key={index}
                      onClick={() => handleDayClick(date)}
                      className={`min-h-24 p-2 border rounded-lg transition-colors cursor-pointer ${
                        date
                          ? isTodayDate
                            ? 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                          : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      {date && (
                        <>
                          <div
                            className={`text-sm font-medium mb-1 ${
                              isTodayDate ? 'text-blue-600' : 'text-gray-900'
                            }`}
                          >
                            {date.getDate()}
                          </div>
                          <div className="space-y-1">
                            {activities.slice(0, 2).map(activity => (
                              <div
                                key={activity.id}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleActivityClick(activity);
                                }}
                                className="text-xs p-1 rounded truncate"
                                style={{
                                  backgroundColor: `${activity.color}20`,
                                  borderLeft: `3px solid ${activity.color}`,
                                }}
                              >
                                {activity.title}
                              </div>
                            ))}
                            {activities.length > 2 && (
                              <div className="text-xs text-gray-600 font-medium pl-1">
                                +{activities.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {showSidePanel && selectedActivity && (
          <div className="w-96 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-1 h-16 rounded-full mr-4"
                style={{ backgroundColor: selectedActivity.color }}
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {selectedActivity.title}
                </h3>
                <p className="text-sm text-gray-600">{selectedActivity.description}</p>
              </div>
              <button
                onClick={() => setShowSidePanel(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-gray-900 font-medium">
                    {selectedActivity.startDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {selectedActivity.endDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-gray-600">
                    {selectedActivity.startDate.toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-gray-900 font-medium">{selectedActivity.site}</div>
                  <div className="text-gray-600">{selectedActivity.location}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-gray-900 font-medium">
                    {selectedActivity.participants} participants
                  </div>
                  <div className="text-gray-600">Owner: {selectedActivity.owner}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleAction('Viewing activity details')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CalendarIcon className="w-5 h-5" />
                View Full Details
              </button>
              <button
                onClick={() => handleAction('Editing activity')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Edit className="w-5 h-5" />
                Edit
              </button>
              {selectedActivity.status !== 'completed' && (
                <button
                  onClick={() => handleAction('Marking activity as complete')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark Complete
                </button>
              )}
              <button
                onClick={() => handleAction('Deleting activity')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Cancel Activity
              </button>
            </div>
          </div>
        )}
      </div>
    </MainContent>
  );
}

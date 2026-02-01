import { GraduationCap, FileSignature, Upload, Calendar } from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { Training } from '../../types';
import { useApp } from '../../contexts/AppContext';

const mockTrainings: Training[] = [
  {
    id: '1',
    title: 'Fire Safety & Emergency Response',
    date: '2024-01-25',
    status: 'upcoming',
    location: 'Training Room A',
    instructor: 'John Smith',
  },
  {
    id: '2',
    title: 'First Aid Certification Renewal',
    date: '2024-02-05',
    status: 'upcoming',
    location: 'Medical Center',
    instructor: 'Dr. Sarah Lee',
  },
  {
    id: '3',
    title: 'Hazard Communication',
    date: '2024-01-15',
    status: 'completed',
    location: 'Building A',
  },
];

const pendingSignatures = [
  {
    id: '1',
    title: 'Monthly Safety Meeting Attendance',
    date: '2024-01-20',
    location: 'Conference Room B',
  },
  {
    id: '2',
    title: 'PPE Equipment Receipt Acknowledgment',
    date: '2024-01-18',
    location: 'Equipment Store',
  },
];

export function WorkerHome() {
  const { addToast } = useApp();

  const handleAction = (action: string) => {
    addToast({ type: 'info', message: action });
  };

  return (
    <MainContent title="My Home" subtitle="Your trainings, signatures, and tasks">
      <div className="max-w-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleAction('Opening training details')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 text-left hover:shadow-lg transition-shadow"
          >
            <GraduationCap className="w-8 h-8 mb-3" />
            <p className="text-2xl font-bold mb-1">2</p>
            <p className="text-sm opacity-90">Upcoming Trainings</p>
          </button>

          <button
            onClick={() => handleAction('Opening pending signatures')}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 text-left hover:shadow-lg transition-shadow"
          >
            <FileSignature className="w-8 h-8 mb-3" />
            <p className="text-2xl font-bold mb-1">2</p>
            <p className="text-sm opacity-90">Pending Signatures</p>
          </button>

          <button
            onClick={() => handleAction('Opening upload evidence')}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 text-left hover:shadow-lg transition-shadow"
          >
            <Upload className="w-8 h-8 mb-3" />
            <p className="text-2xl font-bold mb-1">Upload</p>
            <p className="text-sm opacity-90">Evidence</p>
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                My Trainings
              </h2>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {mockTrainings.map(training => (
              <div
                key={training.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {training.title}
                  </h3>
                  <StatusChip
                    status={
                      training.status === 'completed' ? 'approved' : 'pending'
                    }
                    label={training.status}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{training.date}</span>
                  </div>
                  <p className="text-sm text-gray-500">{training.location}</p>
                  {training.instructor && (
                    <p className="text-sm text-gray-500">
                      Instructor: {training.instructor}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Signatures
              </h2>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {pendingSignatures.map(item => (
              <div
                key={item.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {item.title}
                  </h3>
                  <button
                    onClick={() =>
                      handleAction(`Signing: ${item.title}`)
                    }
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    Sign Now
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">{item.date}</p>
                  <p className="text-sm text-gray-500">{item.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Quick Upload
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Need to upload evidence or photos? Click below to get started.
          </p>
          <button
            onClick={() => handleAction('Opening file uploader')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </button>
        </div>
      </div>
    </MainContent>
  );
}

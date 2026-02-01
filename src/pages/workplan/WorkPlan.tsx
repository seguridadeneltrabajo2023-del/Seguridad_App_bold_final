import { useState } from 'react';
import { Calendar, List, Download } from 'lucide-react';
import { WorkPlanCalendar } from './WorkPlanCalendar';
import { WorkPlanListKanban } from './WorkPlanListKanban';
import { ExportModal } from '../../components/workplan/ExportModal';

type ViewType = 'calendar' | 'list';

export function WorkPlan() {
  const [viewType, setViewType] = useState<ViewType>('calendar');
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6 px-6 pt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewType('calendar')}
            className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
              viewType === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Calendar
          </button>
          <button
            onClick={() => setViewType('list')}
            className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
              viewType === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="w-5 h-5" />
            List View
          </button>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Export Schedule
        </button>
      </div>

      {viewType === 'calendar' ? <WorkPlanCalendar /> : <WorkPlanListKanban />}

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </>
  );
}

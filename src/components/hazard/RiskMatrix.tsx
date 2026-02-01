import { Info } from 'lucide-react';

interface RiskMatrixProps {
  selectedProbability?: number;
  selectedSeverity?: number;
  showLegend?: boolean;
}

export function RiskMatrix({
  selectedProbability,
  selectedSeverity,
  showLegend = true,
}: RiskMatrixProps) {
  const getRiskLevel = (probability: number, severity: number): string => {
    const score = probability * severity;
    if (score >= 16) return 'critical';
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };

  const getRiskColor = (level: string): string => {
    switch (level) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-400';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getRiskTextColor = (level: string): string => {
    return level === 'medium' ? 'text-gray-900' : 'text-white';
  };

  const probabilityLabels = [
    { value: 5, label: 'Very High', description: 'Almost certain to occur' },
    { value: 4, label: 'High', description: 'Likely to occur' },
    { value: 3, label: 'Medium', description: 'Possible to occur' },
    { value: 2, label: 'Low', description: 'Unlikely to occur' },
    { value: 1, label: 'Very Low', description: 'Rare or never occurs' },
  ];

  const severityLabels = [
    { value: 1, label: 'Very Low', description: 'Minor injury, no lost time' },
    { value: 2, label: 'Low', description: 'First aid treatment' },
    { value: 3, label: 'Medium', description: 'Medical treatment, lost time' },
    { value: 4, label: 'High', description: 'Serious injury, hospitalization' },
    { value: 5, label: 'Very High', description: 'Fatality or permanent disability' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Risk Calculation</p>
            <p>
              Risk Score = Probability × Severity. Select values below to see the risk level
              calculation.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Risk Assessment Matrix</h4>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-50 p-3 text-left">
                  <div className="text-xs font-semibold text-gray-700">Probability →</div>
                  <div className="text-xs font-semibold text-gray-700 mt-1">Severity ↓</div>
                </th>
                {[1, 2, 3, 4, 5].map(prob => (
                  <th
                    key={prob}
                    className={`border border-gray-300 p-3 text-center ${
                      selectedProbability === prob ? 'bg-blue-100' : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-gray-900">{prob}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {probabilityLabels.find(p => p.value === prob)?.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[5, 4, 3, 2, 1].map(sev => (
                <tr key={sev}>
                  <td
                    className={`border border-gray-300 p-3 ${
                      selectedSeverity === sev ? 'bg-blue-100' : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-gray-900">{sev}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {severityLabels.find(s => s.value === sev)?.label}
                    </div>
                  </td>
                  {[1, 2, 3, 4, 5].map(prob => {
                    const score = prob * sev;
                    const level = getRiskLevel(prob, sev);
                    const isSelected =
                      selectedProbability === prob && selectedSeverity === sev;

                    return (
                      <td
                        key={`${prob}-${sev}`}
                        className={`border border-gray-300 p-3 text-center ${getRiskColor(
                          level
                        )} ${getRiskTextColor(level)} ${
                          isSelected ? 'ring-4 ring-blue-500 ring-inset' : ''
                        }`}
                      >
                        <div className="text-lg font-bold">{score}</div>
                        {isSelected && (
                          <div className="text-xs font-semibold mt-1 uppercase">{level}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showLegend && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="text-sm font-semibold text-gray-900 mb-3">Probability Scale</h5>
            <div className="space-y-2">
              {probabilityLabels.map(item => (
                <div
                  key={item.value}
                  className={`p-2 rounded ${
                    selectedProbability === item.value ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 w-6">{item.value}</span>
                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  </div>
                  <p className="text-xs text-gray-600 ml-8">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="text-sm font-semibold text-gray-900 mb-3">Severity Scale</h5>
            <div className="space-y-2">
              {severityLabels.map(item => (
                <div
                  key={item.value}
                  className={`p-2 rounded ${
                    selectedSeverity === item.value ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 w-6">{item.value}</span>
                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  </div>
                  <p className="text-xs text-gray-600 ml-8">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLegend && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-gray-900 mb-3">Risk Level Categories</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Low (1-4)</p>
                <p className="text-xs text-gray-600">Acceptable risk</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-4 h-4 bg-yellow-400 rounded" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Medium (5-9)</p>
                <p className="text-xs text-gray-600">Monitor and control</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="w-4 h-4 bg-orange-500 rounded" />
              <div>
                <p className="text-sm font-semibold text-gray-900">High (10-15)</p>
                <p className="text-xs text-gray-600">Immediate action needed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-4 h-4 bg-red-600 rounded" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Critical (16-25)</p>
                <p className="text-xs text-gray-600">Stop work immediately</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

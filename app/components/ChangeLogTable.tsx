'use client'

import { useState } from 'react'

type ChangeLog = {
  id: string
  changeType: string
  oldCost: number | null
  newCost: number | null
  oldRetail: number | null
  newRetail: number | null
  oldMargin: number | null
  newMargin: number | null
  oldDescription: string | null
  newDescription: string | null
  changedAt: Date | string  // Change this line
}

function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj)
}

function getChangeTypeLabel(changeType: string): string {
  const labels: { [key: string]: string } = {
    'created': 'Created',
    'price_increase': 'Price Increase',
    'price_decrease': 'Price Decrease',
    'cost_change': 'Cost Change',
    'description_update': 'Description Update',
    'updated': 'Updated',
  }
  return labels[changeType] || changeType
}

export default function ChangeLogTable({ changeLogs }: { changeLogs: ChangeLog[] }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (changeLogs.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-300">Change History</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
        >
          {isExpanded ? '▼ Hide' : '▶ Show'} ({changeLogs.length})
        </button>
      </div>

      {isExpanded && (
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800 border-b border-gray-700">
                  <th className="text-left p-3 text-gray-400 font-medium">Date/Time</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Change Type</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {changeLogs.map((log, index) => (
                  <tr 
                    key={log.id} 
                    className={`border-b border-gray-800 ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'}`}
                  >
                    <td className="p-3 text-gray-300 whitespace-nowrap">
                      {formatDateTime(log.changedAt)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.changeType === 'price_increase' ? 'bg-green-500/20 text-green-400' :
                        log.changeType === 'price_decrease' ? 'bg-red-500/20 text-red-400' :
                        log.changeType === 'cost_change' ? 'bg-orange-500/20 text-orange-400' :
                        log.changeType === 'description_update' ? 'bg-blue-500/20 text-blue-400' :
                        log.changeType === 'created' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {getChangeTypeLabel(log.changeType)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">
                      {log.changeType === 'created' ? (
                        <div className="space-y-1">
                          <div>Initial Cost: <span className="text-green-400 font-medium">${log.newCost?.toFixed(2)}</span></div>
                          <div>Initial Retail: <span className="text-blue-400 font-medium">${log.newRetail?.toFixed(2)}</span></div>
                          <div>Initial Margin: <span className="text-yellow-400 font-medium">{log.newMargin?.toFixed(2)}%</span></div>
                          <div>Initial Profit: <span className="text-purple-400 font-medium">${((log.newRetail || 0) - (log.newCost || 0)).toFixed(2)}</span></div>
                        </div>
                      ) : log.changeType === 'price_increase' || log.changeType === 'price_decrease' || log.changeType === 'cost_change' ? (
                        <div className="space-y-1">
                          <div>Cost: <span className="text-gray-400">${log.oldCost?.toFixed(2)}</span> → <span className="text-green-400 font-medium">${log.newCost?.toFixed(2)}</span></div>
                          <div>Retail: <span className="text-gray-400">${log.oldRetail?.toFixed(2)}</span> → <span className="text-blue-400 font-medium">${log.newRetail?.toFixed(2)}</span></div>
                          <div>Margin: <span className="text-gray-400">{log.oldMargin?.toFixed(2)}%</span> → <span className="text-yellow-400 font-medium">{log.newMargin?.toFixed(2)}%</span></div>
                          <div>Profit: <span className="text-gray-400">${((log.oldRetail || 0) - (log.oldCost || 0)).toFixed(2)}</span> → <span className="text-purple-400 font-medium">${((log.newRetail || 0) - (log.newCost || 0)).toFixed(2)}</span></div>
                        </div>
                      ) : log.changeType === 'description_update' ? (
                        <div className="space-y-1">
                          <div className="text-gray-400">From: {log.oldDescription || '(empty)'}</div>
                          <div className="text-blue-400">To: {log.newDescription || '(empty)'}</div>
                        </div>
                      ) : (
                        <div className="text-gray-400">Updated</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
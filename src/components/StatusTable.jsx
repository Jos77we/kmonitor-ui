import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const statusData = [
  {
    time: '12:45:20',
    message: 'Security scan completed successfully',
    code: 'SEC001',
    status: 'success',
    flagged: false,
  },
  {
    time: '12:45:15',
    message: 'Database backup initiated',
    code: 'BAK002',
    status: 'pending',
    flagged: false,
  },
  {
    time: '12:45:10',
    message: 'Unusual login attempt detected',
    code: 'SEC002',
    status: 'warning',
    flagged: true,
  },
  {
    time: '12:45:05',
    message: 'System resources optimization complete',
    code: 'SYS001',
    status: 'success',
    flagged: false,
  },
];

export function StatusTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flagged</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {statusData.map((item, index) => (
            <tr key={index} className={item.flagged ? 'bg-red-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.time}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.message}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{item.code}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.status === 'success' ? 'bg-green-100 text-green-800' :
                  item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.flagged ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
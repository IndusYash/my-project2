import React, { useState } from 'react'
import { Issue } from '../../types'

interface StatusManagementProps {
  selectedIssue: Issue | null
  onStatusUpdate: (issueId: string, status: Issue['status']) => void
}

const StatusManagement: React.FC<StatusManagementProps> = ({
  selectedIssue,
  onStatusUpdate
}) => {
  const [note, setNote] = useState('')

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-red-500', icon: '⏳' },
    { value: 'acknowledged', label: 'Acknowledged', color: 'bg-blue-500', icon: '👁️' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-500', icon: '🔄' },
    { value: 'under-review', label: 'Under Review', color: 'bg-purple-500', icon: '🔍' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-500', icon: '✅' },
    { value: 'closed', label: 'Closed', color: 'bg-gray-500', icon: '🔒' }
  ] as const

  const handleStatusChange = (status: Issue['status']) => {
    if (selectedIssue) {
      onStatusUpdate(selectedIssue.id, status)
      setNote('')
    }
  }

  if (!selectedIssue) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-500">Select an issue to manage its status</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Management</h3>
      
      {/* Selected Issue Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-2">{selectedIssue.title}</h4>
        <p className="text-sm text-gray-600 mb-2">{selectedIssue.description}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Current Status:</span>
          <span className={`px-2 py-1 rounded-full text-white ${
            selectedIssue.status === 'pending' ? 'bg-red-500' :
            selectedIssue.status === 'acknowledged' ? 'bg-blue-500' :
            selectedIssue.status === 'in-progress' ? 'bg-yellow-500' :
            selectedIssue.status === 'under-review' ? 'bg-purple-500' :
            selectedIssue.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'
          }`}>
            {selectedIssue.status.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* Status Options */}
      <div className="space-y-3 mb-6">
        <h4 className="font-medium text-gray-900">Update Status:</h4>
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={selectedIssue.status === option.value}
            className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
              selectedIssue.status === option.value
                ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{option.icon}</span>
                <span className="font-medium text-gray-900">{option.label}</span>
              </div>
              {selectedIssue.status === option.value && (
                <span className="text-sm text-green-600">✓ Current</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Add Note */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Add Note:</h4>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this status update..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
        <button
          onClick={() => {
            // Handle adding note
            console.log('Adding note:', note)
            setNote('')
          }}
          disabled={!note.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Add Note
        </button>
      </div>

      {/* Issue Timeline */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs">📝</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Issue Reported</p>
              <p className="text-xs text-gray-500">
                {new Date(selectedIssue.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          
          {selectedIssue.acknowledgedAt && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs">👁️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Issue Acknowledged</p>
                <p className="text-xs text-gray-500">
                  {new Date(selectedIssue.acknowledgedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {selectedIssue.status !== 'pending' && selectedIssue.status !== 'acknowledged' && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-xs">🔄</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Status Updated</p>
                <p className="text-xs text-gray-500">
                  {new Date(selectedIssue.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {selectedIssue.resolvedAt && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xs">✅</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Issue Resolved</p>
                <p className="text-xs text-gray-500">
                  {new Date(selectedIssue.resolvedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {selectedIssue.closedAt && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs">🔒</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Issue Closed</p>
                <p className="text-xs text-gray-500">
                  {new Date(selectedIssue.closedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatusManagement

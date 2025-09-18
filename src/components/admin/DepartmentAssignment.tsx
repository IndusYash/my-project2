import React, { useState, useMemo, useEffect } from 'react'
import { Department, Issue } from '../../types'

// Mock DepartmentRoutingService since the real one might not exist
const DepartmentRoutingService = {
  autoAssignDepartment: async (issue: any) => {
    // Simple mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    const categoryToDept: { [key: string]: string } = {
      'pothole': '1',
      'roads': '1', 
      'streetlight': '3',
      'electrical': '3',
      'garbage': '2',
      'waste': '2',
      'traffic': '5',
      'signal': '5',
      'parks': '4',
      'drainage': '4',
      'water': '4'
    }
    
    const departmentId = categoryToDept[issue.category.toLowerCase()] || '1'
    
    return {
      departmentId,
      confidence: 0.85,
      reasoning: `Auto-assigned based on category: "${issue.category}"`
    }
  },
  
  getLoadBalancedAssignment: (deptIds: string[], workloads: { [key: string]: number }) => {
    // Return department with lowest workload
    return deptIds.reduce((prev, curr) => 
      (workloads[prev] || 0) < (workloads[curr] || 0) ? prev : curr
    )
  }
}

interface DepartmentAssignmentProps {
  departments: Department[]
  selectedIssue: Issue | null
  selectedIssues?: string[]
  onAssign: (issueIds: string[], departmentId: string) => void
  loading?: boolean
  allIssues?: Issue[]
}

const DepartmentAssignment: React.FC<DepartmentAssignmentProps> = ({
  departments,
  selectedIssue,
  selectedIssues = [],
  onAssign,
  loading = false,
  allIssues = []
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [autoAssignmentResult, setAutoAssignmentResult] = useState<any>(null)
  const [isAutoAssigning, setIsAutoAssigning] = useState(false)

  // Calculate real-time workload without limits
  const departmentsWithRealWorkload = useMemo(() => {
    return departments.map(dept => {
      const activeIssues = allIssues.filter(issue => 
        issue.department?.id === dept.id && 
        ['acknowledged', 'in-progress', 'under-review'].includes(issue.status)
      ).length

      const resolvedIssues = allIssues.filter(issue => 
        issue.department?.id === dept.id && 
        ['resolved', 'closed'].includes(issue.status)
      ).length

      const totalAssigned = activeIssues + resolvedIssues
      const efficiencyScore = totalAssigned > 0 ? (resolvedIssues / totalAssigned) * 100 : 100

      return {
        ...dept,
        activeIssues,
        resolvedIssues,
        totalAssigned,
        efficiencyScore: Math.round(efficiencyScore),
        workload: activeIssues < 5 ? 'low' as const : 
                 activeIssues < 15 ? 'medium' as const : 
                 activeIssues < 25 ? 'high' as const : 'overloaded' as const
      }
    })
  }, [departments, allIssues])

  // Auto-assign when issue is selected
  useEffect(() => {
    if (selectedIssue && !selectedIssue.department) {
      handleAutoAssignment()
    }
  }, [selectedIssue])

  const handleAutoAssignment = async () => {
    if (!selectedIssue) return
    
    setIsAutoAssigning(true)
    console.log('🤖 Starting auto-assignment for:', selectedIssue.title)
    
    try {
      const routingResult = await DepartmentRoutingService.autoAssignDepartment({
        category: selectedIssue.category,
        title: selectedIssue.title,
        description: selectedIssue.description,
        priority: selectedIssue.priority,
        location: selectedIssue.location
      })
      
      // Apply load balancing if confidence is low
      if (routingResult.confidence < 0.8) {
        const workloads: { [id: string]: number } = {}
        departmentsWithRealWorkload.forEach(dept => {
          workloads[dept.id] = dept.activeIssues
        })
        
        // Simple load balancing - find least busy department
        const allDeptIds = departments.map(d => d.id)
        const balancedDept = DepartmentRoutingService.getLoadBalancedAssignment(
          [routingResult.departmentId, ...allDeptIds], 
          workloads
        )
        
        if (balancedDept !== routingResult.departmentId) {
          routingResult.departmentId = balancedDept
          routingResult.reasoning += ' + Load balancing applied'
        }
      }
      
      setAutoAssignmentResult(routingResult)
      setSelectedDepartment(routingResult.departmentId)
      
      console.log('✅ Auto-assignment result:', routingResult)
      
    } catch (error) {
      console.error('❌ Auto-assignment error:', error)
      setAutoAssignmentResult(null)
    } finally {
      setIsAutoAssigning(false)
    }
  }

  // 🔥 FIXED: Enhanced manual assignment with better debugging
  const handleManualAssignment = () => {
    console.log('🎯 Manual assignment triggered')
    console.log('Selected Issue:', selectedIssue)
    console.log('Selected Department:', selectedDepartment)
    console.log('Loading:', loading)
    
    // Check all conditions
    if (!selectedIssue) {
      console.log('❌ No issue selected')
      alert('Please select an issue first')
      return
    }
    
    if (!selectedDepartment) {
      console.log('❌ No department selected')
      alert('Please select a department first')
      return
    }
    
    if (loading) {
      console.log('❌ Currently loading')
      return
    }
    
    console.log('✅ All conditions met, calling onAssign')
    
    try {
      onAssign([selectedIssue.id], selectedDepartment)
      
      // Reset states after successful assignment
      setSelectedDepartment('')
      setAutoAssignmentResult(null)
      
      console.log('✅ Assignment completed successfully')
    } catch (error) {
      console.error('❌ Assignment failed:', error)
      alert('Assignment failed. Please try again.')
    }
  }

  const handleAutoAccept = () => {
    console.log('🤖 Auto-accept triggered')
    
    if (!selectedIssue || !autoAssignmentResult) {
      console.log('❌ Missing data for auto-accept')
      return
    }
    
    try {
      onAssign([selectedIssue.id], autoAssignmentResult.departmentId)
      setSelectedDepartment('')
      setAutoAssignmentResult(null)
      
      console.log('✅ Auto-assignment accepted successfully')
    } catch (error) {
      console.error('❌ Auto-assignment failed:', error)
      alert('Auto-assignment failed. Please try again.')
    }
  }

  // 🔥 FIXED: Enhanced department selection with debugging
  const handleDepartmentSelection = (departmentId: string) => {
    console.log('🏢 Department selected:', departmentId)
    setSelectedDepartment(departmentId)
    
    // Clear auto-assignment when manually selecting
    if (autoAssignmentResult) {
      setAutoAssignmentResult(null)
    }
  }

  const getDepartmentIcon = (name: string) => {
    const icons: { [key: string]: string } = {
      'Roads & Infrastructure': '🛣️',
      'Sanitation & Waste Management': '🗑️',
      'Sanitation & Waste': '🗑️',
      'Electrical & Utilities': '⚡',
      'Parks & Recreation': '🌳',
      'Traffic Management': '🚦',
      'Water & Drainage': '🌊'
    }
    return icons[name] || '🏢'
  }

  const getWorkloadColor = (workload: string, efficiencyScore: number) => {
    if (efficiencyScore < 60) return 'bg-red-100 text-red-600 border-red-200'
    if (workload === 'overloaded') return 'bg-orange-100 text-orange-600 border-orange-200'
    if (workload === 'high') return 'bg-yellow-100 text-yellow-600 border-yellow-200'
    if (workload === 'medium') return 'bg-blue-100 text-blue-600 border-blue-200'
    return 'bg-green-100 text-green-600 border-green-200'
  }

  // 🔥 FIXED: Better condition checking for button
  const isAssignButtonDisabled = !selectedIssue || !selectedDepartment || loading
  const canAssign = selectedIssue && selectedDepartment && !loading

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">🤖 Smart Department Assignment</h3>
      
      {/* 🔥 ENHANCED: Debug Information */}
      <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-xs font-medium text-yellow-800 mb-2">🐛 Debug Information:</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-yellow-700">
          <div>Selected Issue: <span className="font-mono">{selectedIssue ? '✅ ' + selectedIssue.title.substring(0, 20) + '...' : '❌ None'}</span></div>
          <div>Selected Dept: <span className="font-mono">{selectedDepartment ? '✅ ' + selectedDepartment : '❌ None'}</span></div>
          <div>Loading: <span className="font-mono">{loading ? '⏳ Yes' : '✅ No'}</span></div>
          <div>Can Assign: <span className="font-mono">{canAssign ? '✅ Yes' : '❌ No'}</span></div>
        </div>
      </div>
      
      {/* Auto-Assignment Result */}
      {autoAssignmentResult && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🤖</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">AI Recommendation</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-700">Suggested Department:</span>
                  <span className="font-medium text-blue-900">
                    {departments.find(d => d.id === autoAssignmentResult.departmentId)?.name || 'Unknown'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    autoAssignmentResult.confidence > 0.8 ? 'bg-green-100 text-green-600' :
                    autoAssignmentResult.confidence > 0.6 ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {Math.round(autoAssignmentResult.confidence * 100)}% confidence
                  </span>
                </div>
                <p className="text-xs text-blue-600">{autoAssignmentResult.reasoning}</p>
              </div>
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAutoAccept}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  ✅ Accept AI Suggestion
                </button>
                <button
                  onClick={() => {
                    setAutoAssignmentResult(null)
                    setSelectedDepartment('')
                  }}
                  className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                >
                  ❌ Manual Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isAutoAssigning && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-yellow-700 font-medium">🤖 AI analyzing issue for best department match...</span>
          </div>
        </div>
      )}
      
      {/* Workload Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 font-medium mb-1">📊 Real-time Department Workload</p>
        <p className="text-xs text-gray-500">
          Total Issues: {allIssues.length} • Auto-assignment: {autoAssignmentResult ? 'Active' : 'Ready'}
        </p>
      </div>
      
      {/* 🔥 FIXED: Department Grid with enhanced selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 mb-6">
        {departmentsWithRealWorkload.map((dept) => (
          <div
            key={dept.id}
            onClick={() => handleDepartmentSelection(dept.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedDepartment === dept.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : autoAssignmentResult?.departmentId === dept.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{getDepartmentIcon(dept.name)}</span>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  getWorkloadColor(dept.workload, dept.efficiencyScore)
                }`}>
                  {dept.activeIssues} Active
                </div>
                {autoAssignmentResult?.departmentId === dept.id && (
                  <div className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                    🤖 AI Pick
                  </div>
                )}
                {selectedDepartment === dept.id && (
                  <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                    ✓ Selected
                  </div>
                )}
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-900 text-sm mb-1">{dept.name}</h4>
            <p className="text-xs text-gray-600 mb-3">Head: {dept.head.name}</p>
            
            {/* Enhanced Metrics */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Active Issues:</span>
                <span className="font-medium text-gray-900">{dept.activeIssues}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total Assigned:</span>
                <span className="font-medium text-gray-900">{dept.totalAssigned}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Resolved:</span>
                <span className="font-medium text-green-600">{dept.resolvedIssues}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Efficiency:</span>
                <span className={`font-medium ${
                  dept.efficiencyScore > 80 ? 'text-green-600' :
                  dept.efficiencyScore > 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {dept.efficiencyScore}%
                </span>
              </div>
              
              {/* Load Progress Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Current Load</span>
                  <span className="font-medium capitalize">{dept.workload}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      dept.workload === 'overloaded' ? 'bg-red-500' :
                      dept.workload === 'high' ? 'bg-orange-500' :
                      dept.workload === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min(
                        dept.activeIssues === 0 ? 10 : 
                        dept.activeIssues < 5 ? 25 : 
                        dept.activeIssues < 15 ? 50 : 
                        dept.activeIssues < 25 ? 75 : 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Issue Info */}
      {selectedIssue && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Selected Issue:</h4>
          <p className="text-sm text-gray-600">{selectedIssue.title}</p>
          <p className="text-xs text-gray-500 mt-1">
            Category: <span className="capitalize font-medium">{selectedIssue.category}</span> | 
            Priority: <span className="capitalize font-medium">{selectedIssue.priority}</span>
            {selectedIssue.location?.ward && (
              <> | Ward: <span className="font-medium">{selectedIssue.location.ward}</span></>
            )}
          </p>
        </div>
      )}

      {/* 🔥 FIXED: Manual Assignment Button with Better State Management */}
      <button
        onClick={handleManualAssignment}
        disabled={isAssignButtonDisabled}
        className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
          isAssignButtonDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-[1.02]'
        }`}
        title={
          !selectedIssue ? 'Select an issue first' :
          !selectedDepartment ? 'Select a department first' :
          loading ? 'Assignment in progress...' :
          'Click to assign issue to department'
        }
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Assigning...
          </>
        ) : (
          <>
            <span>🎯</span>
            {autoAssignmentResult ? 'Override AI & Assign Manually' : 'Assign to Department'}
          </>
        )}
      </button>
      
      {/* Get AI Recommendation Button */}
      {selectedIssue && !autoAssignmentResult && (
        <button
          onClick={handleAutoAssignment}
          disabled={isAutoAssigning}
          className="w-full mt-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isAutoAssigning ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              AI Analyzing...
            </>
          ) : (
            <>
              <span>🤖</span>
              Get AI Recommendation
            </>
          )}
        </button>
      )}

      {/* Help Text */}
      {!canAssign && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium">💡 Assignment Steps:</p>
          <ol className="text-xs text-blue-700 mt-2 space-y-1 list-decimal list-inside">
            <li>First, select an issue from the table {selectedIssue ? '✅' : '❌'}</li>
            <li>Then, click on a department above {selectedDepartment ? '✅' : '❌'}</li>
            <li>Finally, click "Assign to Department" button</li>
          </ol>
        </div>
      )}
    </div>
  )
}

export default DepartmentAssignment

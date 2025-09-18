import React, { useState, useEffect } from 'react';
import { Issue, Department, AdminStats } from '../../types';
import IssueOverviewCards from './IssueOverviewCards';
import IssueTable from './IssueTable';
import DepartmentAssignment from './DepartmentAssignment';
import StatusManagement from './StatusManagement';

// Mock DepartmentRoutingService for auto-assignment demo
const DepartmentRoutingService = {
  autoAssignDepartment: async ({
    category,
    title,
    description,
    priority,
    location
  }: {
    category: string;
    title: string;
    description: string;
    priority: string;
    location: { lat: number; lng: number; address: string };
  }) => {
    // Simple mock: assign to first department with confidence 0.8
    return {
      departmentId: '1',
      confidence: 0.8
    };
  }
};

const AdminDashboard: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalIssues: 0,
    pendingIssues: 0,
    inProgressIssues: 0,
    resolvedIssues: 0,
    acknowledgedIssues: 0,
    underReviewIssues: 0,
    closedIssues: 0,
    urgentIssues: 0,
    emergencyIssues: 0,
    avgResolutionTime: 0,
    overdueIssues: 0,
    citizenSatisfactionRate: 0,
    departmentEfficiency: {},
    monthlyTrends: [],
    categoryBreakdown: []
  });

  const departments: Department[] = [
    {
      id: '1',
      name: 'Roads & Infrastructure',
      code: 'RI',
      head: {
        id: '101',
        name: 'Mr. Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        phone: '9876543210'
      },
      description: 'Handles road and infrastructure maintenance.',
      activeIssues: 15,
      resolvedIssues: 100,
      avgResolutionTime: 72,
      capacity: 25,
      workload: 'high',
      specializations: ['roads', 'bridges'],
      contactInfo: {
        email: 'roads@jharkhand.gov.in',
        phone: '1800123456',
        address: 'Main Road, Ranchi'
      },
      operatingHours: {
        monday: '9:00-18:00',
        tuesday: '9:00-18:00',
        wednesday: '9:00-18:00',
        thursday: '9:00-18:00',
        friday: '9:00-18:00',
        saturday: '10:00-14:00',
        sunday: 'Closed'
      }
    },
    {
      id: '2',
      code: 'SW',
      name: 'Sanitation & Waste',
      description: 'Manages sanitation and waste disposal.',
      head: { id: '102', name: 'Ms. Priya Singh', email: 'priya.singh@example.com', phone: '9876543211' },
      activeIssues: 8,
      resolvedIssues: 80,
      avgResolutionTime: 48,
      capacity: 20,
      workload: 'medium',
      specializations: ['waste', 'sanitation'],
      contactInfo: {
        email: 'sanitation@jharkhand.gov.in',
        phone: '1800123457',
        address: 'Sector 2, Ranchi'
      },
      operatingHours: {
        monday: '9:00-18:00',
        tuesday: '9:00-18:00',
        wednesday: '9:00-18:00',
        thursday: '9:00-18:00',
        friday: '9:00-18:00',
        saturday: '10:00-14:00',
        sunday: 'Closed'
      }
    },
    {
      id: '3',
      code: 'EU',
      name: 'Electrical & Utilities',
      description: 'Handles electrical issues and utility services.',
      head: { id: '103', name: 'Mr. Amit Sharma', email: 'amit.sharma@example.com', phone: '9876543212' },
      activeIssues: 12,
      resolvedIssues: 90,
      avgResolutionTime: 36,
      capacity: 18,
      workload: 'medium',
      specializations: ['electrical', 'utilities'],
      contactInfo: {
        email: 'utilities@jharkhand.gov.in',
        phone: '1800123458',
        address: 'Sector 3, Ranchi'
      },
      operatingHours: {
        monday: '9:00-18:00',
        tuesday: '9:00-18:00',
        wednesday: '9:00-18:00',
        thursday: '9:00-18:00',
        friday: '9:00-18:00',
        saturday: '10:00-14:00',
        sunday: 'Closed'
      }
    },
    {
      id: '4',
      code: 'PR',
      name: 'Parks & Recreation',
      description: 'Manages parks, gardens, and recreational facilities.',
      head: { id: '104', name: 'Ms. Sunita Devi', email: 'sunita.devi@example.com', phone: '9876543213' },
      activeIssues: 5,
      resolvedIssues: 70,
      avgResolutionTime: 96,
      capacity: 15,
      workload: 'low',
      specializations: ['parks', 'gardens'],
      contactInfo: {
        email: 'parks@jharkhand.gov.in',
        phone: '1800123459',
        address: 'Sector 4, Ranchi'
      },
      operatingHours: {
        monday: '9:00-18:00',
        tuesday: '9:00-18:00',
        wednesday: '9:00-18:00',
        thursday: '9:00-18:00',
        friday: '9:00-18:00',
        saturday: '10:00-14:00',
        sunday: 'Closed'
      }
    },
    {
      id: '5',
      code: 'TM',
      name: 'Traffic Management',
      description: 'Oversees traffic control and management.',
      head: { id: '105', name: 'Mr. Ravi Gupta', email: 'ravi.gupta@example.com', phone: '9876543214' },
      activeIssues: 20,
      resolvedIssues: 110,
      avgResolutionTime: 24,
      capacity: 30,
      workload: 'high',
      specializations: ['traffic'],
      contactInfo: {
        email: 'traffic@jharkhand.gov.in',
        phone: '1800123460',
        address: 'Sector 5, Ranchi'
      },
      operatingHours: {
        monday: '9:00-18:00',
        tuesday: '9:00-18:00',
        wednesday: '9:00-18:00',
        thursday: '9:00-18:00',
        friday: '9:00-18:00',
        saturday: '10:00-14:00',
        sunday: 'Closed'
      }
    }
  ];

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockIssues: Issue[] = [
      {
        id: '1',
        title: 'Large Pothole on Main Road',
        description: 'Deep pothole causing traffic issues',
        category: 'pothole',
        status: 'pending',
        priority: 'high',
        location: {
          lat: 23.3441,
          lng: 85.3096,
          address: 'Main Road, Ranchi, Jharkhand'
        },
        images: ['/api/placeholder/300/200'],
        reportedBy: { id: '1234', name: 'Citizen #1234' },
        createdAt: new Date('2025-09-15'),
        updatedAt: new Date('2025-09-15'),
        notes: [],
        department: undefined
      },
      // Add more mock data as needed
    ];

    setIssues(mockIssues);

    const newStats: AdminStats = {
      totalIssues: mockIssues.length,
      pendingIssues: mockIssues.filter(i => i.status === 'pending').length,
      inProgressIssues: mockIssues.filter(i => i.status === 'in-progress').length,
      resolvedIssues: mockIssues.filter(i => i.status === 'resolved').length,
      acknowledgedIssues: mockIssues.filter(i => i.status === 'acknowledged').length,
      underReviewIssues: mockIssues.filter(i => i.status === 'under-review').length,
      closedIssues: mockIssues.filter(i => i.status === 'closed').length,
      urgentIssues: mockIssues.filter(i => i.priority === 'urgent').length,
      emergencyIssues: mockIssues.filter(i => i.priority === 'emergency').length,
      avgResolutionTime: 48,
      overdueIssues: 0,
      citizenSatisfactionRate: 0,
      departmentEfficiency: {},
      monthlyTrends: [],
      categoryBreakdown: []
    };
    setStats(newStats);
  }, []);

  // Fixed function to accept array of issue IDs
  const handleAssignDepartment = (issueIds: string[], departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    setIssues(prev =>
      prev.map(issue =>
        issueIds.includes(issue.id) && department
          ? {
              ...issue,
              department: {
                id: department.id,
                name: department.name,
                head: department.head
              },
              status: 'in-progress' as Issue['status']
            }
          : issue
      )
    );
    
    const updatedIssues = issues.map(issue =>
      issueIds.includes(issue.id) && department
        ? {
            ...issue,
            department: {
              id: department.id,
              name: department.name,
              head: department.head
            },
            status: 'in-progress' as Issue['status']
          }
        : issue
    );
    
    setStats(recalculateStats(updatedIssues));
    setSelectedIssue(null);
  };

  const handleStatusUpdate = (issueId: string, status: Issue['status']) => {
    setIssues(prev => {
      const updated = prev.map(issue =>
        issue.id === issueId
          ? { ...issue, status, updatedAt: new Date() }
          : issue
      );
      setStats(recalculateStats(updated));
      return updated;
    });
  };

  const handleNewIssue = async (newIssue: Issue) => {
    // Auto-assign department for new issues
    if (!newIssue.department) {
      try {
        const routingResult = await DepartmentRoutingService.autoAssignDepartment({
          category: newIssue.category,
          title: newIssue.title,
          description: newIssue.description,
          priority: newIssue.priority,
          location: newIssue.location
        });

        // Apply the auto-assignment
        if (routingResult.confidence > 0.6) {
          const assignedDepartment = departments.find(d => d.id === routingResult.departmentId);
          newIssue.department = assignedDepartment
            ? {
                id: assignedDepartment.id,
                name: assignedDepartment.name,
                head: assignedDepartment.head
              }
            : undefined;
          newIssue.status = 'acknowledged';
          console.log('🤖 Auto-assigned issue to:', assignedDepartment?.name);
        }
      } catch (error) {
        console.log('❌ Auto-assignment failed, keeping manual assignment');
      }
    }

    setIssues(prev => [...prev, newIssue]);
    setStats(recalculateStats([...issues, newIssue]));
  };

  function recalculateStats(issues: Issue[]): AdminStats {
    return {
      totalIssues: issues.length,
      pendingIssues: issues.filter(i => i.status === 'pending').length,
      inProgressIssues: issues.filter(i => i.status === 'in-progress').length,
      resolvedIssues: issues.filter(i => i.status === 'resolved').length,
      acknowledgedIssues: issues.filter(i => i.status === 'acknowledged').length,
      underReviewIssues: issues.filter(i => i.status === 'under-review').length,
      closedIssues: issues.filter(i => i.status === 'closed').length,
      urgentIssues: issues.filter(i => i.priority === 'urgent').length,
      emergencyIssues: issues.filter(i => i.priority === 'emergency').length,
      avgResolutionTime: 48,
      overdueIssues: 0,
      citizenSatisfactionRate: 0,
      departmentEfficiency: {},
      monthlyTrends: [],
      categoryBreakdown: []
    };
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Civic Issues Dashboard
          </h1>
          <p className="text-gray-600">
            Government of Jharkhand - Administrative Panel
          </p>
        </div>

        {/* Overview Cards */}
        <IssueOverviewCards stats={stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Issues Table - Takes 2/3 of the width */}
          <div className="lg:col-span-2">
            <IssueTable
              issues={issues}
              onSelectIssue={setSelectedIssue}
              onUpdateStatus={handleStatusUpdate}
            />
          </div>

          {/* Sidebar - Takes 1/3 of the width */}
          <div className="space-y-6">
            <DepartmentAssignment
              departments={departments}
              selectedIssue={selectedIssue}
              onAssign={handleAssignDepartment}
            />
            
            <StatusManagement
              selectedIssue={selectedIssue}
              onStatusUpdate={handleStatusUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

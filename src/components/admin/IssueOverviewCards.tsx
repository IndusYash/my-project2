import React from 'react';
import { AdminStats } from '../../types';

interface IssueOverviewCardsProps {
  stats: AdminStats;
}

const IssueOverviewCards: React.FC<IssueOverviewCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Issues',
      value: stats.totalIssues,
      icon: '📊',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending',
      value: stats.pendingIssues,
      icon: '⏳',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'In Progress',
      value: stats.inProgressIssues,
      icon: '🔄',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Resolved',
      value: stats.resolvedIssues,
      icon: '✅',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Urgent Issues',
      value: stats.urgentIssues,
      icon: '🚨',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Avg Resolution',
      value: `${stats.avgResolutionTime}h`,
      icon: '⏱️',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${card.textColor}`}>{card.title}</p>
              <p className={`text-2xl font-bold ${card.textColor} mt-1`}>
                {card.value}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${card.color} text-white text-xl`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IssueOverviewCards;

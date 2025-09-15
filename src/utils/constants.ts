import { IssueCategory } from '../types'

export const ISSUE_CATEGORIES: IssueCategory[] = [
  {
    id: 'pothole',
    name: 'Potholes',
    description: 'Road surface damage and holes',
    color: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200',
    icon: '🕳️'
  },
  {
    id: 'streetlight',
    name: 'Street Lights',
    description: 'Broken or malfunctioning streetlights',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
    icon: '💡'
  },
  {
    id: 'drainage',
    name: 'Drainage Issues',
    description: 'Blocked drains and waterlogging',
    color: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
    icon: '🌊'
  },
  {
    id: 'garbage',
    name: 'Garbage Overflow',
    description: 'Overflowing bins and waste issues',
    color: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
    icon: '🗑️'
  },
  {
    id: 'traffic',
    name: 'Traffic Signs',
    description: 'Missing or damaged traffic signs',
    color: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200',
    icon: '🚸'
  },
  {
    id: 'construction',
    name: 'Construction',
    description: 'Unsafe construction or debris',
    color: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200',
    icon: '🚧'
  }
]

export const AI_ANALYSIS_PROMPT = `
Analyze this image for civic infrastructure issues. Look for:
- Potholes or road damage
- Broken or non-functioning streetlights
- Drainage problems or waterlogging
- Garbage overflow or waste issues
- Missing or damaged traffic signs
- Construction hazards or debris

For each issue found, provide:
1. Category (one of: pothole, streetlight, drainage, garbage, traffic, construction)
2. Confidence level (0.0 to 1.0)
3. Brief description of the specific issue

Return response in JSON format:
{
  "issues": [
    {
      "category": "category_name",
      "confidence": 0.85,
      "description": "Brief description of the issue"
    }
  ]
}

If no issues are found, return: {"issues": []}
`

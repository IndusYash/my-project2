// src/services/departmentRouting.ts

interface DepartmentRoutingRule {
  categoryPatterns: string[]
  departmentId: string
  confidence: number
  keywords?: string[]
  priority?: string[]
}

interface RoutingResult {
  departmentId: string
  confidence: number
  reasoning: string
  alternativeDepartments?: string[]
}

// Smart routing rules based on civic issue categories
const ROUTING_RULES: DepartmentRoutingRule[] = [
  {
    categoryPatterns: ['pothole', 'road', 'street', 'pavement', 'asphalt'],
    departmentId: '1', // Roads & Infrastructure
    confidence: 0.95,
    keywords: ['road', 'street', 'pothole', 'crack', 'repair', 'surface'],
    priority: ['urgent', 'high']
  },
  {
    categoryPatterns: ['garbage', 'waste', 'trash', 'litter', 'cleaning'],
    departmentId: '2', // Sanitation & Waste
    confidence: 0.90,
    keywords: ['garbage', 'trash', 'waste', 'bin', 'collection', 'dump'],
    priority: ['medium', 'high']
  },
  {
    categoryPatterns: ['streetlight', 'electrical', 'power', 'lighting'],
    departmentId: '3', // Electrical & Utilities
    confidence: 0.95,
    keywords: ['light', 'electrical', 'power', 'outage', 'bulb', 'wiring'],
    priority: ['high', 'urgent']
  },
  {
    categoryPatterns: ['drainage', 'water', 'flood', 'sewage', 'pipe'],
    departmentId: '4', // Water & Drainage
    confidence: 0.90,
    keywords: ['water', 'drain', 'flood', 'sewage', 'pipe', 'leak'],
    priority: ['urgent', 'emergency']
  },
  {
    categoryPatterns: ['traffic', 'signal', 'sign', 'parking'],
    departmentId: '5', // Traffic Management
    confidence: 0.85,
    keywords: ['traffic', 'signal', 'sign', 'parking', 'congestion'],
    priority: ['medium', 'high']
  },
  {
    categoryPatterns: ['park', 'garden', 'tree', 'playground'],
    departmentId: '6', // Parks & Recreation
    confidence: 0.80,
    keywords: ['park', 'garden', 'tree', 'playground', 'bench', 'grass'],
    priority: ['low', 'medium']
  }
]

// AI-powered department routing service
export class DepartmentRoutingService {
  
  // Main auto-assignment function
  static async autoAssignDepartment(issue: {
    category: string
    title: string
    description: string
    priority: string
    location?: { address: string }
  }): Promise<RoutingResult> {
    
    console.log('Auto-assigning department for issue:', issue.category)
    
    try {
      // Step 1: Direct category matching
      const directMatch = this.findDirectCategoryMatch(issue.category)
      if (directMatch) {
        return {
          departmentId: directMatch.departmentId,
          confidence: directMatch.confidence,
          reasoning: `Direct category match: "${issue.category}" assigned to department`,
          alternativeDepartments: []
        }
      }
      
      // Step 2: Text analysis
      const textAnalysis = await this.analyzeIssueText(issue)
      if (textAnalysis.confidence > 0.7) {
        return textAnalysis
      }
      
      // Step 3: Location-based routing
      const locationRouting = this.analyzeLocation(issue.location?.address || '')
      if (locationRouting.confidence > 0.6) {
        return locationRouting
      }
      
      // Step 4: Default fallback
      return this.getDefaultAssignment(issue.priority)
      
    } catch (error) {
      console.error('Error in auto-assignment:', error)
      return this.getDefaultAssignment(issue.priority)
    }
  }
  
  // Direct category matching
  private static findDirectCategoryMatch(category: string): DepartmentRoutingRule | null {
    const normalizedCategory = category.toLowerCase()
    
    return ROUTING_RULES.find(rule => 
      rule.categoryPatterns.some(pattern => 
        normalizedCategory.includes(pattern) || pattern.includes(normalizedCategory)
      )
    ) || null
  }
  
  // Text analysis
  private static async analyzeIssueText(issue: {
    title: string
    description: string
    category: string
    priority: string
  }): Promise<RoutingResult> {
    
    const combinedText = `${issue.title} ${issue.description}`.toLowerCase()
    const scores: Record<string, number> = {}
    const matchedKeywords: Record<string, string[]> = {}
    
    // Analyze keywords for each department
    ROUTING_RULES.forEach(rule => {
      let score = 0
      const keywords: string[] = []
      
      // Check category patterns
      rule.categoryPatterns.forEach(pattern => {
        if (combinedText.includes(pattern)) {
          score += 0.3
          keywords.push(pattern)
        }
      })
      
      // Check specific keywords
      if (rule.keywords) {
        rule.keywords.forEach(keyword => {
          if (combinedText.includes(keyword)) {
            score += 0.2
            keywords.push(keyword)
          }
        })
      }
      
      // Priority boost
      if (rule.priority && rule.priority.includes(issue.priority)) {
        score += 0.1
      }
      
      if (score > 0) {
        scores[rule.departmentId] = score
        matchedKeywords[rule.departmentId] = keywords
      }
    })
    
    // Find best match
    const entries = Object.entries(scores)
    if (entries.length === 0) {
      return {
        departmentId: '1',
        confidence: 0.3,
        reasoning: 'No keyword matches found - defaulting to Roads & Infrastructure'
      }
    }
    
    const bestEntry = entries.reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)
    
    if (bestEntry && scores[bestEntry[0]] > 0.3) {
      const keywords = matchedKeywords[bestEntry[0]] || []
      return {
        departmentId: bestEntry[0],
        confidence: Math.min(scores[bestEntry[0]], 0.95),
        reasoning: `AI text analysis matched keywords: ${keywords.join(', ')}`,
        alternativeDepartments: Object.keys(scores).filter(d => d !== bestEntry[0])
      }
    }
    
    return {
      departmentId: '1',
      confidence: 0.3,
      reasoning: 'Low confidence text analysis - defaulting to Roads & Infrastructure'
    }
  }
  
  // Location-based analysis
  private static analyzeLocation(address: string): RoutingResult {
    const normalizedAddress = address.toLowerCase()
    
    // Location-specific patterns
    const locationPatterns = [
      { patterns: ['park', 'garden', 'playground'], departmentId: '6', confidence: 0.8 },
      { patterns: ['market', 'commercial', 'business'], departmentId: '2', confidence: 0.7 },
      { patterns: ['residential', 'colony', 'society'], departmentId: '1', confidence: 0.6 },
      { patterns: ['highway', 'main road', 'arterial'], departmentId: '5', confidence: 0.8 }
    ]
    
    for (const pattern of locationPatterns) {
      if (pattern.patterns.some(p => normalizedAddress.includes(p))) {
        return {
          departmentId: pattern.departmentId,
          confidence: pattern.confidence,
          reasoning: `Location-based routing: "${address}" suggests specific department`
        }
      }
    }
    
    return {
      departmentId: '1',
      confidence: 0.2,
      reasoning: 'No specific location patterns found'
    }
  }
  
  // Default assignment based on priority
  private static getDefaultAssignment(priority: string): RoutingResult {
    const priorityDefaults: Record<string, string> = {
      'emergency': '4', // Water & Drainage
      'urgent': '1',    // Roads & Infrastructure
      'high': '3',      // Electrical & Utilities
      'medium': '2',    // Sanitation & Waste
      'low': '6'        // Parks & Recreation
    }
    
    const defaultDept = priorityDefaults[priority] || '1'
    
    return {
      departmentId: defaultDept,
      confidence: 0.5,
      reasoning: `Default assignment based on priority: "${priority}"`,
      alternativeDepartments: Object.values(priorityDefaults).filter(d => d !== defaultDept)
    }
  }
  
  // Get department load balancing
  static getLoadBalancedAssignment(
    possibleDepartments: string[], 
    departmentWorkloads: Record<string, number>
  ): string {
    return possibleDepartments.reduce((lightest, current) => {
      const lightestLoad = departmentWorkloads[lightest] || 0
      const currentLoad = departmentWorkloads[current] || 0
      return currentLoad < lightestLoad ? current : lightest
    })
  }

  // Helper method to get department name by ID
  static getDepartmentName(departmentId: string): string {
    const departmentNames: Record<string, string> = {
      '1': 'Roads & Infrastructure',
      '2': 'Sanitation & Waste Management',
      '3': 'Electrical & Utilities',
      '4': 'Water & Drainage',
      '5': 'Traffic Management',
      '6': 'Parks & Recreation'
    }
    
    return departmentNames[departmentId] || 'General Services'
  }

  // Get routing statistics
  static getRoutingStats(): {
    totalRules: number
    departmentsCount: number
    avgConfidence: number
  } {
    const confidences = ROUTING_RULES.map(rule => rule.confidence)
    const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length
    
    return {
      totalRules: ROUTING_RULES.length,
      departmentsCount: new Set(ROUTING_RULES.map(rule => rule.departmentId)).size,
      avgConfidence: Math.round(avgConfidence * 100) / 100
    }
  }
}

// Export the service and interfaces
export type { DepartmentRoutingRule, RoutingResult }

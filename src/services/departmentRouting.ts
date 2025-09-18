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

// 🔥 Smart routing rules based on civic issue categories
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

// 🤖 AI-powered department routing service
export class DepartmentRoutingService {
  
  // Main auto-assignment function
  static async autoAssignDepartment(issue: {
    category: string
    title: string
    description: string
    priority: string
    location?: { address: string }
  }): Promise<RoutingResult> {
    
    console.log('🤖 Auto-assigning department for issue:', issue.category)
    
    // Step 1: Direct category matching
    const directMatch = this.findDirectCategoryMatch(issue.category)
    if (directMatch) {
      return {
        departmentId: directMatch.departmentId,
        confidence: directMatch.confidence,
        reasoning: Direct category match: "${issue.category}" → Department,
        alternativeDepartments: []
      }
    }
    
    // Step 2: AI-powered text analysis
    const textAnalysis = await this.analyzeIssueText(issue)
    if (textAnalysis.confidence > 0.7) {
      return textAnalysis
    }
    
    // Step 3: Location-based routing (if address contains specific areas)
    const locationRouting = this.analyzeLocation(issue.location?.address || '')
    if (locationRouting.confidence > 0.6) {
      return locationRouting
    }
    
    // Step 4: Default fallback based on priority
    return this.getDefaultAssignment(issue.priority)
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
  
  // AI-powered text analysis
  private static async analyzeIssueText(issue: {
    title: string
    description: string
    category: string
    priority: string
  }): Promise<RoutingResult> {
    
    const combinedText = ${issue.title} ${issue.description}.toLowerCase()
    const scores: { [departmentId: string]: number } = {}
    const matchedKeywords: { [departmentId: string]: string[] } = {}
    
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
      rule.keywords?.forEach(keyword => {
        if (combinedText.includes(keyword)) {
          score += 0.2
          keywords.push(keyword)
        }
      })
      
      // Priority boost
      if (rule.priority?.includes(issue.priority)) {
        score += 0.1
      }
      
      if (score > 0) {
        scores[rule.departmentId] = score
        matchedKeywords[rule.departmentId] = keywords
      }
    })
    
    // Find best match
    const bestDepartment = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )
    
    if (bestDepartment && scores[bestDepartment[0]] > 0.3) {
      return {
        departmentId: bestDepartment[0],
        confidence: Math.min(scores[bestDepartment[0]], 0.95),
        reasoning: AI text analysis matched keywords: ${matchedKeywords[bestDepartment[0]].join(', ')},
        alternativeDepartments: Object.keys(scores).filter(d => d !== bestDepartment[0])
      }
    }
    
    return {
      departmentId: '1', // Default to Roads & Infrastructure
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
          reasoning: Location-based routing: "${address}" suggests specific department
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
    const priorityDefaults: { [key: string]: string } = {
      'emergency': '4', // Water & Drainage (emergency flooding, etc.)
      'urgent': '1',    // Roads & Infrastructure
      'high': '3',      // Electrical & Utilities
      'medium': '2',    // Sanitation & Waste
      'low': '6'        // Parks & Recreation
    }
    
    const defaultDept = priorityDefaults[priority] || '1'
    
    return {
      departmentId: defaultDept,
      confidence: 0.5,
      reasoning: Default assignment based on priority: "${priority}",
      alternativeDepartments: Object.values(priorityDefaults).filter(d => d !== defaultDept)
    }
  }
  
  // Get department load balancing (if multiple departments can handle the issue)
  static getLoadBalancedAssignment(
    possibleDepartments: string[], 
    departmentWorkloads: { [id: string]: number }
  ): string {
    // Find department with lowest current workload
    return possibleDepartments.reduce((lightest, current) => {
      const lightestLoad = departmentWorkloads[lightest] || 0
      const currentLoad = departmentWorkloads[current] || 0
      return currentLoad < lightestLoad ? current : lightest
    })
  }
}
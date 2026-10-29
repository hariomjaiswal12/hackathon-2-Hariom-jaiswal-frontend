export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'insufficient' | 'conflict' | 'stale' | 'mixed';

export interface ConfidenceInfo {
  level: ConfidenceLevel;
  percentage?: number;
  label: string;
  detail?: string;
}

export interface CategoryScore {
  key: string;
  name: string;
  score: number; // 0-100
  trend?: 'positive' | 'neutral' | 'negative' | 'mixed';
  trendText?: string;
  summary: string;
  evidenceCount: number;
  confidence: ConfidenceInfo;
  weight?: number; // for calculation
}

export interface SourceItem {
  id: string;
  name: string;
  type: 'Official Company' | 'Employee Review' | 'Public Dataset' | 'AI interpretation' | 'User Preference' | 'Third-Party Review';
  sampleSize?: string;
  reviewCount?: number;
  date: string;
  freshness: string;
  status: 'Verified' | 'Mixed' | 'Needs refresh' | 'User supplied' | 'High confidence' | 'Stale' | 'Unverified';
  statusType: 'verified' | 'mixed' | 'warning' | 'info' | 'insufficient';
  description: string;
  agreement?: string;
  url?: string | null;
  isAvailable?: boolean;
  availabilityNotice?: string | null;
}

export interface EvidenceDetail {
  id: string;
  claim: string;
  companyId: string;
  categoryKey: string;
  reviewsAnalyzed: number;
  relevantMentions: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  sources: {
    name: string;
    reviewCount: number;
    date: string;
    verified: boolean;
    statusText: string;
  }[];
  confidence: ConfidenceInfo;
  limitations: string[];
  contextNote: string;
  userPreferenceNote?: string;
}

export interface Company {
  id: string;
  slug?: string;
  name: string;
  legalName?: string;
  brandName?: string;
  shortName: string;
  aliases?: string[];
  domain?: string;
  logoUrl?: string;
  logoText: string;
  logoBg?: string;
  logoColor?: string;
  industry: string;
  location: string;
  locations?: string[];
  workArrangement?: string;
  headquarters?: string;
  registeredAddress?: string;
  operatingAddress?: string;
  addressConflicts?: string;
  country?: string;
  city?: string;
  website: string;
  registrationNumber?: string;
  jurisdiction?: string;
  legalStatus?: string;
  foundedYear?: number;
  legalIncorporationDate?: string;
  companySize?: string;
  size?: string;
  isStartup?: boolean;
  employeeCount?: number | null;
  description: string;
  overallScore: number | null; // null if unrated/evidence pending
  overallScoreMax: number; // 100
  confidence: ConfidenceInfo;
  reviewCount: number;
  sampleSourcesCount: number;
  lastUpdated: string;
  sampleSourcesSummary: string; // "Oct 2026 · Sample A / B / C"
  legalDirectors?: any[];
  businessLeadership?: any[];
  
  // Categorized workplace intelligence
  categories?: {
    learning?: CategoryScore;
    growth?: CategoryScore;
    stability?: CategoryScore;
    culture?: CategoryScore;
    wlb?: CategoryScore;
    salary?: CategoryScore;
    management?: CategoryScore;
    satisfaction?: CategoryScore;
    [key: string]: CategoryScore | undefined;
  };

  // Signals
  positiveSignals?: string[];
  concernSignals?: string[];
  
  // AI summary
  aiSummary?: {
    highlight: string;
    quote: string;
    freshness: string;
    sourcesCount: number;
    reviewCount: number;
    confidence: ConfidenceInfo;
  };

  // Praise vs Mixed
  praises?: { title: string; percentage: number; count: number }[];
  mixed?: { title: string; percentage: number; count: number }[];

  // Risks
  risks?: {
    level: 'Medium' | 'Low' | 'High';
    category: string;
    score: number;
    description: string;
  }[];

  concernsToInvestigate?: {
    id: string;
    title: string;
    description: string;
  }[];

  // Sources list
  sources?: SourceItem[];
  dataSources?: {
    provider: string;
    sourceUrl?: string;
    retrievedAt?: string;
    confidence?: string;
    fieldsProvided?: string[];
    attribution?: string;
  }[];
  verificationStatus?: 'OFFICIAL_REGISTRY' | 'THIRD_PARTY_VERIFIED' | 'ADMIN_VERIFIED' | 'COMMUNITY_SUBMITTED' | 'PENDING_VERIFICATION' | 'EVIDENCE_ANALYZED';
  lastVerifiedAt?: string;
  lastSyncedAt?: string;
  isDemoData?: boolean;
  careerFit?: {
    fitScore: number;
    matchGrade?: string;
    tier?: string;
    topMatches?: string[];
    breakdown?: Record<string, number>;
  };
}

export interface CompanySuggestion {
  id: string;
  name: string;
  shortName?: string;
  domain?: string;
  logoUrl?: string;
  logoText?: string;
  logoBg?: string;
  industry?: string;
  location?: string;
  country?: string;
  website?: string;
  registrationNumber?: string;
  verificationStatus?: string;
  source?: string;
}

export interface CompanySubmissionInput {
  name: string;
  legalName?: string;
  registrationNumber?: string;
  jurisdiction?: string;
  country?: string;
  city?: string;
  headquarters?: string;
  website?: string;
  industry: string;
  description?: string;
  foundedYear?: number;
  officialEmail?: string;
  evidenceNotes?: string;
}

export interface CompanySubmission extends CompanySubmissionInput {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy?: {
    userId?: string;
    email?: string;
    name?: string;
  };
  reviewedBy?: {
    email?: string;
    reviewedAt?: string;
    notes?: string;
  };
  approvedCompanyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareerDNAPreferences {
  learning: number; // 0-100
  growth: number;
  stability: number;
  culture: number;
  wlb: number; // work-life balance
  salary: number;
  technology: number;
  location: number;
}

export interface CareerDNA {
  name: string;
  targetRole: string;
  experience: 'Student' | 'Fresher' | '1-2 years' | '3+ years';
  workStyle: 'Remote' | 'Hybrid' | 'On-site';
  preferredLocation: string;
  priorities: CareerDNAPreferences;
  skills: string[];
  isComplete: boolean;
  updatedAt: string;
}

export interface CareerFitResult {
  companyId: string;
  companyName: string;
  fitScore: number | null; // 0-100% or null if insufficient evidence
  tier: 'Excellent Match' | 'Strong Match' | 'Moderate Match' | 'Lower Alignment' | 'Insufficient Role Evidence' | 'Insufficient Evidence' | string;
  hasSufficientData?: boolean;
  hasRoleEvidence?: boolean;
  targetRole?: string;
  experience?: string;
  statusNotice?: string;
  coverageNote?: string;
  requiredEvidenceMissing?: string[];
  breakdown: {
    categoryKey: string;
    categoryName: string;
    score: number | null;
    userWeight: number;
    alignmentScore: number | null;
  }[];
  whyItFits: string[];
  tradeOffs: string[];
}

export interface ComparisonScenario {
  id: string;
  title: string;
  description?: string;
  companies: string[]; // company ids
  priorities: CareerDNAPreferences;
  isBaseline?: boolean;
  createdAt: string;
  rankings: {
    companyId: string;
    companyName: string;
    score: number;
    rank: number;
    tagline: string;
  }[];
}

export interface ResearchHistoryItem {
  id: string;
  activity: string;
  type: 'Company' | 'Comparison' | 'AI question' | 'Evidence';
  context: string;
  time: string;
  dateGroup: 'TODAY / OCT 28, 2026' | 'YESTERDAY / OCT 27, 2026' | 'EARLIER';
  link?: string;
}

export interface WatchlistAlert {
  id: string;
  companyId: string;
  companyName: string;
  type: 'score_update' | 'source_freshness' | 'fit_change' | 'evidence_alert';
  title: string;
  date: string;
  previousScore?: number;
  newScore?: number;
  description: string;
  isNew: boolean;
  actionText?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  claim?: string;
  confidence?: ConfidenceInfo;
  evidenceRef?: {
    mentions: number;
    positive: number;
    neutral: number;
    negative: number;
    sourcesCount: number;
    reviewsCount: number;
    checkedDaysAgo: number;
  };
  sources?: string[];
  followUps?: string[];
  caveats?: string;
  provider?: string;
  model?: string;
  isFallback?: boolean;
  fallbackReason?: string;
  isDemoData?: boolean;
}

export interface AIThread {
  id: string;
  title: string;
  companyId?: string;
  companyContext?: string;
  messages: AIMessage[];
  updatedAt: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role?: string;
  isDemoUser?: boolean;
  avatar?: string | null;
  authProvider?: 'local' | 'google';
  careerStage?: string;
  targetRole?: string;
  defaultLocation?: string;
  preferredWorkStyle?: string;
  researchPreferences?: {
    showSourceMetadata?: boolean;
    showConfidence?: boolean;
    useCareerDNAForRecommendations?: boolean;
  };
  notificationPreferences?: {
    evidenceUpdates?: boolean;
    sourceConflictAlerts?: boolean;
    emailDigest?: boolean;
    digestFrequency?: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthData {
  user: User;
  tokens: AuthTokens;
}

export interface DashboardStats {
  companiesResearched: number;
  savedCompanies: number;
  comparisons: number;
  careerFitProfile: string;
  lastUpdated: string;
}

export interface RecentResearchItem {
  company: string;
  companySlug: string;
  lastResearched: string;
  careerFit: string;
  nextStep: string;
}

export interface DashboardData {
  stats: DashboardStats;
  careerDNA: CareerDNA;
  recommendedCompanies: Company[];
  recentResearch: RecentResearchItem[];
}

export interface WhatIfRanking {
  companyId: string;
  companyName: string;
  fullName?: string;
  logoBg?: string;
  logoText?: string;
  industry?: string;
  location?: string;
  size?: string;
  score: number | null;
  rank: number | null;
  tier?: string;
  hasSufficientData?: boolean;
  partialCoverage?: boolean;
  coverageNote?: string;
  breakdown?: Array<{
    category: string;
    label: string;
    score: number | null;
    evidenceStatus: string;
    priorityWeight: number;
    weightedContribution: number;
    evidenceNote?: string;
  }>;
  whyItFits?: string[];
  tradeOffs?: string[];
}

export interface WhatIfDelta {
  companyId: string;
  companyName: string;
  logoBg?: string;
  logoText?: string;
  industry?: string;
  location?: string;
  size?: string;
  hasSufficientData?: boolean;
  coverageNote?: string;
  baselineScore: number | null;
  baselineRank: number | null;
  scenarioScore: number | null;
  scenarioRank: number | null;
  scoreDiff: number | null;
  rankDiff: number | null;
  scenarioChange: string;
}

export interface WhatIfResult {
  baselineRankings: WhatIfRanking[];
  scenarioRankings: WhatIfRanking[];
  shifts?: WhatIfDelta[];
  delta?: WhatIfDelta[];
  keyTakeaway?: string;
  explanation?: string;
  sensitivitySummary?: string;
  appliedPriorities?: CareerDNAPreferences;
  baselinePriorities?: CareerDNAPreferences;
  priorities?: CareerDNAPreferences;
  totalCompanies?: number;
}

export interface ComparisonCategoryWinner {
  key: string;
  name: string;
  scores: Record<string, number | null>;
  highestScore: number | null;
  winner: string | null;
  winnerId?: string | null;
  hasData?: boolean;
  isMissing?: boolean;
  evidenceDetails?: Record<string, string | null>;
  evidenceReason?: string;
}

export interface BattleAnalysis {
  company1: {
    id: string;
    name: string;
    fitScore: number;
    strengths: string;
  };
  company2: {
    id: string;
    name: string;
    fitScore: number;
    strengths: string;
  };
  company3?: {
    id: string;
    name: string;
    fitScore: number;
    strengths: string;
  } | null;
  companies?: any[];
  categoryBattles?: Array<{
    category: string;
    key: string;
    scores: Record<string, number | null>;
    winner: string | null;
    winnerId: string | null;
    hasWinner: boolean;
    isTie: boolean;
    insufficientData: boolean;
    evidenceReason: string;
  }>;
  tradeoffAnalysis?: {
    archetype?: string;
    title: string;
    summary: string;
    recommendations: Array<{ persona: string; choice: string }>;
    verdict: string;
  };
  winner: string;
  winnerFitScore: number;
  explanation: string;
}

export interface ComparisonResult {
  companies: Company[];
  rankings: {
    companyId: string;
    companyName: string;
    score: number;
    rank: number;
    tagline: string;
  }[];
  categoryComparison: ComparisonCategoryWinner[];
  leadCompany: {
    id: string;
    name: string;
    headline: string;
    explanation: string;
  };
  battleAnalysis?: BattleAnalysis | null;
  priorities: CareerDNAPreferences;
}

export interface ReviewThemeItem {
  theme?: string;
  concern?: string;
  percentage: number;
  signal: 'positive' | 'negative' | 'neutral';
}

export interface SentimentTrendItem {
  year: number;
  positive: number;
  neutral: number;
  negative: number;
}

export interface ThemesTableRow {
  theme: string;
  relatedMentions: number;
  evidenceQuality: string;
  signal: string;
  nextStep: string;
}

export interface ReviewAggregateData {
  companyId: string;
  companySlug: string;
  companyName: string;
  totalReviews: number;
  sampleSourcesCount: number;
  daysSinceCheck: number;
  commonPositiveThemes: ReviewThemeItem[];
  concernsWorthExploring: ReviewThemeItem[];
  sentimentTrend: SentimentTrendItem[];
  sourceAgreement: {
    summary: string;
    sources: any[];
  };
  themesTable: ThemesTableRow[];
  interpretation: {
    summary: string;
    limitations: string;
  };
  isDemoData?: boolean;
}

export interface SettingsData {
  profile: {
    name: string;
    email: string;
    careerStage: string;
    targetRole: string;
    isDemoUser?: boolean;
  };
  researchPreferences: {
    defaultLocation: string;
    preferredWorkStyle: string;
    showSourceMetadata: boolean;
    showConfidence: boolean;
    useCareerDNAForRecommendations: boolean;
  };
  notificationPreferences: {
    evidenceUpdates: boolean;
    sourceConflictAlerts: boolean;
    emailDigest: boolean;
    digestFrequency: string;
  };
}

export interface JobSalary {
  min: number | null;
  max: number | null;
  currency: string;
  period: string | null;
  text: string | null;
}

export interface JobPosting {
  _id: string;
  title: string;
  companyId?: string | null;
  companySlug: string;
  companyName: string;
  externalJobId: string;
  description: string;
  responsibilities?: string[];
  skills: string[];
  experienceRange?: string | null;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Temporary' | 'Other' | string;
  workArrangement: 'Remote' | 'Hybrid' | 'On-site' | 'Unspecified';
  location: string;
  city?: string | null;
  country?: string | null;
  department: string;
  salary?: JobSalary;
  postedAt: string;
  applicationDeadline?: string | null;
  applyUrl: string;
  originalUrl?: string | null;
  sourceProvider: 'GREENHOUSE' | 'LEVER' | 'COMPANY_PORTAL' | 'WORKDAY' | 'MANUAL_VERIFIED' | string;
  status: 'ACTIVE' | 'EXPIRED' | 'CLOSED';
  lastVerifiedAt: string;
  isVerified: boolean;
}

export interface CareersSummary {
  companySlug: string;
  companyName: string;
  careersUrl: string | null;
  sourceProvider: string;
  hasLiveFeed: boolean;
  totalActiveJobs: number;
  lastVerifiedAt: string;
  statusNotice?: string | null;
  isVerifiedPortal: boolean;
}

export interface JobFilterParams {
  search?: string;
  workArrangement?: string;
  employmentType?: string;
  department?: string;
  dateRange?: '24h' | '7d' | '30d' | 'all';
  sortBy?: 'newest' | 'oldest' | 'title';
  page?: number;
  limit?: number;
}

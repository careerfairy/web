import { Identifiable } from "@careerfairy/webapp/types/commonTypes"
import { Timestamp } from "../firebaseTypes"
import { Spark } from "./sparks"

// Backend data type

export type TimeseriesDataPoint = {
   x: string | number
   y: unknown
}

export type TimePeriodParams = "7days" | "30days" | "6months" | "1year"

export type WithPastData<T> = {
   [key in TimePeriodParams]: T
}

export type SparkStatsFromBigQuery = {
   num_views: number
   num_likes: number
   num_shares: number
   num_clicks: number
}

export type CompetitorSparkCard = {
   rank?: number
   creator: {
      avatarUrl: string
      firstName: string
      lastName: string
   }
   group: {
      id?: string
      name: string
      logoUrl?: string
   }
   spark: {
      id?: string
      question: Spark["question"]
      categoryId: Spark["category"]["id"]
      videoThumbnailUrl: string
   }
}

export type MostSomethingStatsKeys = keyof SparkStatsFromBigQuery

export type MostSomethingBigQueryResult = {
   sparkId: string
} & SparkStatsFromBigQuery

export type MostSomethingBase = {
   sparkData: CompetitorSparkCard
} & SparkStatsFromBigQuery

export type MostSomethingWithPastData = WithPastData<MostSomethingBase[]>

export type CompetitorStatsFromBigQuery = {
   rank: number
   num_views: number
   avg_watched_time: number
   avg_watched_percentage: number
   engagement: number
}

export type CompetitorCompanyBigQueryResult = {
   groupId: string
   industry: string
   unique_viewers: number
} & CompetitorStatsFromBigQuery

export type CompetitorIndustryBigQueryResult = {
   sparkId: string
   industry: string
} & CompetitorStatsFromBigQuery

export type CompetitorIndustryDataBase = {
   groupData: {
      id: string
      name: string
      logoUrl: string
   }
} & CompetitorSparkData

export type CompetitorCompanyIndustryData = {
   [key in string]: CompetitorTopCompaniesBase[]
}

export type CompetitorIndustryData = {
   [key in string]: CompetitorIndustryDataBase[]
}

export type CompetitorCompaniesDataWithPastData =
   WithPastData<CompetitorCompanyIndustryData>

export type CompetitorIndustryBaseWithPastData =
   WithPastData<CompetitorIndustryData>

export type CompetitorCompanyData = {
   rank: number
   groupLogo: string
   groupName: string
   totalViews: number
   unique_viewers: number
   avg_watched_time: number
   avg_watched_percentage: number
   engagement: number
}

export type CompetitorTopCompaniesBase = {
   sparks: CompetitorSparkData[]
} & CompetitorCompanyData

export type CompetitorTopCompaniesData = {
   [key in string]: {
      [key in string]: CompetitorTopCompaniesBase
   }
}

export type CompetitorAudienceSegments =
   | "business-plus"
   | "engineering"
   | "it-and-mathematics"
   | "natural-sciences"
   | "social-sciences"
   | "other"

export type CompetitorAudienceBigQueryResult = {
   sparkId: string
   audience: CompetitorAudienceSegments
} & CompetitorStatsFromBigQuery

export type CompetitorAudienceBase = {
   sparkData: CompetitorSparkCard
   audience: CompetitorAudienceSegments
} & CompetitorStatsFromBigQuery

export type CompetitorSparkData = {
   sparkData: CompetitorSparkCard
} & CompetitorStatsFromBigQuery

export type CompetitorAudienceBaseWithPastData = WithPastData<
   CompetitorAudienceBase[]
>

export type CompetitorAudienceData = {
   [key in CompetitorAudienceSegments]: CompetitorSparkData[]
}

export type LinearBarDataPoint = {
   label: string
   value: number
   percentage: number
}
export type LinearBarWithPastData = WithPastData<LinearBarDataPoint[]>

export type PieChartDataPoint = {
   id: number
   label: string
   value: number
}
export type PieChartWithPastData = WithPastData<PieChartDataPoint[]>

export type FunctionSignature = {
   groupId: string
   forceUpdate: boolean
}

// DTO data types

export type ReachData = {
   totalViews: TimeseriesDataPoint[]
   uniqueViewers: TimeseriesDataPoint[]
}

export type EngagementData = {
   likes: TimeseriesDataPoint[]
   shares: TimeseriesDataPoint[]
   registrations: TimeseriesDataPoint[]
   pageClicks: TimeseriesDataPoint[]
}

export type MostSomethingData = {
   watched: MostSomethingWithPastData
   liked: MostSomethingWithPastData
   shared: MostSomethingWithPastData
   recent: MostSomethingWithPastData
}

export type SparksAnalyticsDTO = {
   reach: ReachData
   engagement: EngagementData
   most: MostSomethingData
   topCountries: LinearBarWithPastData
   topUniversities: LinearBarWithPastData
   topFieldsOfStudy: PieChartWithPastData
   levelsOfStudy: PieChartWithPastData
   topCompaniesByIndustry: CompetitorCompaniesDataWithPastData
   topSparksByIndustry: CompetitorIndustryBaseWithPastData
   topSparksByAudience: CompetitorAudienceBaseWithPastData
   updatedAt: Timestamp
} & Identifiable

// Frontend data types

export type TimeSeriesForCharts = {
   totalCount: number
   xAxis?: unknown[]
   series?: (number | null)[]
}
export type TimeSeriesForChartsWithPastData = WithPastData<TimeSeriesForCharts>

export type SparkAnalyticsClientOverview = {
   reach: {
      totalViews: TimeSeriesForCharts
      uniqueViewers: TimeSeriesForCharts
   }
   engagement: {
      likes: TimeSeriesForCharts
      shares: TimeSeriesForCharts
      registrations: TimeSeriesForCharts
      pageClicks: TimeSeriesForCharts
   }
   most: {
      [key in keyof MostSomethingData]: MostSomethingBase[]
   }
}

export type SparkAnalyticsClientAudience = {
   topCountries: LinearBarDataPoint[]
   topUniversities: LinearBarDataPoint[]
   topFieldsOfStudy: PieChartDataPoint[]
   levelsOfStudy: PieChartDataPoint[]
}

export type SparksAnalyticsClientCompetitor = {
   topCompaniesByIndustry: CompetitorCompanyIndustryData
   topSparksByIndustry: CompetitorIndustryData
   topSparksByAudience: CompetitorAudienceBase[]
}

export type SparkAnalyticsClient = SparkAnalyticsClientOverview &
   SparkAnalyticsClientAudience &
   SparksAnalyticsClientCompetitor

export type SparkAnalyticsClientWithPastData =
   WithPastData<SparkAnalyticsClient> & {
      updatedAt: Date
   }

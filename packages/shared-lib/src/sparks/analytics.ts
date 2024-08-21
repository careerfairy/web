// Backend data types

export type TimeseriesDataPoint = {
   x: string | number
   y: unknown
}

export type TimePeriodParams = "7days" | "30days" | "6months" | "1year"

export type WithPastData<T> = {
   [key in TimePeriodParams]: T
}

export type MostSomethingBase = string[]
export type MostSomethingWithPastData = WithPastData<string[]>

export type AudienceSegments =
   | "business-plus"
   | "engineering"
   | "it-and-mathematics"
   | "natural-sciences"
   | "social-sciences"
   | "other"

export type AudienceBase = {
   sparkId: string
   audience: AudienceSegments
   engagement: number
}

export type AudienceBaseWithPastData = WithPastData<AudienceBase[]>

export type AudienceData<T> = {
   [key in AudienceSegments]: T[]
}
export type AudienceWithPastData = WithPastData<AudienceData<AudienceBase>>

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
   recent: MostSomethingBase
}

export type SparksAnalyticsDTO = {
   reach: ReachData
   engagement: EngagementData
   most: MostSomethingData
   topCountries: LinearBarWithPastData
   topUniversities: LinearBarWithPastData
   topFieldsOfStudy: PieChartWithPastData
   levelsOfStudy: PieChartWithPastData
   topSparksByIndustry: MostSomethingWithPastData
   topSparksByAudience: AudienceBaseWithPastData
}

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
      [key in keyof MostSomethingData]: MostSomethingBase
   }
}

export type SparkAnalyticsClientAudience = {
   topCountries: LinearBarDataPoint[]
   topUniversities: LinearBarDataPoint[]
   topFieldsOfStudy: PieChartDataPoint[]
   levelsOfStudy: PieChartDataPoint[]
}

export type SparksAnalyticsClientCompetitor = {
   topSparksByIndustry: MostSomethingBase
   topSparksByAudience: AudienceWithPastData
}

export type SparkAnalyticsClient = SparkAnalyticsClientOverview &
   SparkAnalyticsClientAudience &
   SparksAnalyticsClientCompetitor

export type SparkAnalyticsClientWithPastData =
   WithPastData<SparkAnalyticsClient>

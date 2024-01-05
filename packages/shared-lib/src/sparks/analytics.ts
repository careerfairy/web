// Backend data types

export type TimeseriesDataPoint = {
   x: string | number
   y: any
}

export type TimePeriodParams = "7days" | "30days" | "6months" | "1year"

export type WithPastData<T> = {
   [key in TimePeriodParams]: T
}

export type MostSomethingBase = string[]
export type MostSomethingWithPastData = WithPastData<string[]>

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
}

// Frontend data types

export type TimeSeriesForCharts = {
   totalCount: number
   xAxis?: any[]
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

export type SparkAnalyticsClient = SparkAnalyticsClientOverview &
   SparkAnalyticsClientAudience

export type SparkAnalyticsClientWithPastData =
   WithPastData<SparkAnalyticsClient>

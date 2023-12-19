// Base data types

export type TimeseriesDataPoint = {
   x: string | number
   y: any
}

export type TimePeriodParams = "7days" | "30days" | "6months" | "1year"

type WithPastData<T> = {
   [key in TimePeriodParams]: T[]
}

export type MostSomethingBase = string[]
export type MostSomethingWithPastData = WithPastData<string>

export type LinearBarDataPoint = {
   label: string
   value: number
}
export type LinearBarWithPastData = WithPastData<LinearBarDataPoint>

export type PieChartDataPoint = {
   id: number
   label: string
   value: number
}
export type PieChartWithPastData = WithPastData<PieChartDataPoint>

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

export type MostWatchedData = {
   watched: MostSomethingWithPastData
   liked: MostSomethingWithPastData
   shared: MostSomethingWithPastData
   recent: MostSomethingBase
}

export type SparksAnalyticsDTO = {
   reach: ReachData
   engagement: EngagementData
   most: MostWatchedData
   topCountries: LinearBarWithPastData
   topUniversities: LinearBarWithPastData
   topFieldsOfStudy: PieChartWithPastData
   levelsOfStudy: PieChartWithPastData
}

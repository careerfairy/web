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
   name: string
   value: number
   percentage: number
}
export type LinearBarWithPastData = WithPastData<LinearBarDataPoint>

export type PieChartDataPoint = {
   id: number
   label: string
   value: number
}
export type PieChartWithPastData = WithPastData<PieChartDataPoint>

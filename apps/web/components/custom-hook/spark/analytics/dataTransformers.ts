// Collection of helper functions for data mapping between the backend and frontend

import {
   MostSomethingBase,
   SparkAnalyticsUIWithPastData,
   SparksAnalyticsDTO,
   TimePeriodParams,
   TimeSeriesForCharts,
   TimeseriesDataPoint,
} from "@careerfairy/shared-lib/src/sparks/analytics"

type FilterTimeSeriesDataByTimeFrame = {
   (
      data: TimeseriesDataPoint[],
      timeFrame: number,
      isMonth?: boolean
   ): TimeseriesDataPoint[]
}

const filterTimeSeriesDataByTimeFrame: FilterTimeSeriesDataByTimeFrame = (
   data,
   timeFrame,
   isMonth = false
) => {
   const cutoff = new Date()
   if (isMonth) {
      cutoff.setMonth(cutoff.getMonth() - timeFrame)
   } else {
      cutoff.setDate(cutoff.getDate() - timeFrame)
   }

   return data.filter((item) => {
      const itemDate = new Date(item.x)
      return itemDate >= cutoff
   })
}

const mapMostSomethingData = (data): MostSomethingBase => {
   return data.map((d) => d.sparkId)
}

const getxAxisData = (data) => {
   return data.map((d) => new Date(d.x))
}

const getSeriesData = (data) => {
   return data.map((d) => d.y)
}

const transformTimeSeriesDataForChart = (data): TimeSeriesForCharts => {
   const xAxisData = getxAxisData(data)
   const seriesData = getSeriesData(data)
   const seriesTotalCount = getTotalCount(seriesData)

   return {
      totalCount: seriesTotalCount,
      xAxis: xAxisData,
      series: seriesData,
   }
}

const getTotalCount = (data) => {
   if (data.length == 0) return 0
   return data.reduce((sum, current) => sum + current)
}

const transformDataForClient = (data, value, isMonth) => {
   const filteredData = filterTimeSeriesDataByTimeFrame(data, value, isMonth)
   const chartData = transformTimeSeriesDataForChart(filteredData)

   return chartData
}

type TimeFrame = {
   timeFrame: TimePeriodParams
   value: number
   isMonth: boolean
}

export const convertToClientModel = (
   data: SparksAnalyticsDTO
): SparkAnalyticsUIWithPastData => {
   const {
      reach,
      engagement,
      most,
      /*topCountries,
    topUniversities,
    topFieldsOfStudy,
    levelsOfStudy,*/
   } = data

   const timeFrames: TimeFrame[] = [
      { timeFrame: "7days", value: 7, isMonth: false },
      { timeFrame: "30days", value: 30, isMonth: false },
      { timeFrame: "6months", value: 6, isMonth: true },
      { timeFrame: "1year", value: 12, isMonth: true },
   ]

   const analytics: any = timeFrames.reduce(
      (acc, { timeFrame, value, isMonth }) => {
         acc[timeFrame] = {
            reach: {
               totalViews: transformDataForClient(
                  reach.totalViews,
                  value,
                  isMonth
               ),
               uniqueViewers: transformDataForClient(
                  reach.uniqueViewers,
                  value,
                  isMonth
               ),
            },
            engagement: {
               likes: transformDataForClient(engagement.likes, value, isMonth),
               shares: transformDataForClient(
                  engagement.shares,
                  value,
                  isMonth
               ),
               registrations: transformDataForClient(
                  engagement.registrations,
                  value,
                  isMonth
               ),
               pageClicks: transformDataForClient(
                  engagement.pageClicks,
                  value,
                  isMonth
               ),
            },
            most: {
               watched: mapMostSomethingData(most.watched[timeFrame]),
               liked: mapMostSomethingData(most.liked[timeFrame]),
               shared: mapMostSomethingData(most.shared[timeFrame]),
               recent: mapMostSomethingData(most.recent),
            },
            topCountries: null,
            topUniversities: null,
            topFieldsOfStudy: null,
            levelsOfStudy: null,
         }
         return acc
      },
      {}
   )

   return analytics
}

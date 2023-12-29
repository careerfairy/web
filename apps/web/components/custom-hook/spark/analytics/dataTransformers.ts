// Collection of helper functions for data mapping between the backend and frontend

import {
   LinearBarDataPoint,
   MostSomethingBase,
   PieChartDataPoint,
   SparkAnalyticsClientWithPastData,
   SparksAnalyticsDTO,
   TimePeriodParams,
   TimeSeriesForCharts,
   TimeseriesDataPoint,
} from "@careerfairy/shared-lib/src/sparks/analytics"
import { universityCountriesMap } from "components/util/constants/universityCountries"

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

const getxAxisData = (data): Date[] => {
   return data.map((d) => new Date(d.x))
}

const getSeriesData = (data): number[] => {
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

const getTotalCount = (data): number => {
   if (data.length == 0) return 0
   return data.reduce((sum, current) => sum + current)
}

const transformDataForClient = (data, value, isMonth): TimeSeriesForCharts => {
   const filteredData = filterTimeSeriesDataByTimeFrame(data, value, isMonth)
   const chartData = transformTimeSeriesDataForChart(filteredData)

   return chartData
}

const replaceLabelByName = (data, lookup): PieChartDataPoint[] => {
   return data.map((dataPoint) => {
      return {
         ...dataPoint,
         label: lookup[dataPoint.label],
      }
   })
}

const mapPieChartData = (data): PieChartDataPoint[] =>
   data.map((d, i) => {
      return {
         id: i,
         value: Math.round(d.value),
         label: d.label,
      }
   })

const transformPieChartData = (data, lookup): PieChartDataPoint[] => {
   const mappedData = mapPieChartData(data)
   return replaceLabelByName(mappedData, lookup)
}

const mapCountryCodes = (data): LinearBarDataPoint[] => {
   return data.map((d) => {
      return {
         ...d,
         label: universityCountriesMap[d.label],
      }
   })
}

type TimeFrame = {
   timeFrame: TimePeriodParams
   value: number
   isMonth: boolean
}

export const convertToClientModel = (
   data: SparksAnalyticsDTO,
   fieldsOfStudyLookup,
   levelsOfStudyLookup
): SparkAnalyticsClientWithPastData | {} => {
   const {
      reach,
      engagement,
      most,
      topCountries,
      topUniversities,
      topFieldsOfStudy,
      levelsOfStudy,
   } = data

   const timeFrames: TimeFrame[] = [
      { timeFrame: "7days", value: 7, isMonth: false },
      { timeFrame: "30days", value: 30, isMonth: false },
      { timeFrame: "6months", value: 6, isMonth: true },
      { timeFrame: "1year", value: 12, isMonth: true },
   ]

   const analytics: SparkAnalyticsClientWithPastData | {} = timeFrames.reduce(
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
            topCountries: mapCountryCodes(topCountries[timeFrame]),
            topUniversities: topUniversities[timeFrame],
            topFieldsOfStudy: transformPieChartData(
               topFieldsOfStudy[timeFrame],
               fieldsOfStudyLookup
            ),
            levelsOfStudy: transformPieChartData(
               levelsOfStudy[timeFrame],
               levelsOfStudyLookup
            ),
         }
         return acc
      },
      {}
   )

   return analytics
}

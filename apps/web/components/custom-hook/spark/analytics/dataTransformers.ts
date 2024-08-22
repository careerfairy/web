// Collection of helper functions for data mapping between the backend and frontend

import {
   CompetitorAudienceData,
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

const AUDIENCE_SPARKS_LIMIT = 4

type FilterTimeSeriesDataByTimeFrame = (
   data: TimeseriesDataPoint[],
   timeFrameValue: number
) => TimeseriesDataPoint[]

const filterTimeSeriesDataByTimeFrameInDays: FilterTimeSeriesDataByTimeFrame = (
   data,
   timeFrameValue
) => {
   const cutoff = new Date()
   cutoff.setDate(cutoff.getDate() - timeFrameValue)

   return data.filter((item) => {
      const itemDate = new Date(item.x)
      return itemDate >= cutoff
   })
}

const filterTimeSeriesDataByTimeFrameInMonths: FilterTimeSeriesDataByTimeFrame =
   (data, timeFrameValue) => {
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - timeFrameValue)

      return data.filter((item) => {
         const itemDate = new Date(item.x)
         return itemDate >= cutoff
      })
   }

const mapMostSomethingData = (data): MostSomethingBase => {
   return data.map((d) => d.sparkId)
}

const mapAudienceData = (
   data: SparksAnalyticsDTO["topSparksByAudience"][TimePeriodParams]
): CompetitorAudienceData<string> => {
   const audienceSegmentsMap = {
      all: [],
      "business-plus": [],
      engineering: [],
      "it-and-mathematics": [],
      "natural-sciences": [],
      "social-sciences": [],
      other: [],
   }

   for (const item of data) {
      if (audienceSegmentsMap[item.audience].length < AUDIENCE_SPARKS_LIMIT) {
         audienceSegmentsMap[item.audience].push(item.sparkId)
      }
   }

   const auxAllSet = new Set()

   for (const item of data) {
      if (auxAllSet.size < AUDIENCE_SPARKS_LIMIT) {
         auxAllSet.add(item.sparkId)
      }
   }

   audienceSegmentsMap["all"] = Array.from(auxAllSet)

   console.log("🚀 ~ audienceSegmentsMap['all']:", audienceSegmentsMap["all"])

   return audienceSegmentsMap
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

const transformDataForClient = (
   data,
   value,
   timeFrameFilterCallback
): TimeSeriesForCharts => {
   const filteredData = timeFrameFilterCallback(data, value)
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

type FilterableTimeFrame = {
   timeFrame: TimePeriodParams
   value: number
   timeFrameFilterCallback: FilterTimeSeriesDataByTimeFrame
}

export const convertToClientModel = (
   data: SparksAnalyticsDTO,
   fieldsOfStudyLookup,
   levelsOfStudyLookup
): SparkAnalyticsClientWithPastData | object => {
   const {
      reach,
      engagement,
      most,
      topCountries,
      topUniversities,
      topFieldsOfStudy,
      levelsOfStudy,
      topSparksByIndustry,
      topSparksByAudience,
   } = data

   const timeFramesFilters: FilterableTimeFrame[] = [
      {
         timeFrame: "7days",
         value: 7,
         timeFrameFilterCallback: filterTimeSeriesDataByTimeFrameInDays,
      },
      {
         timeFrame: "30days",
         value: 30,
         timeFrameFilterCallback: filterTimeSeriesDataByTimeFrameInDays,
      },
      {
         timeFrame: "6months",
         value: 6,
         timeFrameFilterCallback: filterTimeSeriesDataByTimeFrameInMonths,
      },
      {
         timeFrame: "1year",
         value: 12,
         timeFrameFilterCallback: filterTimeSeriesDataByTimeFrameInMonths,
      },
   ]

   const analytics: SparkAnalyticsClientWithPastData | object =
      timeFramesFilters.reduce(
         (acc, { timeFrame, value, timeFrameFilterCallback }) => {
            acc[timeFrame] = {
               reach: {
                  totalViews: transformDataForClient(
                     reach.totalViews,
                     value,
                     timeFrameFilterCallback
                  ),
                  uniqueViewers: transformDataForClient(
                     reach.uniqueViewers,
                     value,
                     timeFrameFilterCallback
                  ),
               },
               engagement: {
                  likes: transformDataForClient(
                     engagement.likes,
                     value,
                     timeFrameFilterCallback
                  ),
                  shares: transformDataForClient(
                     engagement.shares,
                     value,
                     timeFrameFilterCallback
                  ),
                  registrations: transformDataForClient(
                     engagement.registrations,
                     value,
                     timeFrameFilterCallback
                  ),
                  pageClicks: transformDataForClient(
                     engagement.pageClicks,
                     value,
                     timeFrameFilterCallback
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
               topSparksByIndustry: mapMostSomethingData(
                  topSparksByIndustry[timeFrame]
               ),
               topSparksByAudience: mapAudienceData(
                  topSparksByAudience[timeFrame]
               ),
            }
            return acc
         },
         {}
      )

   return analytics
}

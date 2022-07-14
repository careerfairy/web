import { useCallback, useEffect, useMemo, useState } from "react"
import {
   getGeneralUserBreakdownStats,
   getUserBreakdownStatsBasedOnCustomCategories,
   UserBreakdownStats,
   UserData,
} from "@careerfairy/shared-lib/dist/users"
import { CustomCategory } from "@careerfairy/shared-lib/dist/groups"
import { colorsArray } from "../util/colors"
import { useTheme } from "@mui/material/styles"

interface ChartData {
   datasets: {
      data: string[]
      ids: string[]
      id: string[]
      backgroundColor: string[]
      borderWidth: number
      borderColor: string
      hoverBorderColor: string
   }[]
   labels: string[]
   ids: string[]
   dataId: string
}

function randomColor() {
   const max = 0xffffff
   return "#" + Math.round(Math.random() * max).toString(16)
}

const useUserBreakdownStats = (
   users: UserData[],
   customCategories?: CustomCategory[]
) => {
   const theme = useTheme()

   const [chartData, setChartData] = useState<ChartData>({
      datasets: [],
      labels: [],
      ids: [],
      dataId: "",
   })
   const [colors, setColors] = useState(colorsArray)

   const [currentStats, setCurrentStats] = useState<UserBreakdownStats>(null)

   useEffect(() => {
      if (currentStats?.dataArray.length) {
         setColors([
            ...colorsArray,
            ...currentStats.dataArray.map(() => randomColor()),
         ])
      }
   }, [currentStats?.dataArray.length])

   useEffect(() => {
      if (currentStats) {
         const dataPoints = currentStats.dataArray.reduce(
            (acc, option) => {
               acc.data.push(option.count)
               acc.labels.push(option.optionName)
               acc.ids.push(option.optionId)
               return acc
            },
            {
               data: [],
               ids: [],
               labels: [],
            }
         )
         setChartData({
            datasets: [
               {
                  data: dataPoints.data,
                  ids: dataPoints.ids,
                  id: dataPoints.ids,
                  backgroundColor: colors,
                  borderWidth: 8,
                  borderColor: theme.palette.common.white,
                  hoverBorderColor: theme.palette.common.white,
               },
            ],
            labels: dataPoints.labels,
            ids: dataPoints.ids,
            dataId: currentStats.id,
         })
      }
   }, [currentStats, theme.palette.mode, colors])

   const totalStats = useMemo<UserBreakdownStats[]>(() => {
      if (users) {
         if (customCategories) {
            return getUserBreakdownStatsBasedOnCustomCategories(
               users,
               customCategories
            )
         }
         return getGeneralUserBreakdownStats(users)
      }
      return []
   }, [users, customCategories])

   useEffect(() => {
      handleStatChange(currentStats?.id)
   }, [Boolean(totalStats.length), Boolean(customCategories), users])

   const handleStatChange = useCallback(
      (categoryId?: string) => {
         const newUserStat =
            totalStats.find((category) => category.id === categoryId) ||
            totalStats?.[0] ||
            null
         setCurrentStats(newUserStat)
      },
      [totalStats]
   )
   const hasNoData = Boolean(currentStats?.dataArray?.length === 0)

   return useMemo(
      () => ({
         currentStats,
         totalStats,
         handleStatChange,
         hasNoData,
         chartData,
         colors,
      }),
      [currentStats, totalStats, handleStatChange, chartData, colors]
   )
}

export default useUserBreakdownStats

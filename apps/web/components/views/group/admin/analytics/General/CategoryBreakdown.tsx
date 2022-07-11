import React, { useEffect, useMemo, useRef, useState } from "react"
import { Doughnut } from "react-chartjs-2"
import {
   Accordion,
   AccordionDetails,
   AccordionSummary,
   Box,
   Button,
   Card,
   CardContent,
   CardHeader,
   Divider,
   FormControlLabel,
   MenuItem,
   Select,
   Switch,
   Tab,
   Tabs,
   Typography,
} from "@mui/material"
import { colorsArray } from "../../../../../util/colors"
import RotateLeftIcon from "@mui/icons-material/RotateLeft"
import { prettyDate } from "../../../../../helperFunctions/HelperFunctions"
import CustomLegend from "../../../../../../materialUI/Legends"
import Chart from "chart.js"
import "chartjs-plugin-labels"
import { customDonutConfig } from "../common/TableUtils"
import { useTheme } from "@mui/material/styles"
import { useSelector } from "react-redux"
import StatsUtil from "../../../../../../data/util/StatsUtil"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { sxStyles } from "../../../../../../types/commonTypes"
import RootState from "../../../../../../store/reducers"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { Group, GroupUserStat } from "@careerfairy/shared-lib/dist/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { UserDataSet, UserType } from "../index"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"

Chart.defaults.global.plugins.labels = false

const styles = sxStyles({
   root: {
      height: "100%",
   },
   accordionRoot: {
      boxShadow: (theme) => theme.boxShadows.dark_8_25_10,
      "&:before": {
         backgroundColor: "transparent !important",
      },
   },
   heading: {
      fontSize: (theme) => theme.typography.pxToRem(15),
      fontWeight: (theme) => theme.typography.fontWeightMedium,
   },
   expanded: {
      marginTop: "0 !important",
   },
})

function randomColor() {
   var max = 0xffffff
   return "#" + Math.round(Math.random() * max).toString(16)
}

const CategoryBreakdown = ({
   currentStream,
   userTypes,
   breakdownRef,
   currentUserDataSet,
   handleReset,
   streamsFromTimeFrameAndFuture,
   localUserType,
   setLocalUserType,
}: Props) => {
   const showUniversityBreakdown =
      currentUserDataSet.dataSet === "groupUniversityStudents"
   const useGroupProps = useGroup()
   const [groupUserStat, setGroupUserStat] = useState<GroupUserStat>(null)
   const theme = useTheme()
   const chartRef = useRef()
   const [localColors, setLocalColors] = useState(colorsArray)
   const [showPercentage, setShowPercentage] = useState(true)
   const [showLabels, setShowLabels] = useState(true)
   const hiddenStreamIds = useSelector(
      (state: RootState) => state.analyticsReducer.hiddenStreamIds
   )
   const noOfVisibleStreamIds = useSelector(
      (state: RootState) => state.analyticsReducer.visibleStreamIds?.length || 0
   )
   const totalUsers = useSelector((state: RootState) =>
      showUniversityBreakdown
         ? state.firestore.ordered[currentUserDataSet.dataSet]
         : state.userDataSet.filtered.ordered
   )

   const audience = useMemo<UserData[]>(() => {
      if (currentStream) {
         return totalUsers?.filter(
            (user) =>
               currentStream[localUserType.propertyName]?.includes(
                  user.userEmail
               ) &&
               StatsUtil.studentFollowsGroup(
                  user,
                  useGroupProps.groupPresenter.model
               )
         )
      } else {
         return totalUsers?.filter((user) =>
            streamsFromTimeFrameAndFuture?.some(
               (stream) =>
                  stream?.[localUserType.propertyName]?.includes(
                     user.userEmail
                  ) &&
                  StatsUtil.studentFollowsGroup(
                     user,
                     useGroupProps.groupPresenter.model
                  )
            )
         )
      }
   }, [
      currentStream,
      localUserType,
      streamsFromTimeFrameAndFuture,
      currentUserDataSet.dataSet,
      totalUsers,
   ])

   const userStats = useMemo<GroupUserStat[]>(() => {
      if (audience) {
         if (showUniversityBreakdown) {
            return useGroupProps.groupPresenter.getCustomUserCategoryStats(
               audience,
               useGroupProps.customCategories
            )
         }
         return useGroupProps.groupPresenter.getGeneralUserCategoryStats(
            audience
         )
      }
      return []
   }, [
      audience?.length,
      showUniversityBreakdown,
      useGroupProps.customCategories,
   ])
   const [data, setData] = useState({
      datasets: [],
      labels: [],
      ids: [],
      dataId: "",
   })

   useEffect(() => {
      if (groupUserStat?.dataArray?.length > 0) {
         const numOptions = groupUserStat.dataArray.length || 0
         if (localColors.length < numOptions) {
            // only add more colors if there arent enough colors
            setLocalColors([
               ...colorsArray,
               ...groupUserStat.dataArray.map(() => randomColor()),
            ])
         }
      }
   }, [groupUserStat?.dataArray])

   useEffect(() => {
      if (groupUserStat?.dataArray) {
         const dataPoints = groupUserStat.dataArray.reduce(
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
         setData({
            datasets: [
               {
                  data: dataPoints.data,
                  ids: dataPoints.ids,
                  id: dataPoints.ids,
                  backgroundColor: localColors,
                  borderWidth: 8,
                  borderColor: theme.palette.common.white,
                  hoverBorderColor: theme.palette.common.white,
               },
            ],
            labels: dataPoints.labels,
            ids: dataPoints.ids,
            dataId: groupUserStat.id + localUserType.propertyName,
         })
      }
   }, [groupUserStat?.dataArray, localColors, localUserType.propertyName])

   const options = {
      cutoutPercentage: 70,
      layout: { padding: 0 },
      legend: {
         display: false,
      },
      maintainAspectRatio: false,
      responsive: true,
      tooltips: {
         backgroundColor: theme.palette.background.default,
         bodyFontColor: theme.palette.text.secondary,
         borderColor: theme.palette.divider,
         borderWidth: 1,
         enabled: true,
         footerFontColor: theme.palette.text.secondary,
         intersect: false,
         mode: "index",
         titleFontColor: theme.palette.text.primary,
      },
      plugins: {
         labels: showPercentage && customDonutConfig,
      },
   }

   const hasNoData = () => {
      return Boolean(groupUserStat?.dataArray?.length === 0)
   }

   const handleMenuItemClick = (event, index) => {
      setLocalUserType(userTypes[index])
   }

   const togglePercentage = () => {
      setShowPercentage(!showPercentage)
   }

   useEffect(() => {
      handleCategoryChange(groupUserStat?.id)
   }, [Boolean(userStats.length), localUserType, audience])

   const handleCategoryChange = (categoryId?: string) => {
      const newUserStat =
         userStats.find((category) => category.id === categoryId) ||
         userStats?.[0] ||
         null
      setGroupUserStat(newUserStat)
   }
   return (
      <Card raised={Boolean(currentStream)} sx={styles.root}>
         <CardHeader
            title={`${localUserType.displayName}`}
            ref={breakdownRef}
            subheader={
               currentStream
                  ? `That attended ${currentStream.company} on ${prettyDate(
                       currentStream.start
                    )}`
                  : hiddenStreamIds
                  ? `For the ${noOfVisibleStreamIds} selected events`
                  : "For all events"
            }
            action={
               currentStream && (
                  <Button
                     size="small"
                     variant="text"
                     onClick={handleReset}
                     endIcon={<RotateLeftIcon />}
                  >
                     Reset
                  </Button>
               )
            }
         />

         <Tabs
            value={localUserType.propertyName}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            aria-label="students-type-tabs"
         >
            {userTypes.map(({ displayName, propertyName }, index) => (
               <Tab
                  wrapped
                  key={propertyName}
                  value={propertyName}
                  onClick={(event) => handleMenuItemClick(event, index)}
                  label={displayName}
               />
            ))}
         </Tabs>
         <Divider />
         <CardContent>
            <Select
               value={groupUserStat?.id || ""}
               variant="outlined"
               fullWidth
               onChange={({ target: { value } }) => handleCategoryChange(value)}
            >
               {userStats.map(({ label, id }) => (
                  <MenuItem key={id} value={id}>
                     {label}
                  </MenuItem>
               ))}
            </Select>
            <FormControlLabel
               control={
                  <Switch
                     checked={showPercentage}
                     onChange={togglePercentage}
                     name="percentageToggle"
                     color="primary"
                  />
               }
               label={<Typography>Show Percentage</Typography>}
            />
            <Box
               height={300}
               position="relative"
               display="flex"
               flexDirection="column"
               justifyContent="center"
               alignItems="center"
            >
               {hasNoData() ? (
                  <>
                     <Typography>
                        Not enough {localUserType.displayName} data
                     </Typography>
                     <Button
                        size="small"
                        variant="text"
                        onClick={handleReset}
                        endIcon={<RotateLeftIcon />}
                     >
                        Reset
                     </Button>
                  </>
               ) : (
                  <Doughnut data={data} ref={chartRef} options={options} />
               )}
            </Box>
            {!hasNoData() && (
               <Accordion
                  expanded={showLabels}
                  sx={[showLabels && styles.expanded, styles.accordionRoot]}
               >
                  <AccordionSummary
                     onClick={() => setShowLabels(!showLabels)}
                     expandIcon={<ExpandMoreIcon />}
                     style={{ minHeight: 45 }}
                  >
                     <Typography sx={styles.heading}>
                        {showLabels ? "Hide Breakdown" : "Show Breakdown"}
                     </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                     <Box display="flex" justifyContent="center">
                        <CustomLegend
                           options={groupUserStat?.dataArray}
                           colors={localColors}
                           chartRef={chartRef}
                           fullWidth
                           hideEmpty
                           chartData={data}
                           optionDataType="User"
                           optionValueProp="count"
                        />
                     </Box>
                  </AccordionDetails>
               </Accordion>
            )}
         </CardContent>
      </Card>
   )
}

interface Props {
   breakdownRef: React.RefObject<HTMLDivElement>
   currentStream: LivestreamEvent | null
   currentUserDataSet: UserDataSet
   group: Group
   groups: Group[]
   userTypes: UserType[]
   handleReset: () => void
   localUserType: UserType
   setLocalUserType: (userType: UserType) => void
   streamsFromTimeFrameAndFuture: LivestreamEvent[]
}

export default CategoryBreakdown

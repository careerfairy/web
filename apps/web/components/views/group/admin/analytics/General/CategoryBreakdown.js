import React, { useEffect, useRef, useState } from "react"
import clsx from "clsx"
import PropTypes from "prop-types"
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
import { withFirebase } from "../../../../../../context/firebase/FirebaseServiceContext"
import RotateLeftIcon from "@mui/icons-material/RotateLeft"
import { prettyDate } from "../../../../../helperFunctions/HelperFunctions"
import CustomLegend from "../../../../../../materialUI/Legends"
import Chart from "chart.js"
import "chartjs-plugin-labels"
import { customDonutConfig } from "../common/TableUtils"
import { useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { useSelector } from "react-redux"
import { createSelector } from "reselect"
import StatsUtil from "../../../../../../data/util/StatsUtil"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

const audienceSelector = createSelector(
   (state) => state,
   (_, { currentUserDataSet }) => currentUserDataSet,
   (_, { currentGroup }) => currentGroup,
   (_, { currentStream }) => currentStream,
   (_, { localUserType }) => localUserType,
   (_, { streamsFromTimeFrameAndFuture }) => streamsFromTimeFrameAndFuture,
   (
      state,
      currentUserDataSet,
      currentGroup,
      currentStream,
      localUserType,
      streamsFromTimeFrameAndFuture
   ) => {
      const totalUsers =
         currentUserDataSet.dataSet === "groupUniversityStudents"
            ? state.firestore.ordered[currentUserDataSet.dataSet]
            : state.userDataSet.filtered.ordered
      if (currentStream) {
         return totalUsers?.filter(
            (user) =>
               currentStream[localUserType.propertyName]?.includes(
                  user.userEmail
               ) && StatsUtil.studentFollowsGroup(user, currentGroup)
         )
      } else {
         return totalUsers?.filter((user) =>
            streamsFromTimeFrameAndFuture?.some(
               (stream) =>
                  stream?.[localUserType.propertyName]?.includes(
                     user.userEmail
                  ) && StatsUtil.studentFollowsGroup(user, currentGroup)
            )
         )
      }
   }
)
Chart.defaults.global.plugins.labels = false

const useStyles = makeStyles((theme) => ({
   root: {
      height: "100%",
   },
   accordionRoot: {
      boxShadow: theme.shadows[2],
      "&:before": {
         backgroundColor: "transparent !important",
      },
   },
   heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightMedium,
   },
   expanded: {
      marginTop: "0 !important",
   },
}))

function randomColor() {
   var max = 0xffffff
   return "#" + Math.round(Math.random() * max).toString(16)
}

const initialCurrentCategory = { options: [] }

const CategoryBreakdown = ({
   group,
   setCurrentStream,
   currentStream,
   userTypes,
   breakdownRef,
   setUserType,
   currentUserDataSet,
   handleReset,
   streamsFromTimeFrameAndFuture,
   isUni,
   groups,
   localUserType,
   setLocalUserType,
   className,
   ...rest
}) => {
   const classes = useStyles()
   const theme = useTheme()
   const chartRef = useRef()
   const [localColors, setLocalColors] = useState(colorsArray)
   const [total, setTotal] = useState(0)
   const [showPercentage, setShowPercentage] = useState(true)
   const [showLabels, setShowLabels] = useState(true)
   const [value, setValue] = useState(0)
   const [currentGroup, setCurrentGroup] = useState(groups?.[0] || {})
   const [typesOfOptions, setTypesOfOptions] = useState([])
   const hiddenStreamIds = useSelector(
      (state) => state.analyticsReducer.hiddenStreamIds
   )
   const noOfVisibleStreamIds = useSelector(
      (state) => state.analyticsReducer.visibleStreamIds?.length || 0
   )
   const [currentCategory, setCurrentCategory] = useState(
      initialCurrentCategory
   )
   const audience = useSelector((state) =>
      audienceSelector(state, {
         currentGroup,
         currentStream,
         localUserType,
         streamsFromTimeFrameAndFuture,
         currentUserDataSet,
      })
   )
   const [data, setData] = useState({
      datasets: [],
      labels: [],
      ids: [],
   })

   useEffect(() => {
      if (groups?.length || !currentGroup?.id) {
         setCurrentGroup(groups[0])
         setCurrentCategory(
            groups?.[0]?.categories?.[0] || initialCurrentCategory
         )
         setValue(0)
      }
   }, [groups])

   useEffect(() => {
      if (group.categories?.length) {
         if (localColors.length < typesOfOptions.length) {
            // only add more colors if there arent enough colors
            setLocalColors([
               ...colorsArray,
               ...typesOfOptions.map(() => randomColor()),
            ])
         }
      }
   }, [group.categories, typesOfOptions.length])

   useEffect(() => {
      const newTypeOfOptions = getTypeOfStudents()
      setTypesOfOptions(newTypeOfOptions)
   }, [audience, currentCategory, currentGroup?.categories])

   useEffect(() => {
      if (typesOfOptions.length) {
         const totalCount = typesOfOptions.reduce((acc, curr) => {
            return acc + curr.count
         }, 0)
         setTotal(totalCount)
      }
   }, [typesOfOptions])

   useEffect(() => {
      setData({
         datasets: [
            {
               data: typesOfOptions.map((option) => option.count),
               ids: typesOfOptions.map((option) => option.id),
               id: typesOfOptions.map((option) => option.id),
               backgroundColor: localColors,
               borderWidth: 8,
               borderColor: theme.palette.common.white,
               hoverBorderColor: theme.palette.common.white,
            },
         ],
         labels: typesOfOptions.map((option) => option.name),
         ids: typesOfOptions.map((option) => option.id),
         dataId: currentCategory.id,
      })
   }, [typesOfOptions, localColors, currentGroup])

   const getTypeOfStudents = () => {
      const aggregateCategories = getAggregateCategories(audience)
      const flattenedGroupOptions = [...currentCategory.options].map(
         (option) => {
            const count = aggregateCategories.filter((category) =>
               category?.categories?.some(
                  (userOption) => userOption.selectedValueId === option.id
               )
            )?.length
            return { ...option, count }
         }
      )
      return flattenedGroupOptions.sort((a, b) => b.count - a.count)
   }

   const getAggregateCategories = (participants) => {
      let categories = []
      participants?.forEach((user) => {
         const matched = user.registeredGroups?.find(
            (groupData) => groupData.groupId === currentGroup.id
         )
         if (matched) {
            categories.push(matched)
         }
      })
      return categories
   }

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

   const handleChange = (event, newValue) => {
      setCurrentGroup(groups[newValue])
      setCurrentCategory(
         groups[newValue].categories?.[0] || initialCurrentCategory
      )
      setValue(newValue)
   }

   const hasNoData = () => {
      return Boolean(typesOfOptions.length && total === 0)
   }

   const handleMenuItemClick = (event, index) => {
      setLocalUserType(userTypes[index])
   }

   const handleGroupCategorySelect = ({ target: { value } }) => {
      const targetCategory = currentGroup.categories.find(
         (category) => category.id === value
      )
      if (targetCategory) {
         setCurrentCategory(targetCategory)
      }
   }

   const togglePercentage = () => {
      setShowPercentage(!showPercentage)
   }

   const hasPartnerGroups = Boolean(groups.length > 1)

   return (
      <Card
         raised={Boolean(currentStream)}
         className={clsx(classes.root, className)}
         {...rest}
      >
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
         {hasPartnerGroups && (
            <React.Fragment>
               <Tabs
                  value={value}
                  onChange={handleChange}
                  indicatorColor="secondary"
                  textColor="secondary"
                  variant="scrollable"
               >
                  {groups?.map((cc) => (
                     <Tab key={cc.id} wrapped label={cc.universityName} />
                  ))}
               </Tabs>
               <Divider />
            </React.Fragment>
         )}
         <CardContent>
            {currentCategory.id && (
               <>
                  <Select
                     value={currentCategory.id}
                     variant="outlined"
                     fullWidth
                     onChange={handleGroupCategorySelect}
                  >
                     {currentGroup.categories.map(({ id, name }) => (
                        <MenuItem key={id} value={id}>
                           {name}
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
                     label={
                        <Typography className={classes.toggleLabel}>
                           Show Percentage
                        </Typography>
                     }
                  />
               </>
            )}
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
                  classes={{
                     expanded: classes.expanded,
                     root: classes.accordionRoot,
                  }}
               >
                  <AccordionSummary
                     onClick={() => setShowLabels(!showLabels)}
                     expandIcon={<ExpandMoreIcon />}
                     style={{ minHeight: 45 }}
                  >
                     <Typography className={classes.heading}>
                        {showLabels ? "Hide Breakdown" : "Show Breakdown"}
                     </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                     <Box display="flex" justifyContent="center">
                        <CustomLegend
                           options={currentCategory.options}
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

CategoryBreakdown.propTypes = {
   breakdownRef: PropTypes.object.isRequired,
   className: PropTypes.string,
   currentStream: PropTypes.object,
   currentUserDataSet: PropTypes.object,
   group: PropTypes.object,
   groups: PropTypes.array,
   handleReset: PropTypes.func,
   isUni: PropTypes.bool,
   localUserType: PropTypes.object,
   setCurrentStream: PropTypes.func,
   setLocalUserType: PropTypes.func,
   setUserType: PropTypes.func,
   streamsFromTimeFrameAndFuture: PropTypes.array,
   userTypes: PropTypes.array,
}

export default withFirebase(CategoryBreakdown)

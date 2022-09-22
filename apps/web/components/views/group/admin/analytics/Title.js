import React, { useEffect, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import {
   Box,
   Button,
   Card,
   CardHeader,
   Menu,
   MenuItem,
   Tooltip,
   Typography,
} from "@mui/material"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import { StyledTooltipWithButton } from "../../../../../materialUI/GlobalTooltips"
import FilterStreamsIcon from "@mui/icons-material/Tune"
import { useSelector } from "react-redux"

const useStyles = makeStyles((theme) => ({
   root: {
      boxShadow: "none",
      background: "none",
   },
   title: {
      // fontWeight: 400
      marginRight: theme.spacing(1.5),
   },
   header: {
      paddingLeft: theme.spacing(3),
      paddingTop: 0,
      paddingBottom: 0,
   },
   titleButton: {},
   menuItem: {
      "&:focus": {
         backgroundColor: theme.palette.primary.main,
         "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
            color: theme.palette.common.white,
         },
      },
   },
}))

const Title = ({
   setGlobalTimeFrame,
   globalTimeFrames,
   group,
   currentUserDataSet,
   userDataSets,
   setCurrentUserDataSet,
   setStreamsMounted,
   streamsMounted,
   clearHiddenStreams,
   globalTimeFrame,
   handleOpenStreamFilterModal,
   streamFilterModalOpen,
}) => {
   const hasStreamsToFilterLength = useSelector(
      (state) => state.analyticsReducer.streams.fromTimeframeAndFuture.length
   )

   const hasStreamsToFilter = hasStreamsToFilterLength > 0

   const hiddenStreamIds = useSelector(
      (state) => state.analyticsReducer.hiddenStreamIds
   )

   const noOfVisibleStreamIds = useSelector(
      (state) => state.analyticsReducer.visibleStreamIds?.length || 0
   )
   const classes = useStyles()
   const [dateAnchorEl, setDateAnchorEl] = useState(null)
   const [studentAnchorEl, setStudentAnchorEl] = useState(null)
   const [hasSeenTip, setHasSeenTip] = useState(false)

   useEffect(() => {
      const hasSeenDataSetButton = localStorage.getItem("hasSeenDataSetButton")
      if (JSON.parse(hasSeenDataSetButton)) {
         setHasSeenTip(true)
      }
   }, [])

   const handleDateClickListItem = (event) => {
      setDateAnchorEl(event.currentTarget)
   }

   const handleDateMenuItemClick = (event, index) => {
      clearHiddenStreams()
      if (streamsMounted) {
         setStreamsMounted(false)
      }
      setGlobalTimeFrame(globalTimeFrames[index])
      setDateAnchorEl(null)
   }

   const handleDateMenuClose = () => {
      setDateAnchorEl(null)
   }
   const handleStudentClickListItem = (event) => {
      setStudentAnchorEl(event.currentTarget)
   }

   const handleStudentMenuItemClick = (event, index) => {
      if (!hasSeenTip) {
         markAsSeen()
         setHasSeenTip(true)
      }
      setCurrentUserDataSet(userDataSets[index])
      setStudentAnchorEl(null)
   }

   const handleStudentMenuClose = () => {
      setStudentAnchorEl(null)
   }

   const isFollowersData = () => {
      return Boolean(currentUserDataSet.dataSet === "followers")
   }

   const markAsSeen = () => {
      localStorage.setItem("hasSeenDataSetButton", JSON.stringify(true))
   }

   const handleSeen = () => {
      markAsSeen()
      setCurrentUserDataSet(userDataSets[1])
   }

   return (
      <Card className={classes.root}>
         <CardHeader
            className={classes.header}
            title={
               <Box display="flex" flexWrap="wrap" alignItems="center">
                  <Typography className={classes.title} variant="h4">
                     Channel Analytics
                  </Typography>
                  {group.universityCode && (
                     <>
                        <StyledTooltipWithButton
                           placement="right"
                           open={isFollowersData() && !hasSeenTip}
                           tooltipTitle="Tip"
                           onConfirm={handleSeen}
                           tooltipText={`If you would like to see the analytics based ONLY ON ${userDataSets[1]?.displayName} click here`}
                           buttonText={`Switch To ${userDataSets[1]?.displayName}`}
                        >
                           <Button
                              onClick={handleStudentClickListItem}
                              className={classes.titleButton}
                              endIcon={<ArrowDropDownIcon />}
                              size="large"
                              color="primary"
                              variant="contained"
                           >
                              {`For ${currentUserDataSet.miscName}`}
                           </Button>
                        </StyledTooltipWithButton>
                        <Menu
                           id="students-Menu"
                           anchorEl={studentAnchorEl}
                           keepMounted
                           open={Boolean(studentAnchorEl)}
                           onClose={handleStudentMenuClose}
                        >
                           {userDataSets.map((option, index) => (
                              <MenuItem
                                 key={option.id}
                                 selected={option.id === currentUserDataSet.id}
                                 onClick={(event) =>
                                    handleStudentMenuItemClick(event, index)
                                 }
                              >
                                 {option.displayName}
                              </MenuItem>
                           ))}
                        </Menu>
                     </>
                  )}
               </Box>
            }
            subheader={`Over the past ${globalTimeFrame.name}`}
            action={
               <Box
                  marginBottom={2}
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
               >
                  <Button
                     onClick={handleDateClickListItem}
                     endIcon={<ArrowDropDownIcon />}
                     variant="text"
                  >
                     {`In the last ${globalTimeFrame.name}`}
                  </Button>
                  <Menu
                     id="followers-menu"
                     anchorEl={dateAnchorEl}
                     keepMounted
                     open={Boolean(dateAnchorEl)}
                     onClose={handleDateMenuClose}
                  >
                     {globalTimeFrames.map((option, index) => (
                        <MenuItem
                           key={option.id}
                           selected={option.id === globalTimeFrame.id}
                           onClick={(event) =>
                              handleDateMenuItemClick(event, index)
                           }
                        >
                           {option.name}
                        </MenuItem>
                     ))}
                  </Menu>
                  <Tooltip
                     title={
                        hasStreamsToFilter
                           ? "Click here to filter out events from the chosen timeframe"
                           : "You need at least more than one event to be able to filter"
                     }
                  >
                     <span>
                        <Button
                           startIcon={<FilterStreamsIcon />}
                           onClick={handleOpenStreamFilterModal}
                           color="primary"
                           size="large"
                           disabled={
                              streamFilterModalOpen || !hasStreamsToFilter
                           }
                           variant={hiddenStreamIds ? "contained" : "outlined"}
                        >
                           {hiddenStreamIds
                              ? `${noOfVisibleStreamIds} event${
                                   noOfVisibleStreamIds > 1 ? "s" : ""
                                } selected`
                              : `Filter Events (${hasStreamsToFilterLength})`}
                        </Button>
                     </span>
                  </Tooltip>
               </Box>
            }
         />
      </Card>
   )
}

export default Title

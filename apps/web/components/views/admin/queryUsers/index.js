import React from "react"
import { useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import SwipeableViews from "react-swipeable-views"
import QueryEditView from "./QueryEditView"
import UserTableView from "./UserTableView"
import { AppBar, Backdrop, CircularProgress, Tab, Tabs } from "@mui/material"
import { useSelector } from "react-redux"
import { isLoaded } from "react-redux-firebase"

const useStyles = makeStyles((theme) => ({
   slide: {
      overflow: "hidden !important",
   },
   indicator: {
      height: theme.spacing(0.8),
      padding: theme.spacing(0, 0.5),
   },
   tab: {
      fontWeight: 600,
   },
   backdrop: {
      zIndex: theme.zIndex.tooltip,
   },
}))

const QueryUsersOverview = () => {
   const classes = useStyles()
   const theme = useTheme()
   const [value, setValue] = React.useState(0)
   const totalCount = useSelector(
      (state) => state.currentFilterGroup.data.totalStudentsData.count
   )
   const filteredCount = useSelector(
      (state) => state.currentFilterGroup.data.filteredStudentsData.count
   )
   const currentFilterGroupLoading = useSelector(
      (state) => state.currentFilterGroup.loading
   )
   const groupsLoaded = useSelector(
      ({
         firestore: {
            data: { careerCenterData },
         },
      }) => isLoaded(careerCenterData)
   )
   const loading = Boolean(currentFilterGroupLoading || !groupsLoaded)

   const handleChange = (event, newValue) => {
      setValue(newValue)
   }

   const handleChangeIndex = (index) => {
      setValue(index)
   }

   return (
      <React.Fragment>
         <AppBar className={classes.appBar} position="sticky" color="default">
            <Tabs
               value={value}
               onChange={handleChange}
               indicatorColor="primary"
               TabIndicatorProps={{ className: classes.indicator }}
               textColor="primary"
            >
               <Tab className={classes.tab} label="Queries" />
               <Tab
                  className={classes.tab}
                  label={`Filtered Users Table - [${filteredCount || "-"}]`}
               />
               <Tab
                  className={classes.tab}
                  label={`Total Users Table - [${totalCount || "-"}]`}
               />
            </Tabs>
         </AppBar>
         <SwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={value}
            slideClassName={classes.slide}
            disabled
            onChangeIndex={handleChangeIndex}
         >
            <QueryEditView loading={loading} />
            <UserTableView isFiltered />
            <UserTableView />
         </SwipeableViews>
         <Backdrop className={classes.backdrop} open={loading}>
            <CircularProgress color="inherit" />
         </Backdrop>
      </React.Fragment>
   )
}

export default QueryUsersOverview

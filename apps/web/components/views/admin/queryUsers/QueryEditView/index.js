import PropTypes from "prop-types"
import React, { useEffect } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Container, Grid } from "@mui/material"
import Toolbar from "../Toolbar"
import { useDispatch, useSelector } from "react-redux"
import { useFirestore } from "react-redux-firebase"
import * as actions from "../../../../../store/actions"
import { convertArrayOfObjectsToDictionaryByProp } from "../../../../../data/util/AnalyticsUtil"
import FilterComponent from "./FilterComponent"

const useStyles = makeStyles((theme) => ({
   root: {
      backgroundColor: theme.palette.background.dark,
      minHeight: "100%",
      paddingBottom: theme.spacing(3),
      paddingTop: theme.spacing(3),
      width: "100%",
   },
}))

const QueryEditView = ({ loading }) => {
   const dispatch = useDispatch()
   const classes = useStyles()
   const firestore = useFirestore()
   const filters = useSelector(
      (state) => state.currentFilterGroup.data?.filters || []
   )
   console.log("-> filters", filters)
   const totalData = useSelector((state) =>
      Boolean(state.currentFilterGroup.data.totalStudentsData.data)
   )
   console.log("-> totalData", totalData)
   const data = useSelector((state) => state.firestore.data)
   console.log("-> data", data)

   useEffect(() => {
      ;(async function getAllGroups() {
         await firestore.get({
            collection: "careerCenterData",
         })
      })()
   }, [])

   useEffect(() => {
      // Comment this out if you dont want to calculate total once groups are mounted
      if (
         !totalData &&
         filters.some((filter) => filter.filteredGroupFollowerData?.data)
      ) {
         ;(async () => {
            await handleQueryCurrentFilterGroup()
         })()
      }
   }, [totalData, filters])

   const handleQueryCurrentFilterGroup = async () => {
      try {
         dispatch(actions.setCurrentFilterGroupLoading())
         let groupIds = filters.map(({ groupId }) => groupId) || []
         let totalUsersMap = {}
         for (const groupId of groupIds) {
            let groupFollowersMap = data[`followers of ${groupId}`]
            if (!groupFollowersMap) {
               const userSnaps = await firestore.get({
                  collection: "userData",
                  where: ["groupIds", "array-contains", groupId],
                  storeAs: `followers of ${groupId}`,
               })
               const arrayOfUserData = userSnaps.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
               }))
               groupFollowersMap = convertArrayOfObjectsToDictionaryByProp(
                  arrayOfUserData,
                  "id"
               )
            }
            totalUsersMap = Object.assign(
               totalUsersMap,
               groupFollowersMap || {}
            )
         }
         dispatch(actions.setCurrentFilterGroupFiltered())
         dispatch(actions.setTotalFilterGroupUsers(totalUsersMap))
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }

      dispatch(actions.setCurrentFilterGroupLoaded())
   }

   return (
      <Container className={classes.root} maxWidth={false}>
         <Grid container spacing={2}>
            <Grid item xs={12}>
               <Toolbar loading={loading} />
            </Grid>
            <Grid item xs={12}>
               <FilterComponent />
            </Grid>
         </Grid>
      </Container>
   )
}

QueryEditView.propTypes = {
   loading: PropTypes.bool,
}
export default QueryEditView

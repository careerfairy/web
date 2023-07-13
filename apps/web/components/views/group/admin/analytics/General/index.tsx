import React, { useMemo, useState } from "react"
import { Container, Grid, Tooltip } from "@mui/material"
import TotalRegistrations from "./TotalRegistrations"
import TotalUniqueRegistrations from "./TotalUniqueRegistrations"
import CategoryBreakdown from "./CategoryBreakdown"
import AverageRegistrations from "./AverageRegistrations"
import { mustBeNumber } from "../../../../../helperFunctions/HelperFunctions"
import { useTheme } from "@mui/material/styles"
import LatestEvents from "../common/LatestEvents"
import UserCount from "./UserCount"
import TotalUniqueParticipatingStudents from "./TotalUniqueParticipatingStudents"
import useMediaQuery from "@mui/material/useMediaQuery"
import {
   getTotalEmailsFromStreamsByProperty,
   getUniqueIds,
} from "../../../../../../data/util/AnalyticsUtil"
import useUserDataSet from "../../../../../custom-hook/useUserDataSet"
import { useSelector } from "react-redux"
import { sxStyles } from "../../../../../../types/commonTypes"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { GlobalTimeFrame } from "../../../../../custom-hook/useTimeFrames"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { UserDataSet, UserType } from "../index"
import { RootState } from "../../../../../../store"

const styles = sxStyles({
   root: {
      backgroundColor: "background.dark",
      minHeight: "100%",
      paddingBottom: 3,
      paddingTop: 3,
      width: "100%",
   },
})

interface Props {
   group: Group
   loading: boolean
   globalTimeFrame: GlobalTimeFrame
   futureStreams: LivestreamEvent[]
   streamsFromBeforeTimeFrame: LivestreamEvent[]
   streamsFromTimeFrame: LivestreamEvent[]
   streamsFromTimeFrameAndFuture: LivestreamEvent[]
   handleScrollToBreakdown: () => void
   handleReset: () => void
   userTypes: UserType[]
   userType: UserType
   setUserType: (userType: UserType) => void
   breakdownRef: React.RefObject<HTMLDivElement>
   handleToggleBar: () => void
   setCurrentStream: (stream: LivestreamEvent) => void
   currentUserDataSet: UserDataSet
   currentStream: LivestreamEvent
   showBar: boolean
}

const General = ({
   group,
   loading,
   globalTimeFrame,
   futureStreams,
   streamsFromBeforeTimeFrame,
   streamsFromTimeFrame,
   streamsFromTimeFrameAndFuture,
   handleScrollToBreakdown,
   handleReset,
   userTypes,
   userType,
   setUserType,
   breakdownRef,
   handleToggleBar,
   setCurrentStream,
   currentUserDataSet,
   currentStream,
   showBar,
}: Props) => {
   const hiddenStreamIds = useSelector(
      (state: RootState) => state.analyticsReducer.hiddenStreamIds
   )
   const [localUserType, setLocalUserType] = useState(userTypes[0])
   const theme = useTheme()
   const mediumScreen = useMediaQuery(theme.breakpoints.down("lg"))
   const userDataSet = useUserDataSet(currentUserDataSet, { isFiltered: true })

   const getTotalRegisteredUsers = (streamsArray) => {
      const total = streamsArray.reduce(
         (accumulator, { registeredUsers }) =>
            accumulator + mustBeNumber(registeredUsers?.length || 0),
         0
      )
      // Checks if the result is a number
      return mustBeNumber(total)
   }

   const getAverageRegistrationsPerEvent = () => {
      const average = totalRegistrations / streamsFromTimeFrameAndFuture.length
      return mustBeNumber(average, 0)
   }

   const compareRegistrations = () => {
      const registrationsFromTimeFrame = getTotalEmailsFromStreamsByProperty(
         streamsFromTimeFrame,
         "registeredUsers"
      ).length
      const registrationsFromBeforeTimeFrame =
         getTotalEmailsFromStreamsByProperty(
            streamsFromBeforeTimeFrame,
            "registeredUsers"
         ).length
      const { positive, percentage } = getStats(
         registrationsFromTimeFrame,
         registrationsFromBeforeTimeFrame
      )

      return {
         positive,
         percentage: `${percentage}%`,
         dataToCompare:
            !hiddenStreamIds &&
            Boolean(
               registrationsFromBeforeTimeFrame && registrationsFromTimeFrame
            ),
      }
   }

   const compareUniqueRegistrations = (prop) => {
      const totalUsersFromTimeFrame = getTotalEmailsFromStreamsByProperty(
         streamsFromTimeFrame,
         prop
      )
      const totalUsersFromBeforeTimeFrame = getTotalEmailsFromStreamsByProperty(
         streamsFromBeforeTimeFrame,
         prop
      )
      const uniqueUsersFromTimeFrame = getUniqueIds(
         totalUsersFromTimeFrame
      ).length
      const uniqueUsersFromBeforeTimeFrame = getUniqueIds(
         totalUsersFromBeforeTimeFrame
      ).length
      const { positive, percentage } = getStats(
         uniqueUsersFromTimeFrame,
         uniqueUsersFromBeforeTimeFrame
      )

      return {
         positive,
         percentage: `${percentage}%`,
         dataToCompare:
            !hiddenStreamIds &&
            Boolean(uniqueUsersFromBeforeTimeFrame && uniqueUsersFromTimeFrame),
      }
   }

   const getStats = (lastMonthsRegistrations, lastTwoMonthsRegistrations) => {
      const difference = lastMonthsRegistrations - lastTwoMonthsRegistrations
      const positive = Boolean(
         lastMonthsRegistrations > lastTwoMonthsRegistrations
      )
      let percentage
      if (difference > 0) {
         percentage = (difference / (lastTwoMonthsRegistrations || 1)) * 100
      } else {
         percentage = (difference / (lastMonthsRegistrations || 1)) * 100
      }
      return {
         positive,
         percentage: mustBeNumber(percentage, 0),
      }
   }

   const getTotalUniqueUsers = (streamsArray) => {
      const totalUsers = getTotalEmailsFromStreamsByProperty(
         streamsArray,
         "registeredUsers"
      )
      return getUniqueIds(totalUsers).length
   }

   const getTotalUniqueParticipants = (streamsArray) => {
      const totalUsers = getTotalEmailsFromStreamsByProperty(
         streamsArray,
         "participatingStudents"
      )
      return getUniqueIds(totalUsers).length
   }

   const getTotalUserDataSetCount = () => {
      return userDataSet?.length
   }

   // use Memo is great for optimizing expensive calculations, the value of the function call will be stored in memory
   // The function will only be re-called when the value(streamsFromTimeFrame) in the dependency array changes
   const isUni = currentUserDataSet.dataSet === "groupUniversityStudents"

   const totalRegistrations = useMemo(
      () => getTotalRegisteredUsers(streamsFromTimeFrameAndFuture),
      [streamsFromTimeFrameAndFuture]
   )

   const totalUniqueRegistrations = useMemo(
      () => getTotalUniqueUsers(streamsFromTimeFrameAndFuture),
      [streamsFromTimeFrameAndFuture]
   )

   const totalUniqueParticipatingStudents = useMemo(
      () => getTotalUniqueParticipants(streamsFromTimeFrameAndFuture),
      [streamsFromTimeFrameAndFuture]
   )

   const averageRegistrations = useMemo(
      () => getAverageRegistrationsPerEvent(),
      [streamsFromTimeFrameAndFuture]
   )

   const registrationsStatus = useMemo(
      () => compareRegistrations(),
      [streamsFromTimeFrameAndFuture, streamsFromBeforeTimeFrame]
   )
   const uniqueRegistrationsStatus = useMemo(
      () => compareUniqueRegistrations("registeredUsers"),
      [streamsFromTimeFrameAndFuture, streamsFromBeforeTimeFrame]
   )
   const uniqueParticipationStatus = useMemo(
      () => compareUniqueRegistrations("participatingStudents"),
      [streamsFromTimeFrameAndFuture, streamsFromBeforeTimeFrame]
   )

   const getCategoryProps = () => ({
      item: true,
      xs: 12,
      sm: 12,
      lg: 6,
      xl: 6,
   })
   return (
      <Container sx={styles.root} maxWidth={false}>
         <Grid container spacing={3}>
            <Grid xs={12} sm={12} md={7} lg={8} item>
               <Grid container spacing={3}>
                  <Tooltip
                     arrow
                     title={`This block displays the total number of registrations for all your events over the past ${globalTimeFrame.name}.`}
                  >
                     <Grid {...getCategoryProps()}>
                        <TotalRegistrations
                           fetchingStreams={loading}
                           registrationsStatus={registrationsStatus}
                           totalRegistrations={totalRegistrations}
                           timeFrames={globalTimeFrame.timeFrames}
                           globalTimeFrame={globalTimeFrame}
                           group={group}
                        />
                     </Grid>
                  </Tooltip>
                  <Tooltip
                     arrow
                     title={`This block displays the total number of individual users who registered to your events over the past ${globalTimeFrame.name}.`}
                  >
                     <Grid {...getCategoryProps()}>
                        <TotalUniqueRegistrations
                           fetchingStreams={loading}
                           uniqueRegistrationsStatus={uniqueRegistrationsStatus}
                           totalUniqueRegistrations={totalUniqueRegistrations}
                           timeFrames={globalTimeFrame.timeFrames}
                           globalTimeFrame={globalTimeFrame}
                           group={group}
                        />
                     </Grid>
                  </Tooltip>
                  <Tooltip
                     arrow
                     title={`This block displays the average number of registrations per event over the past ${globalTimeFrame.name}.`}
                  >
                     <Grid {...getCategoryProps()}>
                        <AverageRegistrations
                           fetchingStreams={loading}
                           averageRegistrations={averageRegistrations}
                           timeFrames={globalTimeFrame.timeFrames}
                           group={group}
                        />
                     </Grid>
                  </Tooltip>
                  <Tooltip
                     arrow
                     title={
                        isUni
                           ? `This block displays the total number of students from ${group.universityName} on CareerFairy.`
                           : `This block displays the total number of individual users who registered or attended your events over the past ${globalTimeFrame.name}.`
                     }
                  >
                     <Grid {...getCategoryProps()}>
                        <UserCount
                           fetching={loading}
                           totalUsers={getTotalUserDataSetCount()}
                           timeFrames={globalTimeFrame.timeFrames}
                           currentUserDataSet={currentUserDataSet}
                           group={group}
                        />
                     </Grid>
                  </Tooltip>
                  {mediumScreen && !group.universityCode && (
                     <Tooltip
                        arrow
                        title={`This block displays the total number of individual users who watched your events over the past ${globalTimeFrame.name}.`}
                     >
                        <Grid item xs={12} md={12} sm={12}>
                           <TotalUniqueParticipatingStudents
                              fetchingStreams={loading}
                              totalUniqueParticipatingStudents={
                                 totalUniqueParticipatingStudents
                              }
                              uniqueParticipationStatus={
                                 uniqueParticipationStatus
                              }
                              timeFrames={globalTimeFrame.timeFrames}
                              globalTimeFrame={globalTimeFrame}
                              group={group}
                           />
                        </Grid>
                     </Tooltip>
                  )}

                  <Grid item xs={12}>
                     <LatestEvents
                        timeFrames={globalTimeFrame.timeFrames}
                        setCurrentStream={setCurrentStream}
                        fetchingStreams={loading}
                        currentStream={currentStream}
                        futureStreams={futureStreams}
                        streamsFromTimeFrame={streamsFromTimeFrame}
                        userType={userType}
                        userTypes={userTypes}
                        handleScrollToBreakdown={handleScrollToBreakdown}
                        handleToggleBar={handleToggleBar}
                        showBar={showBar}
                        setUserType={setUserType}
                        group={group}
                     />
                  </Grid>
               </Grid>
            </Grid>
            <Grid xs={12} sm={12} md={5} lg={4} item>
               <Grid container spacing={3}>
                  {!mediumScreen && !group.universityCode && (
                     <Tooltip
                        arrow
                        title={`This block displays the total number of individual users who watched your events over the past ${globalTimeFrame.name}.`}
                     >
                        <Grid xs={12} item>
                           <TotalUniqueParticipatingStudents
                              fetchingStreams={loading}
                              totalUniqueParticipatingStudents={
                                 totalUniqueParticipatingStudents
                              }
                              uniqueParticipationStatus={
                                 uniqueParticipationStatus
                              }
                              timeFrames={globalTimeFrame.timeFrames}
                              globalTimeFrame={globalTimeFrame}
                              group={group}
                           />
                        </Grid>
                     </Tooltip>
                  )}
                  <Grid item xs={12}>
                     <CategoryBreakdown
                        currentStream={currentStream}
                        breakdownRef={breakdownRef}
                        localUserType={localUserType}
                        currentUserDataSet={currentUserDataSet}
                        setLocalUserType={setLocalUserType}
                        userTypes={userTypes}
                        streamsFromTimeFrameAndFuture={
                           streamsFromTimeFrameAndFuture
                        }
                        handleReset={handleReset}
                        group={group}
                     />
                  </Grid>
               </Grid>
            </Grid>
         </Grid>
      </Container>
   )
}

export default General

import React, { useEffect, useMemo, useState } from "react"
import {
   collectionGroup,
   query,
   QueryConstraint,
   where,
} from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { useFirestoreCollection } from "../../../../../../custom-hook/utils/useFirestoreCollection"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { useAnalyticsPageContext } from "../GeneralPageProvider"

const styles = sxStyles({
   root: {
      display: "flex",
      flex: 1,
   },
})
const GeneralSearchFilter = () => {
   const { group } = useGroup()

   const { setLivestreamStats } = useAnalyticsPageContext()

   const [livestreamStatsTimeFrame, setLivestreamStatsTimeFrame] =
      useState<TimeFrame>("Last 2 years")

   const livestreamStatsQuery = useMemo(() => {
      const timeFrame = TimeFrames[livestreamStatsTimeFrame]

      const constraints: QueryConstraint[] = [
         where("id", "==", "livestreamStats"),
         where("livestream.groupIds", "array-contains", group.id),
         where("livestream.start", ">=", timeFrame.start),
      ]

      if (timeFrame.end) {
         constraints.unshift(where("livestream.start", "<=", timeFrame.end))
      }

      return query(collectionGroup(FirestoreInstance, "stats"), ...constraints)
   }, [group.id, livestreamStatsTimeFrame])

   const { data: livestreamStats } = useFirestoreCollection<LiveStreamStats>(
      livestreamStatsQuery,
      queryOptions
   )

   const searchLivestreamsQuery = useMemo(() => {
      const timeFrame = TimeFrames[livestreamStatsTimeFrame]

      const constraints: QueryConstraint[] = [
         where("groupIds", "array-contains", group.id),
         where("start", ">=", timeFrame.start),
      ]

      if (timeFrame.end) {
         constraints.unshift(where("start", "<=", timeFrame.end))
      }
      return query(collection(FirestoreInstance, "livestreams"), ...constraints)
   }, [group.id, livestreamStatsTimeFrame])

   const { data: livestreams } = useFirestoreCollection<LivestreamEvent>(
       searchLivestreamsQuery
   )

   console.log("-> livestreams", livestreams)

   useEffect(() => {
      setLivestreamStats(livestreamStats)
   }, [livestreamStats, setLivestreamStats])

   return (
       <Card sx={styles.root}>
          <MultiListSelect
              inputName={"search-livestreams"}
              selectedItems={[]}
              allValues={[]}
          />
          <TextField
              id="select-timeframe"
              select
              label="Select Timeframe"
              helperText="Please select a timeframe"
              value={livestreamStatsTimeFrame}
              variant="filled"
              onChange={(e) => {
                 setLivestreamStatsTimeFrame(e.target.value as TimeFrame)
              }}
          >
             {Object.keys(TimeFrames).map((timeframe) => (
                 <MenuItem key={timeframe} value={timeframe}>
                    {timeframe}
                 </MenuItem>
             ))}
          </TextField>
       </Card>
   )
}

export const TimeFrames = {
   "Last 30 days": {
      start: new Date(new Date().setDate(new Date().getDate() - 30)),
      end: null, // null means we don't care about the end date
   },
   "Last 6 months": {
      start: new Date(new Date().setDate(new Date().getDate() - 180)),
      end: null,
   },
   "Last 1 year": {
      start: new Date(new Date().setDate(new Date().getDate() - 365)),
      end: null,
   },
   "Last 2 years": {
      start: new Date(new Date().setDate(new Date().getDate() - 730)),
      end: null,
   },
   "All time": {
      start: new Date(0),
      end: null,
   },
} as const

const queryOptions = {
   idField: "id",
   suspense: false,
} as const

export type TimeFrame = keyof typeof TimeFrames

export default GeneralSearchFilter

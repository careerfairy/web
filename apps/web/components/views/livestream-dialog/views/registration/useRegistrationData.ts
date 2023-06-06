import { Group } from "@careerfairy/shared-lib/src/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/src/livestreams"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import { isFromNewsletter } from "../../../../../util/PathUtils"
import { getRelevantHosts } from "../../../../../util/streamUtil"

/**
 * Fetches required data to start the Livestream Registration process
 */
export default function useRegistrationData(stream: LivestreamEvent) {
   const { listenToCareerCenterById, getDetailLivestreamCareerCenters } =
      useFirebaseService()

   const { query } = useRouter()
   const [filteredGroups, setFilteredGroups] = useState<Group[]>([])
   const [unfilteredGroups, setUnfilteredGroups] = useState<Group[]>([])
   const [currentGroup, setCurrentGroup] = useState<Group>(null)
   const [targetGroupId, setTargetGroupId] = useState("")

   useEffect(() => {
      if (query.groupId) {
         const unsubscribe = listenToCareerCenterById(
            query.groupId,
            (querySnapshot) => {
               setCurrentGroup({
                  ...querySnapshot.data(),
                  id: querySnapshot.id,
               })
            }
         )
         return () => unsubscribe()
      }
   }, [listenToCareerCenterById, query.groupId])

   useEffect(() => {
      if (stream?.groupIds?.length) {
         getDetailLivestreamCareerCenters(stream.groupIds).then(
            (querySnapshot) => {
               const groupList = querySnapshot.docs.map((doc) => doc.data())
               const filteredHosts = getRelevantHosts(
                  currentGroup?.groupId,
                  stream,
                  groupList
               )
               setTargetGroupId(
                  filteredHosts.length === 1 ? filteredHosts[0].id : ""
               )
               setFilteredGroups(filteredHosts)
               setUnfilteredGroups(groupList)
            }
         )
      }
   }, [
      stream?.groupIds,
      currentGroup?.groupId,
      stream,
      getDetailLivestreamCareerCenters,
   ])

   /**
    * Mark this event registration as recommended if the user came from the
    * careerfairy newsletter
    */
   const isRecommended = isFromNewsletter(query)

   return useMemo(
      () => ({
         filteredGroups,
         unfilteredGroups,
         currentGroup,
         targetGroupId,
         isRecommended,
         isLoadingGroups: filteredGroups.length === 0,
      }),
      [
         currentGroup,
         filteredGroups,
         isRecommended,
         targetGroupId,
         unfilteredGroups,
      ]
   )
}

import { Group } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { limit } from "@firebase/firestore"
import { collection, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { FirestoreInstance } from "../../data/firebase/FirebaseInstance"
import useGroupCreators from "./creator/useGroupCreators"
import useFeatureFlags from "./useFeatureFlags"
import { useFirestoreCollection } from "./utils/useFirestoreCollection"

/*
 * Returns the company page progress for a group
 * if null, the progress is still loading as we need to check if the group has livestreams
 * */
const useGroupCompanyPageProgress = (group: Group): Progress | null => {
   const featureFlags = useFeatureFlags()

   const groupHasLivestreamsQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "livestreams"),
         where("groupIds", "array-contains", group.id),
         limit(1)
      )
   }, [group.id])

   const { data: livestreamsData } = useFirestoreCollection(
      groupHasLivestreamsQuery,
      {
         suspense: false,
         idField: "id",
      }
   )

   const { data: creators } = useGroupCreators(group?.id)

   return useMemo(() => {
      if (!livestreamsData) return null // still loading

      const presenter = GroupPresenter.createFromDocument(group)
      presenter.setHasLivestream(livestreamsData.length > 0) // set the hasLivestream flag
      presenter.setHasMentor(creators.length > 0) // set the hasMentor flag
      presenter.setFeatureFlags(featureFlags)

      return presenter.getCompanyPageProgress()
   }, [livestreamsData, creators, featureFlags, group])
}

type Progress = ReturnType<GroupPresenter["getCompanyPageProgress"]>

export default useGroupCompanyPageProgress

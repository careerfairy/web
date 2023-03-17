import { useMemo } from "react"
import { Group } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { collection, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../data/firebase/FirebaseInstance"
import { limit } from "@firebase/firestore"
import { useFirestoreCollection } from "./utils/useFirestoreCollection"

/*
 * Returns the company page progress for a group
 * if null, the progress is still loading
 *
 * */
const useGroupCompanyPageProgress = (group: Group): Progress | null => {
   const groupHasLivestreamsQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "livestreams"),
         where("groupIds", "array-contains", group.id),
         limit(1)
      )
   }, [group.id])

   const { data } = useFirestoreCollection(groupHasLivestreamsQuery, {
      suspense: false,
      idField: "id",
   })
   return useMemo(() => {
      if (!data) return null

      const presenter = GroupPresenter.createFromDocument(group)
      presenter.setHasLivestream(data.length > 0)
      return presenter.getCompanyPageProgress()
   }, [data, group])
}

type Progress = ReturnType<GroupPresenter["getCompanyPageProgress"]>

export default useGroupCompanyPageProgress

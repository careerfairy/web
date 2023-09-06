import { collection, query } from "firebase/firestore"
import { useMemo } from "react"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"
import { fromSerializedDate } from "@careerfairy/shared-lib/BaseModel"

const useUserSparksNotifications = (userId = "userId") => {
   const sparkNotificationsQuery = useMemo(
      () =>
         query(
            collection(
               FirestoreInstance,
               "userData",
               userId,
               "sparksNotifications"
            )
         ),
      [userId]
   )

   const { data } = useFirestoreCollection<UserSparksNotification>(
      sparkNotificationsQuery,
      {
         idField: "id",
         suspense: false,
      }
   )

   const sparksNotifications = data?.map((notifications) => ({
      ...notifications,
      startDate: fromSerializedDate(notifications.startDate),
   }))

   return { data: sparksNotifications }
}

export default useUserSparksNotifications

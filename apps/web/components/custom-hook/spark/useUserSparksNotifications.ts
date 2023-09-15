import { collection, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"
import { toDate } from "@careerfairy/shared-lib/firebaseTypes"

/**
 * Custom hook to fetch user spark notifications
 * @param userId - Identifier of the user
 * @param [groupId] - Identifier of the group (optional)
 */

const useUserSparksNotifications = (userId: string, groupId?: string) => {
   const sparkNotificationsQuery = useMemo(() => {
      return userId
         ? query(
              collection(
                 FirestoreInstance,
                 "userData",
                 userId || "userId", // to not break when there is no user
                 "sparksNotifications"
              ),
              ...(groupId ? [where("groupId", "==", groupId)] : [])
           )
         : null
   }, [groupId, userId])

   const { data } = useFirestoreCollection<UserSparksNotification>(
      sparkNotificationsQuery,
      {
         idField: "id",
         suspense: false,
      }
   )

   return useMemo(() => {
      const sparksNotifications = data?.map((notification) => ({
         ...notification,
         startDate: toDate(notification.startDate),
      }))

      return { data: sparksNotifications }
   }, [data])
}

export default useUserSparksNotifications

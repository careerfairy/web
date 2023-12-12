import {
   collection,
   orderBy,
   query,
   serverTimestamp,
   startAt,
   where,
} from "firebase/firestore"
import { useMemo } from "react"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"
import { toDate } from "@careerfairy/shared-lib/firebaseTypes"

const getUserSparkNotifications = (userId: string, groupId?: string) => {
   return query(
      collection(FirestoreInstance, "userData", userId, "sparksNotifications"),
      ...(groupId ? [where("groupId", "==", groupId)] : []),
      where("startDate", ">", new Date())
   )
}

const getPublicSparkNotifications = (groupId?: string) => {
   return query(
      collection(FirestoreInstance, "publicSparksNotifications"),
      ...(groupId ? [where("id", "==", groupId)] : []),
      where("startDate", ">", new Date())
   )
}

/**
 * Custom hook to fetch user spark notifications
 * @param userId - Identifier of the user
 * @param [groupId] - Identifier of the group (optional)
 */
const useUserSparksNotifications = (userId: string, groupId?: string) => {
   const sparkNotificationsQuery = useMemo(() => {
      return userId
         ? getUserSparkNotifications(userId, groupId)
         : getPublicSparkNotifications(groupId)
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

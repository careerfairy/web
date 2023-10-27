import { collection, orderBy, query } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { useFirestoreCollection } from "./utils/useFirestoreCollection"
import { UserNotification } from "@careerfairy/shared-lib/users/userNotifications"

/**
 * Fetch User Notifications
 * from /userData/{userEmail}/UserNotifications
 *
 * @param userId
 */
const useUserNotifications = (userId: string) => {
   const collectionRef = query(
      collection(useFirestore(), "userData", userId, "userNotifications"),
      orderBy("createdAt", "desc")
   )

   const { data } = useFirestoreCollection<UserNotification>(collectionRef)

   return data
}

export default useUserNotifications

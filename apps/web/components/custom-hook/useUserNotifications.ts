import { collection } from "firebase/firestore"
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
   const collectionRef = collection(
      useFirestore(),
      "userData",
      userId,
      "userNotifications"
   )

   const { data } = useFirestoreCollection<UserNotification>(collectionRef)

   return data
}

export default useUserNotifications

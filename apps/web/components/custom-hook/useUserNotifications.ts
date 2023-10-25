import { collection } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { useFirestoreCollection } from "./utils/useFirestoreCollection"
import { useMemo } from "react"
import {
   pickPublicDataFromUserNotification,
   UserNotification,
} from "@careerfairy/shared-lib/users/userNotifications"

const useUserNotifications = (userId: string) => {
   const collectionRef = collection(
      useFirestore(),
      "userData",
      userId,
      "userNotifications"
   )

   const { data } = useFirestoreCollection<UserNotification>(collectionRef, {
      idField: "id", // this field will be added to the firestore object
   })

   return useMemo(
      () =>
         data.map((document) => pickPublicDataFromUserNotification(document)),
      [data]
   )
}

export default useUserNotifications

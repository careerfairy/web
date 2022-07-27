import React, { useMemo } from "react"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import firebase from "firebase"

/**
 * Gets the firestore document reference either for a normal livestream.
 * @return {({
 * id: string,
 * collection: function,
 * get: function,
 * update: function,
 * delete: function,
 * path: string
 * })} - firestore document reference
 */
const useStreamRef = () => {
   const router = useRouter()
   const { getStreamRef } = useFirebaseService()
   return useMemo<firebase.firestore.DocumentReference>(
      () => getStreamRef(router),
      [router]
   )
}

export default useStreamRef

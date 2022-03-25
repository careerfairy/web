import React, { useMemo } from "react"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"

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
   return useMemo(() => getStreamRef(router), [router])
}

export default useStreamRef

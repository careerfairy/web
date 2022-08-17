import { useEffect, useState } from "react"
import { Identifiable } from "../../types/commonTypes"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import { Interest } from "types/interests"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import firebase from "firebase/compat/app"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"

/**
 * Fetch a Firestore collection
 *
 * We should migrate to something like ReactFire
 *
 * @param collection Name of the collection
 * @param realtime Listens for updates on the documents
 */
function useCollection<T extends Identifiable>(
   collection: string | GetReferenceFn | firebase.firestore.Query,
   realtime: boolean = false
): CollectionResponse<T> {
   const { firestore } = useFirebaseService()
   const [documents, setDocuments] = useState<T[]>([])
   const [isLoading, setLoading] = useState(true)
   const [error, setError] = useState(null)

   useEffect(() => {
      setLoading(true)

      try {
         let ref
         if (typeof collection === "string") {
            ref = firestore.collection(collection)
         } else if (typeof collection === "function") {
            ref = collection(firestore)
         } else {
            ref = collection
         }

         if (realtime) {
            return ref.onSnapshot(updateLocal)
         } else {
            ref.get().then(updateLocal)
         }
      } catch (e) {
         setLoading(false)
         setError(e)
      }

      function updateLocal(querySnapshot) {
         const list = []
         querySnapshot.forEach((doc) => {
            list.push({
               ...doc.data(),
               id: doc.id,
            })
         })
         setDocuments(list)
         setLoading(false)
      }
   }, [collection, realtime])

   return { isLoading: isLoading, data: documents, error: error }
}

type GetReferenceFn = (
   firestore: firebase.firestore.Firestore
) => firebase.firestore.Query

interface CollectionResponse<T> {
   isLoading: boolean
   data: T[]
   error: Error | null
}

export const useInterests = (realtime: boolean = false) =>
   useCollection<Interest>("interests", realtime)
export const useGroups = (realtime: boolean = false) =>
   useCollection<Group>("careerCenterData", realtime)

// use fields of Study
export const useFieldsOfStudy = (realtime: boolean = false) =>
   useCollection<FieldOfStudy>("fieldsOfStudy", realtime)
// use levels of Study
export const useLevelsOfStudy = (realtime: boolean = false) =>
   useCollection<FieldOfStudy>("levelsOfStudy", realtime)

export default useCollection

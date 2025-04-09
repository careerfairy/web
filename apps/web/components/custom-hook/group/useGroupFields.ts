import { Group } from "@careerfairy/shared-lib/groups"
import { doc, FirestoreDataConverter } from "firebase/firestore"
import { ReactFireOptions, useFirestore, useFirestoreDocData } from "reactfire"

/**
 * Custom hook to get specific fields from a group document
 * @param groupId - The ID of the group to fetch
 * @param fields - Array of field names to fetch from the group document
 * @param options - Optional ReactFire options
 * @returns A Group object with only the requested fields set
 */
const useGroupFields = <T extends keyof Group>(
   groupId: string,
   fields: T[],
   options?: ReactFireOptions
) => {
   const firestore = useFirestore()

   const converter: FirestoreDataConverter<Partial<Group>> = {
      toFirestore: (data: Partial<Group>) => data,
      fromFirestore: (snapshot) => {
         const data = snapshot.data()
         const result: Partial<Group> = { id: snapshot.id }

         fields.forEach((field) => {
            if (field in data) {
               result[field] = data[field]
            }
         })

         return result
      },
   }

   const docRef = doc(firestore, "careerCenterData", groupId).withConverter(
      converter
   )

   return useFirestoreDocData<Partial<Group>>(docRef, {
      idField: "id",
      ...options,
   })
}

export default useGroupFields

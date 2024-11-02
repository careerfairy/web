import { firebaseServiceInstance } from "data/firebase/FirebaseService"
import { useEffect, useState } from "react"

export const useRegisteredUsersPhoneNumbers = (livestreamId: string) => {
   const [phoneNumbers, setPhoneNumbers] = useState<string[]>([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<Error | null>(null)

   useEffect(() => {
      const fetchPhoneNumbers = async () => {
         try {
            const snapshot = await firebaseServiceInstance.firestore
               .collection("livestreams")
               .doc(livestreamId)
               .collection("userLivestreamData")
               .get()

            const numbers = snapshot.docs
               .map((doc) => doc.data()?.user.phoneNumber)
               .filter(Boolean)

            setPhoneNumbers(numbers)
            setLoading(false)
         } catch (err) {
            setError(err as Error)
            setLoading(false)
         }
      }

      fetchPhoneNumbers()
   }, [livestreamId])

   return { phoneNumbers, loading, error }
}

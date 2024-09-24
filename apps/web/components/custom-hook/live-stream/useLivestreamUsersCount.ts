import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { collection, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { SWRConfiguration } from "swr"
import useSWRCountQuery from "../useSWRCountQuery"

type UserType = keyof Pick<
   UserLivestreamData,
   "registered" | "talentPool" | "participated"
>

type Options = {
   disabled?: boolean
} & SWRConfiguration<number>

/**
 * Hook to fetch the count of users for a specific live stream based on user type.
 * @param {string} livestreamId - The ID of the live stream.
 * @param {UserType} userType - The type of user to count ('registered', 'talentPool', or 'participated').
 * @returns the count and loading state
 */
export const useLivestreamUsersCount = (
   livestreamId: string,
   userType: UserType,
   { disabled, ...options }: Options = {}
) => {
   const firestore = useFirestore()

   const userLivestreamDataRef = collection(
      firestore,
      "livestreams",
      livestreamId,
      "userLivestreamData"
   )

   const registeredUsersQuery = query(
      userLivestreamDataRef,
      where(`${userType}.date`, "!=", null)
   )

   return useSWRCountQuery(disabled ? null : registeredUsersQuery, {
      revalidateOnFocus: true, // revalidate when the user returns to the page to see the latest count
      ...options,
   })
}

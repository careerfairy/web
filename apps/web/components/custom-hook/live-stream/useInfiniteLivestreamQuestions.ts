import { useCallback, useMemo } from "react"
import { UsePaginatedCollection } from "../utils/usePaginatedCollection"
import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"
import {
   collection,
   query,
   orderBy as firebaseOrderBy,
} from "firebase/firestore"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import useInfiniteCollection, {
   InfiniteCollection,
   UseInfiniteCollection,
} from "../utils/useInfiniteCollection"
import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { useAuth } from "../../../HOCs/AuthProvider"
import FirebaseService from "../../../data/firebase/FirebaseService"

type UseInfiniteLivestreamQuestions = InfiniteCollection<LivestreamQuestion> & {
   handleClientToggleUpvoteQuestion: (
      question: LivestreamQuestion,
      status: Awaited<ReturnType<FirebaseService["upvoteLivestreamQuestion"]>>
   ) => void
}

type OrderBy = UsePaginatedCollection<LivestreamQuestion>["orderBy"]

interface Options {
   /**
    * The maximum number of items to return per page.
    * Defaults to 3.
    */
   limit?: number
   /**
    * The field to order the results by and the direction (asc or desc).
    * Defaults to "votes" in descending order.
    */
   orderBy?: OrderBy
}

/**
 * A hook that returns a paginated collection of livestream questions for a given livestream ID.
 * @param {string} livestreamId - The ID of the livestream to retrieve questions for.
 * @param {Options} options - An optional object of options to control pagination and ordering.
 * @param {number} options.limit - The maximum number of items to return per page. Defaults to 6.
 * @param {OrderBy} options.orderBy - The field to order the results by and the direction (asc or desc). Defaults to "votes" in descending order.
 * @returns {InfiniteCollection<LivestreamQuestion>} The paginated collection of questions.
 */
const useInfiniteLivestreamQuestions = (
   livestreamId: string,
   options: Options = {}
): UseInfiniteLivestreamQuestions => {
   const { authenticatedUser } = useAuth()
   const { limit = 3, orderBy = { field: "votes", direction: "desc" } } =
      options

   const memoizedOptions = useMemo<UseInfiniteCollection<LivestreamQuestion>>(
      () => ({
         query: query(
            collection(
               FirestoreInstance,
               "livestreams",
               livestreamId,
               "questions"
            ),
            firebaseOrderBy(orderBy.field, orderBy.direction)
         ).withConverter(createGenericConverter<LivestreamQuestion>()),
         limit,
         initialData: [],
      }),
      [livestreamId, orderBy.field, orderBy.direction, limit]
   )

   const queryData = useInfiniteCollection<LivestreamQuestion>(memoizedOptions)

   const handleClientToggleUpvoteQuestion = useCallback<
      UseInfiniteLivestreamQuestions["handleClientToggleUpvoteQuestion"]
   >(
      (question, status) => {
         if (!authenticatedUser?.email) return

         let updateData: Pick<LivestreamQuestion, "emailOfVoters" | "votes">
         const emailOfVoters = question.emailOfVoters || []

         switch (status) {
            case "upvoted":
               updateData = {
                  emailOfVoters: [
                     ...new Set([...emailOfVoters, authenticatedUser.email]),
                  ],
                  votes: question.votes + 1,
               }
               break
            case "downvoted":
               updateData = {
                  emailOfVoters: emailOfVoters.filter(
                     (email) => email !== authenticatedUser.email
                  ),
                  votes: question.votes - 1,
               }

               break
            default:
               throw new Error("Invalid status")
         }

         queryData.handleClientSideUpdate(question.id, updateData)
      },
      [authenticatedUser.email, queryData]
   )

   return useMemo(
      () => ({
         ...queryData,
         handleClientToggleUpvoteQuestion,
      }),
      [queryData, handleClientToggleUpvoteQuestion]
   )
}

export default useInfiniteLivestreamQuestions

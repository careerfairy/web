import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   LivestreamPoll,
   LivestreamPollVoter,
} from "@careerfairy/shared-lib/livestreams"
import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

export type PollWithVoters = LivestreamPoll & {
   votersData: LivestreamPollVoter[]
   totalVotes: number
}

/**
 * Fetches all polls for a livestream with their voters data.
 * @param pollRef - The poll reference
 * @returns The voters for the poll
 */
const fetchPollVoters = async (
   livestreamId: string,
   pollId: string
): Promise<LivestreamPollVoter[]> => {
   const votersRef = query(
      collection(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "polls",
         pollId,
         "voters"
      )
   ).withConverter(createGenericConverter<LivestreamPollVoter>())

   const votersSnap = await getDocs(votersRef)
   return votersSnap.docs.map((doc) => doc.data())
}

/**
 * Fetches all polls for a livestream with their voters data.
 * @param livestreamId - The ID of the livestream
 * @returns The polls with voters
 */
const fetchPollsWithVoters = async (
   livestreamId: string
): Promise<PollWithVoters[]> => {
   const pollsRef = query(
      collection(FirestoreInstance, "livestreams", livestreamId, "polls"),
      orderBy("timestamp", "desc")
   ).withConverter(createGenericConverter<LivestreamPoll>())

   const pollsSnap = await getDocs(pollsRef)
   const polls = pollsSnap.docs.map((doc) => doc.data())

   // Fetch voters for each poll in parallel
   const pollsWithVoters = await Promise.all(
      polls.map(async (poll) => {
         const votersData = await fetchPollVoters(livestreamId, poll.id)
         return {
            ...poll,
            votersData,
            totalVotes: votersData.length,
         }
      })
   )

   return pollsWithVoters
}

/**
 * Custom hook to fetch all livestream polls with their voters for admin overview.
 * Orders by timestamp descending.
 * @param livestreamId - The unique identifier for the live stream.
 */
export const useAllLivestreamPolls = (livestreamId: string | null) => {
   return useSWR(
      livestreamId ? ["livestreamPolls", livestreamId] : null,
      () => fetchPollsWithVoters(livestreamId!),
      {
         ...reducedRemoteCallsOptions,
         suspense: false,
         onError: (err) => {
            errorLogAndNotify(err, {
               message: "Error in useAllLivestreamPolls",
               livestreamId,
            })
         },
      }
   )
}

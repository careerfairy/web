import { FC } from "react"
import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { collection, orderBy, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { useFirestoreCollection } from "../../../../../../custom-hook/utils/useFirestoreCollection"
import useCountQuery from "../../../../../../custom-hook/useCountQuery"
import {
   CardVotes,
   CardVotesOption,
   SectionContainer,
   VoteOptionSkeleton,
} from "./CardVotes"

type PollsProps = {
   livestreamStats: LiveStreamStats
}

const Polls: FC<PollsProps> = ({ livestreamStats }) => {
   const { data: polls, status } = useLivestreamPolls(
      livestreamStats.livestream.id
   )

   if (status !== "loading" && polls.length === 0) return null

   return (
      <SectionContainer title="Polls during live stream">
         {polls.map((poll) => (
            <PollEntry
               key={poll.id}
               poll={poll}
               livestreamId={livestreamStats.livestream.id}
            />
         ))}
      </SectionContainer>
   )
}

type PollEntryProps = {
   poll: LivestreamPoll
   livestreamId: string
}

const PollEntry: FC<PollEntryProps> = ({ poll, livestreamId }) => {
   const { count, loading } = usePollVotersCount(livestreamId, poll.id)

   if (loading) {
      return <VoteOptionSkeleton />
   }

   if (count === 0) return null // no votes, so don't show

   return (
      <CardVotes
         title={poll.question}
         totalVotes={loading ? "..." : count || 0}
      >
         {poll.options.map((option) => (
            <PollOption
               key={option.id}
               pollOption={option}
               pollId={poll.id}
               livestreamId={livestreamId}
               totalVotes={count ?? 0}
            />
         ))}
      </CardVotes>
   )
}

type PollOptionProps = {
   livestreamId: string
   pollId: string
   pollOption: LivestreamPoll["options"][number]
   totalVotes: number
}

const PollOption: FC<PollOptionProps> = ({
   pollOption,
   pollId,
   livestreamId,
   totalVotes,
}) => {
   const { count } = usePollVotersCount(livestreamId, pollId, pollOption.id)

   return (
      <CardVotesOption
         count={count}
         title={pollOption.text}
         total={totalVotes}
      />
   )
}

const useLivestreamPolls = (livestreamId: string) => {
   return useFirestoreCollection<LivestreamPoll>(
      query(
         collection(FirestoreInstance, "livestreams", livestreamId, "polls"),
         where("state", "!=", "upcoming"),
         orderBy("state", "asc")
      ),
      {
         idField: "id",
      }
   )
}

const usePollVotersCount = (
   livestreamId: string,
   pollId: string,
   optionId?: string
) => {
   return useCountQuery(
      query(
         collection(
            FirestoreInstance,
            "livestreams",
            livestreamId,
            "polls",
            pollId,
            "voters"
         ),
         optionId ? where("optionId", "==", optionId) : undefined
      )
   )
}

export default Polls

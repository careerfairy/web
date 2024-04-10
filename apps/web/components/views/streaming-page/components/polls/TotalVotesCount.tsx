import useSWRCountQuery from "components/custom-hook/useSWRCountQuery"
import { collection, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { useStreamingContext } from "../../context"
import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { Skeleton, Typography } from "@mui/material"

const useTotalVoteCount = (
   livestreamId: string,
   pollId: string,
   optionsIds: string[]
) => {
   const firestore = useFirestore()

   return useSWRCountQuery(
      query(
         collection(
            firestore,
            "livestreams",
            livestreamId,
            "polls",
            pollId,
            "voters"
         ),
         optionsIds ? where("optionId", "in", optionsIds) : undefined
      ),
      {
         revalidateOnFocus: false,
      }
   )
}

type Props = {
   poll: LivestreamPoll
}

export const TotalVotesCount = ({ poll }: Props) => {
   const { livestreamId } = useStreamingContext()

   const optionsIds = poll.options?.map((option) => option.id)

   const { data: count, isLoading } = useTotalVoteCount(
      livestreamId,
      poll.id,
      optionsIds
   )

   return (
      <Typography variant="xsmall" color="neutral.200">
         {isLoading ? <Skeleton width={40} variant="text" /> : `${count} votes`}
      </Typography>
   )
}

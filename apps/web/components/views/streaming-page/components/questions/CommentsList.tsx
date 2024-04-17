import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"

type Props = {
   question: LivestreamQuestion
}
export const CommentsList = ({ question }: Props) => {
   return <div>{JSON.stringify(question)}</div>
}

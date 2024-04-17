import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"

type Props = {
   question: LivestreamQuestion
}
export const QuestionComments = ({ question }: Props) => {
   return <div>{JSON.stringify(question)}</div>
}

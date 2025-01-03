import { QuizModelType } from "data/hygraph/types"
import { QuizCard } from "./QuizCard"

type Props = QuizModelType

export const QuizBlock = (props: Props) => {
   return <QuizCard {...props} />
}

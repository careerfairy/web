import { ReactNode, createContext, useContext, useMemo, useState } from "react"
import { QuestionOptionsMenu } from "./QuestionOptionsMenu"
import { CommentOptionsMenu } from "./CommentOptionsMenu"
import {
   LivestreamQuestion,
   LivestreamQuestionComment,
} from "@careerfairy/shared-lib/livestreams"

export type QuestionMenuProps = {
   question: LivestreamQuestion
   anchorEl: HTMLElement
}

export type CommentMenuProps = {
   comment: LivestreamQuestionComment
   questionId: string
   anchorEl: HTMLElement
}

type QuestionsListContextType = {
   questionMenuProps: QuestionMenuProps | null
   commentMenuProps: CommentMenuProps
   onCommentOptionsClick: (
      event: React.MouseEvent<HTMLElement>,
      questionId: string,
      comment: LivestreamQuestionComment
   ) => void
   onQuestionOptionsClick: (
      event: React.MouseEvent<HTMLElement>,
      question: LivestreamQuestion
   ) => void
}

const QuestionsListContext = createContext<QuestionsListContextType | null>(
   null
)

type Props = {
   children: ReactNode
}

const QuestionsListContextProvider = ({ children }: Props) => {
   const [questionMenuProps, setQuestionMenuProps] =
      useState<QuestionMenuProps | null>(null)
   const [commentMenuProps, setCommentMenuProps] =
      useState<CommentMenuProps | null>(null)

   const value = useMemo<QuestionsListContextType>(
      () => ({
         questionMenuProps,
         commentMenuProps,
         onCommentOptionsClick: (
            event: React.MouseEvent<HTMLElement>,
            questionId: string,
            comment: LivestreamQuestionComment
         ) => {
            setCommentMenuProps({
               questionId,
               comment,
               anchorEl: event.currentTarget,
            })
         },
         onQuestionOptionsClick: (
            event: React.MouseEvent<HTMLElement>,
            question: LivestreamQuestion
         ) => {
            setQuestionMenuProps({
               question,
               anchorEl: event.currentTarget,
            })
         },
      }),
      [
         questionMenuProps,
         setQuestionMenuProps,
         commentMenuProps,
         setCommentMenuProps,
      ]
   )

   return (
      <QuestionsListContext.Provider value={value}>
         {children}
         <QuestionOptionsMenu
            handleClose={() => setQuestionMenuProps(null)}
            question={questionMenuProps?.question}
            anchorEl={questionMenuProps?.anchorEl}
         />
         <CommentOptionsMenu
            handleClose={() => setCommentMenuProps(null)}
            comment={commentMenuProps?.comment}
            questionId={commentMenuProps?.questionId}
            anchorEl={commentMenuProps?.anchorEl}
         />
      </QuestionsListContext.Provider>
   )
}

export const useQuestionsListContext = () => {
   const context = useContext(QuestionsListContext)
   if (!context) {
      throw new Error(
         "useQuestionsListContext must be used within a QuestionsListContextProvider"
      )
   }
   return context
}

export default QuestionsListContextProvider

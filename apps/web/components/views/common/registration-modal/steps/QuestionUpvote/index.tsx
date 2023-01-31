import React, { useContext, useEffect, useState } from "react"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import {
   Box,
   Button,
   Collapse,
   DialogActions,
   DialogContent,
   DialogTitle,
   Hidden,
   useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { RegistrationContext } from "context/registration/RegistrationContext"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import { useRouter } from "next/router"
import GroupLogo from "../../common/GroupLogo"
import QuestionVotingContainer from "../../../QuestionVotingContainer"
import { recommendationServiceInstance } from "data/firebase/RecommendationService"

const questionsContainerHeight = 400
const mobileQuestionsContainerHeight = 300
const useStyles = makeStyles((theme) => ({
   root: {},
   actions: {
      display: "flex",
      flexFlow: "column",
      alignItems: "center",
   },
   content: {
      padding: theme.spacing(1),
   },
}))

const QuestionUpvote = () => {
   const {
      handleNext,
      livestream,
      hasMore,
      getMore,
      questions,
      handleClientSideQuestionUpdate,
      sliding,
      handleChangeQuestionSortType,
      questionSortType,
      loadingInitialQuestions,
   } = useContext(RegistrationContext)
   const classes = useStyles()
   const [show, setShow] = useState(false)
   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down("sm"))
   const containerHeight = mobile
      ? mobileQuestionsContainerHeight
      : questionsContainerHeight

   useEffect(() => {
      const timeout = setTimeout(() => {
         setShow(true)
      }, 300)

      return () => clearTimeout(timeout)
   }, [show])
   const { upvoteLivestreamQuestion } = useFirebaseService()

   const { push } = useRouter()
   const { authenticatedUser, userData } = useAuth()

   const handleUpvote = async (question) => {
      if (!authenticatedUser) {
         return push("/signup")
      }
      try {
         await upvoteLivestreamQuestion(
            livestream.id,
            question,
            authenticatedUser.email
         )

         recommendationServiceInstance.upvoteQuestion(livestream, userData)

         handleClientSideQuestionUpdate(question.id, {
            votes: question.votes + 1 || 1,
            emailOfVoters: question.emailOfVoters?.concat(
               authenticatedUser.email
            ) || [authenticatedUser.email],
         })
      } catch (e) {}
   }

   function hasVoted(question) {
      if (!authenticatedUser || !question.emailOfVoters) {
         return false
      }
      return question.emailOfVoters.indexOf(authenticatedUser.email) > -1
   }

   if (!livestream) return null

   return (
      <div className={classes.root}>
         <Box width="100%" display="flex" justifyContent="center">
            <Hidden smDown>
               <GroupLogo logoUrl={livestream.companyLogoUrl} />
            </Hidden>
         </Box>
         <DialogTitle
            // @ts-ignore
            align="center"
         >
            WHICH QUESTIONS SHOULD THE SPEAKER ANSWER?
         </DialogTitle>
         <DialogContent className={classes.content}>
            <Collapse in={Boolean(questions.length && !sliding && show)}>
               {/* @ts-ignore */}
               <QuestionVotingContainer
                  questions={questions}
                  handleChangeQuestionSortType={handleChangeQuestionSortType}
                  questionSortType={questionSortType}
                  headerButton={
                     <Hidden mdUp>
                        <Button
                           variant="contained"
                           onClick={handleNext}
                           color="primary"
                        >
                           Next
                        </Button>
                     </Hidden>
                  }
                  containerHeight={containerHeight}
                  getMore={getMore}
                  handleUpvote={handleUpvote}
                  hasMore={hasMore}
                  hasVoted={hasVoted}
                  loadingInitialQuestions={loadingInitialQuestions}
               />
            </Collapse>
            <Hidden mdDown>
               <DialogActions>
                  <Button
                     variant="contained"
                     size="large"
                     onClick={handleNext}
                     color="primary"
                     autoFocus
                  >
                     Next
                  </Button>
               </DialogActions>
            </Hidden>
         </DialogContent>
      </div>
   )
}

export default QuestionUpvote

import React, {
   KeyboardEventHandler,
   memo,
   useCallback,
   useContext,
   useEffect,
   useState,
} from "react"
import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded"
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded"
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import {
   Box,
   Button,
   Card,
   CircularProgress,
   Collapse,
   IconButton,
   Paper,
   Slide,
   TextField,
   Typography,
} from "@mui/material"
import { PlayIconButton } from "materialUI/GlobalButtons/GlobalButtons"
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "materialUI/GlobalTooltips"
import TutorialContext from "context/tutorials/TutorialContext"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import useStreamRef from "../../../../custom-hook/useStreamRef"
import {
   CurrentStreamContextInterface,
   useCurrentStream,
} from "../../../../../context/stream/StreamContext"
import BadgeButton from "../../../common/BadgeButton"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import LinkifyText from "../../../../util/LinkifyText"
import { LivestreamQuestion } from "@careerfairy/shared-lib/dist/livestreams"
import { sxStyles } from "../../../../../types/commonTypes"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import Stack from "@mui/material/Stack"
import { containsBadgeOrLevelsAbove } from "@careerfairy/shared-lib/dist/users/UserBadges"

const styles = sxStyles({
   chatInput: {
      background: "background.paper",
      borderRadius: 2,
      "& .MuiInputBase-root": {
         color: "text.primary",
         paddingRight: "0 !important",
         borderRadius: 2,
      },
   },
   chatInputActive: {
      background: "white",
      "& .MuiInputBase-root": {
         color: "black !important",
      },
   },
   questionContainer: {
      backgroundColor: (theme) =>
         theme.palette.mode === "light"
            ? "background.default"
            : "background.paper",
      color: "inherit",
      position: "relative",
      padding: "20px 0 0 0",
      margin: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      borderRadius: 2,
   },
   questionContainerActive: {
      backgroundColor: "primary.main",
      color: "common.white",
   },
   reactionsQuestion: {
      fontWeight: 700,
      fontSize: "1.3em",
      lineHeight: "1.3em",
      color: "text.primary",
      margin: "5px 0",
      width: "85%",
      wordBreak: "break-word",
   },
   reactionsQuestionActive: {
      color: "white",
   },
   reactionsToggle: {
      textTransform: "uppercase",
      cursor: "pointer",
      color: "rgb(210,210,210)",
      display: "flex",
      alignItems: "center",
   },
   showText: {
      color: "text.secondary",
      fontSize: "0.8em",
      fontWeight: 500,
   },
   showTextActive: {
      color: "rgb(200,200,200)",
   },
   topContainer: {
      top: 0,
      left: 0,
      right: 0,
      px: "20px",
      pt: "10px",
      position: "absolute",
   },
   deleteButton: {
      marginLeft: "auto !important",
   },
   upVotes: {
      fontSize: "1.2em",
      display: "inline-block",
      fontWeight: 700,
      color: "primary.main",
   },
   upVotesActive: {
      color: "white",
   },
   badge: {
      fontSize: "1.2em",
      display: "inline-block",
      fontWeight: 700,
      color: "primary.main",
   },
   badgeActive: {
      color: "white",
   },
   questionComment: {
      background: (theme) =>
         theme.palette.mode === "dark"
            ? "background.default"
            : "background.paper",
      color: "text.primary",
   },
   questionCommentActive: {
      background: "common.white",
      color: "text.primary",
   },
   questionButton: {
      borderRadius: "0 0 5px 5px",
      padding: "10px 0",
      color: "common.white",
   },
})

type ReactionsToggleProps = {
   active: boolean
   handleToggle: () => void
   showAllReactions: boolean
   loading: boolean
}
const ReactionsToggle = ({
   handleToggle,
   showAllReactions,
   loading,
   active,
}: ReactionsToggleProps) => {
   return loading ? (
      <CircularProgress />
   ) : (
      <Box sx={styles.reactionsToggle} onClick={handleToggle}>
         {showAllReactions ? (
            <ExpandLessRoundedIcon
               style={{ marginRight: "3px", fontSize: "1.8em" }}
            />
         ) : (
            <ExpandMoreRoundedIcon
               style={{ marginRight: "3px", fontSize: "1.8em" }}
            />
         )}
         <Typography sx={[styles.showText, active && styles.showTextActive]}>
            {showAllReactions ? "Hide" : "Show all reactions"}
         </Typography>
      </Box>
   )
}

type QuestionContainerProps = {
   sessionUuid: string
   sliding: boolean
   streamer: boolean
   question: LivestreamQuestion
   index: number
   isNextQuestions: boolean
   selectedState: CurrentStreamContextInterface["selectedState"]
   goToThisQuestion: (questionId: string) => Promise<void>
   setOpenQuestionId: React.Dispatch<React.SetStateAction<string>>
   openQuestionId: string
   showMenu: boolean
   setQuestionIdToDelete: React.Dispatch<React.SetStateAction<string>>
}

const QuestionContainer = ({
   sessionUuid,
   sliding,
   streamer,
   question,
   index,
   isNextQuestions,
   selectedState,
   goToThisQuestion,
   setOpenQuestionId,
   openQuestionId,
   showMenu,
   setQuestionIdToDelete,
}: QuestionContainerProps) => {
   const firebase = useFirebaseService()
   const streamRef = useStreamRef()
   const {
      currentLivestream: livestream,
      isBreakout,
      presenter,
   } = useCurrentStream()
   const [newCommentTitle, setNewCommentTitle] = useState("")
   const [comments, setComments] = useState([])
   const [showAllReactions, setShowAllReactions] = useState(false)
   const { authenticatedUser, userData, adminGroups } = useAuth()
   const { tutorialSteps, handleConfirmStep } = useContext(TutorialContext)
   const [loadingQuestions, setLoadingQuestions] = useState(false)
   const [disableComments, setDisableComments] = useState(false)

   const isEmpty =
      !newCommentTitle.trim() ||
      (!userData && !(livestream?.test || livestream.openStream))
   const active = question?.type === "current"
   const old = question?.type !== "new"
   const upvoted =
      (!userData && !livestream?.test) ||
      (question?.emailOfVoters
         ? question?.emailOfVoters.indexOf(
              livestream?.test || livestream?.openStream
                 ? "streamerEmail" + sessionUuid
                 : authenticatedUser.email
           ) > -1
         : false)

   const questionIsBeingAnswered = Boolean(
      question?.type === "current" && isNextQuestions
   )

   const canDeleteQuestion =
      Boolean(
         streamer ||
            userData?.userEmail === question?.author ||
            userData?.isAdmin ||
            presenter.isStreamAdmin(adminGroups)
      ) && !questionIsBeingAnswered

   useEffect(() => {
      if (livestream.id && question.id && showAllReactions) {
         setLoadingQuestions(true)
         const unsubscribe = firebase.listenToQuestionComments(
            streamRef,
            question.id,
            (querySnapshot) => {
               setComments(
                  querySnapshot.docs.map((doc) => ({
                     id: doc.id,
                     ...doc.data(),
                  }))
               )
               setLoadingQuestions(false)
            }
         )
         return () => unsubscribe()
      }
   }, [firebase, livestream.id, question.id, showAllReactions, streamRef])

   useEffect(() => {
      if (livestream.id && question.id && !showAllReactions) {
         if (question.firstComment) {
            setComments([question.firstComment])
         }
      }
   }, [livestream.id, question.firstComment, question.id, showAllReactions])

   const makeGloballyActive = useCallback(() => {
      setOpenQuestionId(question.id)
      setShowAllReactions(true)
   }, [question.id, setOpenQuestionId])

   useEffect(() => {
      if (active && !showAllReactions) {
         makeGloballyActive()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [active, question.type])

   async function addNewComment() {
      try {
         if (
            !newCommentTitle.trim() ||
            (!userData &&
               !(livestream?.test || livestream.openStream) &&
               !streamer)
         ) {
            return
         }

         setDisableComments(true)
         const newComment = streamer
            ? {
                 title: newCommentTitle,
                 author: "Streamer",
              }
            : {
                 title: newCommentTitle,
                 author: userData
                    ? userData.firstName + " " + userData.lastName.charAt(0)
                    : "anonymous",
              }

         if (isBreakout) {
            await firebase.putQuestionCommentWithTransaction(
               streamRef,
               question.id,
               newComment
            )
         } else {
            await firebase.putQuestionComment(
               streamRef,
               question.id,
               newComment
            )
         }

         setNewCommentTitle("")
         setDisableComments(false)
         makeGloballyActive()
      } catch (error) {
         console.error(error)
         setDisableComments(false)
      }
   }

   const addNewCommentOnEnter: KeyboardEventHandler = (target) => {
      if (target.key === "Enter") {
         addNewComment().then(() => handleConfirmStep(1))
      }
   }

   function upvoteLivestreamQuestion() {
      let authEmail =
         livestream.test || livestream.openStream
            ? "streamerEmail" + sessionUuid
            : authenticatedUser.email
      firebase.upvoteLivestreamQuestionWithRef(streamRef, question, authEmail)
   }

   const isOpen = (property) => {
      return Boolean(
         livestream.test &&
            showMenu &&
            tutorialSteps.streamerReady &&
            index === 0 &&
            tutorialSteps[property] &&
            isNextQuestions &&
            selectedState === "questions" &&
            !sliding
      )
   }

   const clearGloballyActive = () => {
      setOpenQuestionId("")
      setShowAllReactions(false)
   }

   const handleToggle = () => {
      if (showAllReactions) {
         clearGloballyActive()
      } else {
         makeGloballyActive()
      }
   }

   let commentsElements = comments.map((comment) => {
      return (
         <Slide key={comment.id} in direction="right">
            <Box
               key={comment.id}
               sx={[
                  styles.questionComment,
                  active && styles.questionCommentActive,
               ]}
               borderRadius="8px"
               mb={1}
               p={1}
               component={Card}
            >
               <div style={{ wordBreak: "break-word" }}>
                  <LinkifyText>
                     <span>{comment.title}</span>
                  </LinkifyText>
               </div>
               <div style={{ fontSize: "0.8em", color: "rgb(160,160,160)" }}>
                  <span>@{comment.author}</span>
               </div>
            </Box>
         </Slide>
      )
   })

   return (
      <WhiteTooltip
         placement="right-start"
         title={
            <React.Fragment>
               <TooltipTitle>Student Questions (1/3)</TooltipTitle>
               <TooltipText>
                  These are the questions that students already asked and
                  upvoted before your event
               </TooltipText>
               <TooltipButtonComponent
                  onConfirm={() => handleConfirmStep(0)}
                  buttonText="Ok"
               />
            </React.Fragment>
         }
         open={isOpen(0)}
      >
         <Paper
            elevation={4}
            sx={[
               styles.questionContainer,
               active && styles.questionContainerActive,
            ]}
         >
            <div style={{ padding: "20px 20px 5px 20px" }}>
               <Stack
                  direction={"row-reverse"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  spacing={2}
                  sx={styles.topContainer}
               >
                  {canDeleteQuestion && (
                     <Box sx={styles.deleteButton}>
                        <IconButton
                           size={"small"}
                           onClick={() => {
                              setQuestionIdToDelete(question.id)
                           }}
                        >
                           <DeleteForeverIcon />
                        </IconButton>
                     </Box>
                  )}
                  <Box sx={[styles.upVotes, active && styles.upVotesActive]}>
                     <span data-testid={"streaming-question-votes"}>
                        {question.votes}
                     </span>
                     <ThumbUpRoundedIcon
                        color="inherit"
                        style={{ verticalAlign: "text-top" }}
                        fontSize="small"
                     />
                  </Box>
                  {containsBadgeOrLevelsAbove(
                     question?.badges,
                     UserPresenter.questionsHighlightedRequiredBadge()
                  ) && (
                     <Box sx={[styles.badge, active && styles.badgeActive]}>
                        <BadgeButton
                           badge={UserPresenter.questionsHighlightedRequiredBadge()}
                           showBadgeSuffix={false}
                           onlyIcon
                           activeTooltip={(badge) =>
                              `${badge.name} Level ${badge.level} Badge`
                           }
                           buttonProps={{
                              color: "gold",
                              size: "small",
                              variant: "contained",
                              sx: {
                                 minWidth: "30px",
                                 width: "30px",
                                 height: "30px",
                                 borderRadius: "100%",
                                 padding: 0,
                                 boxShadow: "default",
                              },
                           }}
                           badgeIconProps={{
                              noBg: true,
                           }}
                        />
                     </Box>
                  )}
               </Stack>
               <Box
                  sx={[
                     styles.reactionsQuestion,
                     active && styles.reactionsQuestionActive,
                  ]}
               >
                  <span>{question.title}</span>
               </Box>
               <Typography
                  style={{
                     fontSize: "1em",
                     verticalAlign: "middle",
                     fontWeight: 700,
                     color: active ? "white" : "rgb(200,200,200)",
                     marginBottom: "1rem",
                  }}
               >
                  {question.numberOfComments || 0} reaction
                  {question.numberOfComments !== 1 && <span>s</span>}
               </Typography>
               {commentsElements[0]}
               <Collapse
                  style={{ width: "100%" }}
                  in={
                     showAllReactions &&
                     !loadingQuestions &&
                     question.id === openQuestionId
                  }
               >
                  {commentsElements.slice(1)}
               </Collapse>
               {question.numberOfComments > 1 && (
                  <ReactionsToggle
                     handleToggle={handleToggle}
                     active={active}
                     showAllReactions={showAllReactions}
                     loading={loadingQuestions}
                  />
               )}
            </div>
            <WhiteTooltip
               placement="right-start"
               title={
                  <React.Fragment>
                     <TooltipTitle>Student Questions (3/3)</TooltipTitle>
                     <TooltipText>
                        In the recruiter-chat a company HR representative can
                        answer recruiting related questions. Try and type a
                        comment.
                     </TooltipText>
                     <TooltipButtonComponent
                        onConfirm={() => handleConfirmStep(2)}
                        buttonText="Ok"
                     />
                  </React.Fragment>
               }
               open={isOpen(2)}
            >
               <Box p={1}>
                  <TextField
                     value={newCommentTitle}
                     sx={[styles.chatInput, active && styles.chatInputActive]}
                     onKeyDown={addNewCommentOnEnter}
                     placeholder="Send a reaction..."
                     disabled={disableComments}
                     fullWidth
                     size="small"
                     variant="outlined"
                     InputProps={{
                        // @ts-ignore
                        maxLength: 340,
                        endAdornment: (
                           <PlayIconButton
                              disabled={isEmpty || disableComments}
                              addNewComment={() => {
                                 addNewComment().then(
                                    () => isOpen(2) && handleConfirmStep(2)
                                 )
                              }}
                              IconProps={undefined}
                              IconButtonProps={undefined}
                           />
                        ),
                     }}
                     onChange={(event) => {
                        setNewCommentTitle(event.currentTarget.value)
                     }}
                  />
               </Box>
            </WhiteTooltip>
            {streamer ? (
               <WhiteTooltip
                  placement="right-start"
                  title={
                     <React.Fragment>
                        <TooltipTitle>Student Questions (2/3)</TooltipTitle>
                        <TooltipText>
                           Before answering a question verbally, make sure to
                           highlight the question with Answer Now
                        </TooltipText>
                        <TooltipButtonComponent
                           onConfirm={() => {
                              goToThisQuestion(question.id).then(() =>
                                 handleConfirmStep(1)
                              )
                           }}
                           buttonText="Ok"
                        />
                     </React.Fragment>
                  }
                  open={isOpen(1)}
               >
                  <Button
                     startIcon={<ThumbUpRoundedIcon />}
                     size="small"
                     disableElevation
                     disabled={old}
                     sx={styles.questionButton}
                     fullWidth
                     color="primary"
                     onClick={() => {
                        goToThisQuestion(question.id).then(() =>
                           handleConfirmStep(1)
                        )
                     }}
                     variant="contained"
                  >
                     {active ? (
                        <span>Answering</span>
                     ) : old ? (
                        <span>Answered</span>
                     ) : (
                        <span>Answer Now</span>
                     )}
                  </Button>
               </WhiteTooltip>
            ) : (
               <Button
                  startIcon={<ThumbUpRoundedIcon />}
                  size="small"
                  disableElevation
                  sx={styles.questionButton}
                  color="primary"
                  fullWidth
                  variant="contained"
                  onClick={() => upvoteLivestreamQuestion()}
                  disabled={old || upvoted}
               >
                  {!livestream.test &&
                  question.emailOfVoters &&
                  userData &&
                  question.emailOfVoters.indexOf(userData.userEmail) > -1 ? (
                     <span>UPVOTED!</span>
                  ) : (
                     <span>UPVOTE</span>
                  )}
               </Button>
            )}
         </Paper>
      </WhiteTooltip>
   )
}

export default memo(QuestionContainer)

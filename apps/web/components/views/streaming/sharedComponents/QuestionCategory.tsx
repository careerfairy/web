import React, {
   memo,
   useCallback,
   useEffect,
   useLayoutEffect,
   useRef,
   useState,
} from "react"
import {
   Badge,
   Button,
   CircularProgress,
   Collapse,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Fab,
   Slide,
   Tab,
   Tabs,
   TextField,
   Typography,
} from "@mui/material"
import QuestionContainer from "./questions/QuestionContainer"
import HelpIcon from "@mui/icons-material/Help"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import AddIcon from "@mui/icons-material/Add"
import {
   CategoryContainerTopAligned,
   QuestionContainerHeader,
   QuestionContainerTitle,
} from "../../../../materialUI/GlobalContainers"
import * as actions from "../../../../store/actions"
import SwipeableViews from "react-swipeable-views"
import { alpha, useTheme } from "@mui/material/styles"
import CustomInfiniteScroll from "../../../util/CustomInfiteScroll"
import useInfiniteScroll from "../../../custom-hook/useInfiniteScroll"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { GreyPermanentMarker } from "../../../../materialUI/GlobalTitles"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { useDispatch } from "react-redux"
import {
   CurrentStreamContextInterface,
   useCurrentStream,
} from "../../../../context/stream/StreamContext"
import useStreamRef from "../../../custom-hook/useStreamRef"
import { v4 as uuidv4 } from "uuid"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import { LEFT_MENU_WIDTH } from "../../../../constants/streams"
import { LivestreamQuestion } from "@careerfairy/shared-lib/dist/livestreams"
import { sxStyles } from "../../../../types/commonTypes"
import ConfirmDeleteModal from "../modal/ConfirmDeleteModal"
import { StyledBox } from "../../../../materialUI/GlobalPanels/GlobalPanels"
import Box from "@mui/material/Box"
import { rewardService } from "data/firebase/RewardService"

const styles = sxStyles({
   view: {
      position: "relative",
      height: "100%",
      width: "100%",
      overflow: "auto",
      "& .react-swipeable-view-container": {
         height: "100%",
      },
   },
   addIcon: {
      marginRight: 1,
   },
   questionScroll: {
      // height: "100%",
      width: "100%",
   },
   emptyMessage: {
      margin: "auto !important",
      padding: (theme) => theme.spacing(0, 1),
   },
   viewPanel: {
      display: "flex",
      "& > *": {
         width: "100%",
      },
   },
   fullwidth: {
      width: "100%",
   },
   dialog: {
      backgroundColor: (theme) => alpha(theme.palette.common.black, 0.2),
      backdropFilter: "blur(5px)",
   },
   dialogInput: {
      background: (theme) => alpha(theme.palette.background.paper, 0.5),
   },
   bar: {
      width: "100%",
      background: "background.paper",
   },
   tabs: {
      width: LEFT_MENU_WIDTH,
   },
   tabsMobile: {
      width: "100%",
   },
})

const EmptyList = ({ isUpcoming = false }) => {
   return (
      <GreyPermanentMarker sx={styles.emptyMessage}>
         No {isUpcoming ? "upcoming" : "answered"} questions
      </GreyPermanentMarker>
   )
}

type Props = {
   isMobile?: boolean
   selectedState: CurrentStreamContextInterface["selectedState"]
   showMenu: boolean
   sliding?: boolean
   streamer: boolean
}
const QuestionCategory = ({
   isMobile,
   selectedState,
   showMenu,
   sliding,
   streamer,
}: Props) => {
   const firebase = useFirebaseService()
   const [questionIdToDelete, setQuestionIdToDelete] = useState<string>(null)
   const [deletingQuestion, setDeletingQuestion] = useState(false)

   const { currentLivestream: livestream, presenter } = useCurrentStream()
   const mainStreamId = presenter?.getMainStreamId()
   const theme = useTheme()

   const streamRef = useStreamRef()

   const dispatch = useDispatch()
   const [showQuestionModal, setShowQuestionModal] = useState(false)
   const [touched, setTouched] = useState(false)
   const [value, setValue] = useState(0)
   const [sessionUuid] = useState(uuidv4())
   const [submittingQuestion, setSubmittingQuestion] = useState(false)
   const [goingToQuestion, setGoingToQuestion] = useState(false)
   const [newQuestionTitle, setNewQuestionTitle] = useState("")
   const [openQuestionId, setOpenQuestionId] = useState("")
   const { authenticatedUser, userData, userPresenter } = useAuth()
   const [parentHeight, setParentHeight] = useState(400)

   const parentRef = useRef<SwipeableViews>(null)

   const [itemsUpcoming, loadMoreUpcoming, hasMoreUpcoming, totalUpcoming] =
      useInfiniteScroll<LivestreamQuestion>(
         firebase.listenToUpcomingLivestreamQuestions(streamRef),
         10
      )

   const [itemsPast, loadMorePast, hasMorePast] =
      useInfiniteScroll<LivestreamQuestion>(
         firebase.listenToPastLivestreamQuestions(streamRef),
         10
      )

   useEffect(() => {
      if (totalUpcoming.length) {
         // const newlyAskedQuestion = [...totalUpcoming].reverse().find(question => question.timestamp.toDate() > now)
         // if (newlyAskedQuestion?.type === "new") {
         //     const answerNewQuestion = () => {
         //         goToThisQuestion(newlyAskedQuestion.id)
         //         dispatch(actions.closeSnackbar(newlyAskedQuestion.id))
         //     }
         //     dispatch(actions.enqueueSnackbar({
         //         message: `${newlyAskedQuestion.displayName} just asked a the following question: ${truncate(newlyAskedQuestion.title, 40)}`,
         //         options: {
         //             variant: "info",
         //             key: newlyAskedQuestion.id,
         //             action: streamer && (
         //                 <Button
         //                     color="primary"
         //                     disabled={goingToQuestion}
         //                     variant="contained"
         //                     onClick={answerNewQuestion}
         //                 >
         //                     Answer Now
         //                 </Button>
         //             )
         //         }
         //     }))
         // }
      }
   }, [totalUpcoming])

   useLayoutEffect(() => {
      function updateSize() {
         setParentHeight(parentRef.current.containerNode?.offsetHeight)
      }

      window.addEventListener("resize", updateSize)
      updateSize()
      return () => window.removeEventListener("resize", updateSize)
   }, [])

   const handleOpen = () => {
      setTouched(false)
      setShowQuestionModal(true)
   }
   const handleClose = () => {
      setTouched(false)
      setShowQuestionModal(false)
   }

   const handleChange = (event, newValue) => {
      setValue(newValue)
   }
   const handleChangeIndex = (index) => {
      setValue(index)
   }

   const goToThisQuestion = useCallback(
      async (nextQuestionId) => {
         try {
            setGoingToQuestion(true)
            const currentQuestion = itemsUpcoming.find(
               (question) => question.type === "current"
            )
            if (currentQuestion) {
               await firebase.goToNextLivestreamQuestion(
                  currentQuestion.id,
                  nextQuestionId,
                  streamRef
               )
            } else {
               await firebase.goToNextLivestreamQuestion(
                  null,
                  nextQuestionId,
                  streamRef
               )
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e))
         }
         setGoingToQuestion(false)
      },
      [itemsUpcoming, firebase, streamRef, dispatch]
   )

   const addNewQuestion = async () => {
      setTouched(true)
      if (
         (!userData && !(livestream.test || livestream.openStream)) ||
         !newQuestionTitle.trim() ||
         newQuestionTitle.trim().length < 5
      ) {
         return
      }
      setSubmittingQuestion(true)
      try {
         // infer argument type from the function signature

         await firebase.addLivestreamQuestion(streamRef, {
            title: newQuestionTitle,
            votes: 0,
            type: "new",
            author: !(livestream.test || livestream.openStream)
               ? authenticatedUser.email
               : "open@careerfairy.io",
            displayName: !(livestream.test || livestream.openStream)
               ? `${userData.firstName} ${userData.lastName}`
               : "A viewer",
            // save the user badges on the question
            ...(userData?.badges?.length > 0 && {
               badges: userData.badges,
            }),
         })

         if (userData) {
            rewardService
               .userAction("LIVESTREAM_USER_ASKED_QUESTION", mainStreamId)
               .then((_) => console.log("Rewarded Question Asked"))
               .catch(console.error)
         }
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
      setSubmittingQuestion(false)
      setNewQuestionTitle("")
      handleClose()
   }

   const handleDeleteQuestion = async () => {
      if (!questionIdToDelete) return
      try {
         setDeletingQuestion(true)
         await firebase.deleteLivestreamQuestion(streamRef, questionIdToDelete)
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
      setQuestionIdToDelete(null)
      setDeletingQuestion(false)
   }

   let upcomingQuestionsElements = itemsUpcoming
      .sort(sortByQuestionsHighlightBadge)
      .map((question, index) => {
         return (
            <QuestionContainer
               key={question.id}
               sessionUuid={sessionUuid}
               streamer={streamer}
               goToThisQuestion={goToThisQuestion}
               isNextQuestions={value === 0}
               setOpenQuestionId={setOpenQuestionId}
               index={index}
               sliding={sliding}
               showMenu={showMenu}
               openQuestionId={openQuestionId}
               selectedState={selectedState}
               question={question}
               setQuestionIdToDelete={setQuestionIdToDelete}
            />
         )
      })

   let pastQuestionsElements = itemsPast
      .sort(sortByQuestionsHighlightBadge)
      .map((question, index) => {
         return (
            <QuestionContainer
               key={question.id}
               streamer={streamer}
               isNextQuestions={value === 1}
               index={index}
               sessionUuid={sessionUuid}
               openQuestionId={openQuestionId}
               sliding={sliding}
               setOpenQuestionId={setOpenQuestionId}
               showMenu={showMenu}
               goToThisQuestion={goToThisQuestion}
               selectedState={selectedState}
               question={question}
               setQuestionIdToDelete={setQuestionIdToDelete}
            />
         )
      })
   const getCount = (isUpcoming?: boolean) => {
      const elements = isUpcoming
         ? upcomingQuestionsElements
         : pastQuestionsElements
      const hasMore = isUpcoming ? hasMoreUpcoming : hasMorePast
      return elements.length ? `${elements.length}${hasMore ? "+" : ""}` : 0
   }

   return (
      <>
         <CategoryContainerTopAligned>
            <QuestionContainerHeader>
               <QuestionContainerTitle>Questions</QuestionContainerTitle>
               {!streamer && (
                  <Fab
                     onClick={handleOpen}
                     size="medium"
                     color="primary"
                     variant="extended"
                  >
                     <AddIcon sx={styles.addIcon} />
                     Add a Question
                  </Fab>
               )}
               <Tabs
                  value={value}
                  onChange={handleChange}
                  indicatorColor="primary"
                  variant={isMobile ? "fullWidth" : "standard"}
                  textColor="primary"
                  sx={[styles.tabs, isMobile && styles.tabsMobile]}
               >
                  <Tab
                     style={{ minWidth: "50%" }}
                     label="Upcoming"
                     icon={
                        <Badge color="secondary" badgeContent={getCount(true)}>
                           <HelpIcon />
                        </Badge>
                     }
                  />
                  <Tab
                     style={{ minWidth: "50%" }}
                     label="Answered"
                     icon={
                        <Badge color="secondary" badgeContent={getCount()}>
                           <CheckCircleIcon />
                        </Badge>
                     }
                  />
               </Tabs>
            </QuestionContainerHeader>
            <Box
               component={SwipeableViews}
               containerStyle={{ WebkitOverflowScrolling: "touch" }}
               disabled
               ref={parentRef}
               id="scrollable-container"
               sx={styles.view}
               axis={theme.direction === "rtl" ? "x-reverse" : "x"}
               index={value}
               onChangeIndex={handleChangeIndex}
            >
               <StyledBox sx={styles.viewPanel}>
                  {itemsUpcoming.length ? (
                     <CustomInfiniteScroll
                        style={{
                           width: "100%",
                        }}
                        height={parentHeight}
                        hasMore={hasMoreUpcoming}
                        next={loadMoreUpcoming}
                        dataLength={itemsUpcoming.length}
                     >
                        {upcomingQuestionsElements}
                     </CustomInfiniteScroll>
                  ) : (
                     <EmptyList isUpcoming />
                  )}
               </StyledBox>
               <StyledBox sx={styles.viewPanel}>
                  {itemsPast.length ? (
                     <CustomInfiniteScroll
                        style={{
                           width: "100%",
                        }}
                        hasMore={hasMorePast}
                        height={parentHeight}
                        next={loadMorePast}
                        dataLength={itemsPast.length}
                     >
                        {pastQuestionsElements}
                     </CustomInfiniteScroll>
                  ) : (
                     <EmptyList />
                  )}
               </StyledBox>
            </Box>
            {showQuestionModal && (
               <Dialog
                  TransitionComponent={Slide}
                  PaperProps={{ className: `notranslate`, sx: styles.dialog }}
                  fullWidth
                  onClose={handleClose}
                  open={showQuestionModal}
               >
                  <DialogTitle style={{ color: "white" }}>
                     Add a Question
                  </DialogTitle>
                  <DialogContent>
                     <TextField
                        autoFocus={showQuestionModal}
                        InputProps={{ sx: styles.dialogInput }}
                        error={Boolean(touched && newQuestionTitle.length < 5)}
                        onBlur={() => setTouched(true)}
                        variant="outlined"
                        value={newQuestionTitle}
                        placeholder="Your question goes here"
                        onChange={(e) => setNewQuestionTitle(e.target.value)}
                        fullWidth
                     />
                     <Collapse
                        in={Boolean(touched && newQuestionTitle.length < 5)}
                     >
                        <Typography
                           style={{ paddingLeft: "1rem" }}
                           color="error"
                        >
                           Needs to be at least 5 characters
                        </Typography>
                     </Collapse>

                     {userPresenter?.questionsShouldBeHighlighted() && (
                        <Typography color="lightgrey" mt={1}>
                           Your question will be highlighted with your{" "}
                           {
                              UserPresenter.questionsHighlightedRequiredBadge()
                                 .name
                           }{" "}
                           badge.
                        </Typography>
                     )}
                  </DialogContent>
                  <DialogActions>
                     <Button
                        sx={{ color: "white" }}
                        size="large"
                        color="grey"
                        onClick={handleClose}
                     >
                        Cancel
                     </Button>
                     <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={submittingQuestion}
                        onClick={() => addNewQuestion()}
                     >
                        {submittingQuestion ? (
                           <CircularProgress color="inherit" size={20} />
                        ) : (
                           "Submit"
                        )}
                     </Button>
                  </DialogActions>
               </Dialog>
            )}
         </CategoryContainerTopAligned>
         {questionIdToDelete && (
            <ConfirmDeleteModal
               title={"Delete question"}
               description={
                  <>
                     Are you sure you want to delete this question?
                     <br />
                     This action cannot be undone.
                  </>
               }
               onConfirm={handleDeleteQuestion}
               loading={deletingQuestion}
               onClose={() => setQuestionIdToDelete(null)}
            />
         )}
      </>
   )
}

/**
 * When two questions have the same number of votes, the question with
 * the Networker Badge should come first
 *
 * @param left
 * @param right
 * @returns {number}
 */
function sortByQuestionsHighlightBadge(left, right) {
   if (
      left.votes === right.votes &&
      right?.badges?.includes(
         UserPresenter.questionsHighlightedRequiredBadge().key
      )
   ) {
      return 1
   }

   return 0 // keep original order
}

export default memo(QuestionCategory)

import PropTypes from "prop-types"
import React, { useState, useEffect, Fragment, useContext } from "react"
import { withFirebase } from "context/firebase/FirebaseServiceContext"
import BarChartIcon from "@mui/icons-material/BarChart"
import AddIcon from "@mui/icons-material/Add"
import PollCreationModal from "./polls/poll-creation-modal/PollCreationModal"
import PollEntryContainer from "./polls/poll-entry-container/PollEntryContainer"
import { Button } from "@mui/material"
import {
   CategoryContainerTopAligned,
   QuestionContainerHeader,
   QuestionContainerTitle,
} from "../../../../../materialUI/GlobalContainers"
import TutorialContext from "../../../../../context/tutorials/TutorialContext"
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "../../../../../materialUI/GlobalTooltips"
import makeStyles from "@mui/styles/makeStyles"
import { getCorrectPollOptionData } from "../../../../../data/util/PollUtil"
import useStreamRef from "../../../../custom-hook/useStreamRef"

const useStyles = makeStyles((theme) => ({
   pollHeader: {
      paddingBottom: theme.spacing(2),
   },
}))

const PollCategory = ({
   firebase,
   streamer,
   livestream,
   selectedState,
   showMenu,
   user,
   userData,
   sliding,
}) => {
   const classes = useStyles()
   const [addNewPoll, setAddNewPoll] = useState(false)
   const [pollEntries, setPollEntries] = useState([])
   const streamRef = useStreamRef()
   const [demoPolls, setDemoPolls] = useState(false)
   const { tutorialSteps, handleConfirmStep } = useContext(TutorialContext)

   useEffect(() => {
      if (livestream.id) {
         const unsubscribe = firebase.listenToPollEntriesWithStreamRef(
            streamRef,
            (querySnapshot) => {
               const pollEntries = querySnapshot.docs.map((doc) => {
                  const data = doc.data()
                  return {
                     id: doc.id,
                     ...data,
                     options: getCorrectPollOptionData(data),
                  }
               })
               setPollEntries(pollEntries)
            }
         )
         return () => unsubscribe()
      }
   }, [livestream.id])

   const somePollIsCurrent = pollEntries.some(
      (poll) => poll.state === "current"
   )
   const getActiveTutorialStepKey = () => {
      const activeStep = Object.keys(tutorialSteps).find((key) => {
         if (tutorialSteps[key]) {
            return key
         }
      })
      return Number(activeStep)
   }

   const pollElements = pollEntries
      .filter((poll) => poll.state !== "closed")
      .map((poll, index) => {
         return (
            <Fragment key={index}>
               <PollEntryContainer
                  selectedState={selectedState}
                  showMenu={showMenu}
                  poll={poll}
                  sliding={sliding}
                  addNewPoll={addNewPoll}
                  setDemoPolls={setDemoPolls}
                  index={index}
                  streamer={streamer}
                  user={user}
                  demoPolls={demoPolls}
                  userData={userData}
                  livestream={livestream}
                  somePollIsCurrent={somePollIsCurrent}
               />
            </Fragment>
         )
      })

   const isOpen = (property) => {
      const activeStep = getActiveTutorialStepKey()
      return Boolean(
         livestream.test &&
            showMenu &&
            !addNewPoll &&
            tutorialSteps.streamerReady &&
            tutorialSteps[property] &&
            selectedState === "polls" &&
            !sliding
      )
   }

   return (
      <CategoryContainerTopAligned>
         <QuestionContainerHeader className={classes.pollHeader}>
            <QuestionContainerTitle>
               <BarChartIcon fontSize="large" color="primary" /> Polls
            </QuestionContainerTitle>
            <WhiteTooltip
               placement="right-start"
               title={
                  <React.Fragment>
                     <TooltipTitle>Polls (1/4)</TooltipTitle>
                     <TooltipText>
                        Engage your audience by creating and asking polls
                     </TooltipText>
                     <TooltipButtonComponent
                        onConfirm={() => {
                           !pollElements.length && setAddNewPoll(true)
                           handleConfirmStep(4)
                        }}
                        buttonText="Ok"
                     />
                  </React.Fragment>
               }
               open={isOpen(4)}
            >
               <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                     setAddNewPoll(true)
                     isOpen(4) && handleConfirmStep(4)
                  }}
                  variant="contained"
                  color="primary"
               >
                  Create Poll
               </Button>
            </WhiteTooltip>
         </QuestionContainerHeader>
         <div
            style={{
               width: "100%",
               flex: 1,
               overflow: "auto",
            }}
         >
            {pollElements}
         </div>
         <PollCreationModal
            open={addNewPoll}
            handleClose={() => setAddNewPoll(false)}
         />
      </CategoryContainerTopAligned>
   )
}

PollCategory.propTypes = {
   firebase: PropTypes.object,
   livestream: PropTypes.object.isRequired,
   selectedState: PropTypes.string.isRequired,
   showMenu: PropTypes.bool.isRequired,
   sliding: PropTypes.bool.isRequired,
   streamer: PropTypes.bool.isRequired,
   user: PropTypes.object,
   userData: PropTypes.object,
}

export default withFirebase(PollCategory)

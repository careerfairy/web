import React, { Fragment, useContext, useEffect, useState } from "react"
import { withFirebase } from "context/firebase/FirebaseServiceContext"
import CurrentPollGraph from "../../../../../sharedComponents/CurrentPollGraph"
import { Button } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import TutorialContext from "../../../../../../../../context/tutorials/TutorialContext"
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "../../../../../../../../materialUI/GlobalTooltips"
import {
   getRandomInt,
   getRandomWeightedInt,
   isServer,
} from "../../../../../../../helperFunctions/HelperFunctions"
import useStreamRef from "../../../../../../../custom-hook/useStreamRef"

// function getRandomInt(min, max, index) {
//     return (Math.floor((Math.random() * (max - min + 1) + min) / (index + 1)));
// }

const useStyles = makeStyles((theme) => ({
   demoFab: {
      position: "absolute",
      top: 3,
      right: 3,
      background: ({ demoMode }) =>
         demoMode ? "white" : theme.palette.secondary.main,
      "&:hover": {
         background: ({ demoMode }) =>
            demoMode ? "white" : theme.palette.secondary.dark,
      },
   },
   demoIcon: {
      color: ({ demoMode }) =>
         demoMode ? theme.palette.secondary.main : "white",
   },
   pollContainer: {
      borderRadius: theme.spacing(2),
      boxShadow: theme.shadows[10],
      margin: "10px 10px 0 10px",
      padding: "12px 0 0 0",
      backgroundColor: theme.palette.background.paper,
      position: "relative",
   },
   pollLabel: {
      color: "grey",
      fontWeight: 700,
      textAlign: "center",
      marginBottom: "10px",
   },
}))

function CurrentPollStreamer({
   setDemoPolls,
   demoPolls,
   sliding,
   firebase,
   livestream,
   showMenu,
   selectedState,
   addNewPoll,
   poll,
   index,
}) {
   const [currentPoll, setCurrentPoll] = useState(null)
   const [demoMode, setDemoMode] = useState(false)
   const [numberOfTimes, setNumberOfTimes] = useState(0)
   const classes = useStyles({ demoMode })
   const streamRef = useStreamRef()
   const { tutorialSteps, setTutorialSteps } = useContext(TutorialContext)

   const isOpen = (property) => {
      return Boolean(
         livestream.test &&
            index === 0 &&
            showMenu &&
            tutorialSteps.streamerReady &&
            tutorialSteps[property] &&
            selectedState === "polls" &&
            !addNewPoll &&
            !sliding
      )
   }

   const handleConfirm = (property) => {
      setTutorialSteps({
         ...tutorialSteps,
         [property]: false,
         [property + 1]: true,
      })
   }

   useEffect(() => {
      if (demoPolls) {
         setDemoMode(true)
      }
   }, [demoPolls])

   useEffect(() => {
      if (poll && !demoMode) {
         setCurrentPoll(poll)
      }
   }, [poll])

   useEffect(() => {
      if (numberOfTimes >= 20) {
         setDemoMode(false)
         setDemoPolls(false)
      }
   }, [numberOfTimes])

   useEffect(() => {
      if (demoMode) {
         const interval = setInterval(() => {
            simulatePollVotes()
         }, 100)
         return () => {
            clearInterval(interval)
         }
      }
   }, [demoMode])

   function setPollState(state) {
      firebase.setPollState(streamRef, poll.id, state)
   }

   let totalVotes = 0
   poll.options.forEach((option) => (totalVotes += option.votes))

   const simulatePollVotes = () => {
      setNumberOfTimes((count) => count + 1)
      setCurrentPoll((prevState) => {
         const newCurrentPoll = { ...prevState }
         const prevDemoVotes = newCurrentPoll.demoVotes || []
         newCurrentPoll.demoVotes = [
            ...prevDemoVotes,
            spamRandomVote(currentPoll),
         ]
         return newCurrentPoll
      })
   }

   const spamRandomVote = (currentPoll) => {
      const options = currentPoll.options
      const randomNum = getRandomInt(0, options.length - 1)
      const randomWeightedIndex = getRandomWeightedInt(
         0,
         options.length - 1,
         randomNum
      )
      return {
         optionId: options[randomWeightedIndex].id,
         timestamp: new Date(),
      }
   }

   return (
      <Fragment>
         <div>
            <div className={classes.pollContainer}>
               <div className={classes.pollLabel}>ACTIVE POLL</div>
               {currentPoll && !isServer() && (
                  <CurrentPollGraph currentPoll={currentPoll} />
               )}
               <WhiteTooltip
                  placement="right-end"
                  title={
                     <React.Fragment>
                        <TooltipTitle>Polls (4/4)</TooltipTitle>
                        <TooltipText>
                           Once your audience has voted you can now close the
                           poll.
                        </TooltipText>
                        <TooltipButtonComponent
                           onConfirm={() => {
                              setPollState("closed")
                              handleConfirm(7)
                           }}
                           buttonText="Ok"
                        />
                     </React.Fragment>
                  }
                  open={isOpen(7)}
               >
                  <Button
                     fullWidth
                     variant="contained"
                     color="primary"
                     onClick={() => {
                        setPollState("closed")
                        isOpen(7) && handleConfirm(7)
                     }}
                     style={{ borderRadius: "0 0 15px 15px" }}
                  >
                     Close Poll
                  </Button>
               </WhiteTooltip>
            </div>
         </div>
      </Fragment>
   )
}

export default withFirebase(CurrentPollStreamer)

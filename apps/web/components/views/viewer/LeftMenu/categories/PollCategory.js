import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import CurrentPollGraph from "../../../streaming/sharedComponents/CurrentPollGraph"
import { Paper } from "@mui/material"
import {
   GreyPermanentMarker,
   PollQuestion,
} from "../../../../../materialUI/GlobalTitles"
import { CategoryContainerCentered } from "../../../../../materialUI/GlobalContainers"
import { colorsArray } from "../../../../util/colors"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { DynamicColorButton } from "../../../../../materialUI/GlobalButtons/GlobalButtons"
import { getCorrectPollOptionData } from "../../../../../data/util/PollUtil"
import { isServer } from "../../../../helperFunctions/HelperFunctions"
import useStreamRef from "../../../../custom-hook/useStreamRef"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import { v4 as uuidv4 } from "uuid"

const usePollWrapperStyles = makeStyles((theme) => ({
   root: {
      borderRadius: 15,
      margin: 10,
      backgroundColor: theme.palette.background.paper,
      display: "flex",
      width: "90%",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      padding: theme.spacing(2, 0),
      boxShadow: theme.shadows[3],
   },
}))

const PollWrapper = ({ children, ...rest }) => {
   const classes = usePollWrapperStyles()
   return (
      <Paper {...rest} className={classes.root}>
         {children}
      </Paper>
   )
}

PollWrapper.propTypes = {
   children: PropTypes.node,
   style: PropTypes.object,
}

const useStyles = makeStyles((theme) => ({
   pollButton: {
      marginTop: theme.spacing(1),
   },
}))

const PollOptionsDisplay = ({ currentPoll, voting, voteForPollOption }) => {
   const theme = useTheme()
   const classes = useStyles()
   return (
      <CategoryContainerCentered>
         <PollWrapper style={{ padding: theme.spacing(2) }}>
            <PollQuestion style={{ margin: "1.5rem 0" }}>
               {currentPoll?.question}
            </PollQuestion>
            <div>
               {currentPoll?.options?.map((option, index) => {
                  return (
                     <DynamicColorButton
                        key={option.id}
                        variant="contained"
                        loading={voting}
                        className={classes.pollButton}
                        color={colorsArray[index]}
                        fullWidth
                        disabled={voting}
                        onClick={() => voteForPollOption(option.id)}
                        size="small"
                     >
                        <span key={`${option.text}-span`}>{option.text}</span>
                     </DynamicColorButton>
                  )
               })}
            </div>
         </PollWrapper>
      </CategoryContainerCentered>
   )
}

PollOptionsDisplay.propTypes = {
   currentPoll: PropTypes.object,
   voteForPollOption: PropTypes.func,
   voting: PropTypes.bool,
}

const PollDisplay = ({ currentPoll }) => {
   return (
      <CategoryContainerCentered>
         <PollWrapper>
            {currentPoll && !isServer() && (
               <CurrentPollGraph currentPoll={currentPoll} />
            )}
         </PollWrapper>
      </CategoryContainerCentered>
   )
}

PollDisplay.propTypes = {
   currentPoll: PropTypes.object,
}

const NoPollDisplay = () => {
   return (
      <CategoryContainerCentered>
         <GreyPermanentMarker>No current poll</GreyPermanentMarker>
      </CategoryContainerCentered>
   )
}
const PollCategory = ({ livestream, setSelectedState }) => {
   const { authenticatedUser } = useAuth()
   const firebase = useFirebaseService()
   const streamRef = useStreamRef()
   const [sessionUuid, setSessionUuid] = useState(uuidv4())
   const dispatch = useDispatch()
   const [currentPoll, setCurrentPoll] = useState(null)
   const [currentPollId, setCurrentPollId] = useState(null)
   const [voting, setVoting] = useState(false)
   const [hasVoted, setHasVoted] = useState(false)
   const [value, setValue] = useState(0)
   let authEmail =
      authenticatedUser &&
      authenticatedUser.email &&
      !(livestream.test || livestream.openStream)
         ? authenticatedUser.email
         : "anonymous" + sessionUuid

   useEffect(() => {
      if (streamRef) {
         firebase.listenToPolls(streamRef, (querySnapshot) => {
            let pollSwitch = null
            querySnapshot.forEach((doc) => {
               let poll = doc.data()
               poll.options = getCorrectPollOptionData(poll)
               if (poll.state === "current") {
                  poll.id = doc.id
                  pollSwitch = poll
               }
            })
            return setCurrentPoll(pollSwitch)
         })
      }
   }, [streamRef])

   useEffect(() => {
      if (currentPoll && currentPoll.id !== currentPollId) {
         setSelectedState("polls")
         dispatch(actions.openLeftMenu())
         setCurrentPollId(currentPoll.id)
      }
   }, [currentPoll])

   useEffect(() => {
      if (currentPoll?.id) {
         const unsubscribe = firebase.listenToVoteOnPoll(
            streamRef,
            currentPoll.id,
            authEmail,
            (querySnapshot) => {
               setHasVoted(querySnapshot.exists)
            }
         )
         return () => {
            unsubscribe()
            // switch the left menu to the questions after a poll is done
            setSelectedState("questions")
         }
      } else {
         setHasVoted(false)
      }
   }, [currentPoll?.id, authEmail, setSelectedState])

   useEffect(() => {
      if (!Boolean(currentPoll && authEmail)) {
         setValue(0)
      } else if (!hasVoted) {
         setValue(1)
      } else if (hasVoted) {
         setValue(2)
      } else {
         setValue(0)
      }
   }, [currentPoll, authEmail, hasVoted])

   /**
    * @param {string} optionId - Id of the option you wish to vote for
    */
   const voteForPollOption = async (optionId) => {
      let authEmail =
         livestream.test || livestream.openStream
            ? "anonymous" + sessionUuid
            : authenticatedUser.email
      if (authEmail) {
         setVoting(true)
         await firebase.voteForPollOption(
            streamRef,
            currentPoll.id,
            authEmail,
            optionId
         )
         setVoting(false)
      }
   }

   const renderPollView = (value) => {
      switch (value) {
         case 0:
            return <NoPollDisplay />
         case 1:
            return (
               <PollOptionsDisplay
                  currentPoll={currentPoll}
                  voteForPollOption={voteForPollOption}
                  voting={voting}
               />
            )
         case 2:
            return <PollDisplay currentPoll={currentPoll} />
         default:
            return <NoPollDisplay />
      }
   }

   return <React.Fragment>{renderPollView(value)}</React.Fragment>
}

PollCategory.propTypes = {
   livestream: PropTypes.object.isRequired,
   setSelectedState: PropTypes.func.isRequired,
}
export default PollCategory

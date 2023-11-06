import React, { useContext, useEffect, useState } from "react"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { Button, Grow, Typography } from "@mui/material"
import { CategoryContainerCentered } from "../../../../../../../materialUI/GlobalContainers"
import { GreyPermanentMarker } from "../../../../../../../materialUI/GlobalTitles"
import TutorialContext from "../../../../../../../context/tutorials/TutorialContext"
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "../../../../../../../materialUI/GlobalTooltips"
import useStreamRef from "../../../../../../custom-hook/useStreamRef"
import { useLocalStorage } from "react-use"
import NewFeatureHint from "../../../../../../util/NewFeatureHint"
import { useSelector } from "react-redux"

const HAND_RAISE_HINT_LOCAL_KEY = "hasSeenHandRaiseTip"

function HandRaiseInactive({
   livestream,
   showMenu,
   selectedState,
   sliding,
   handleStateChange,
}) {
   const { tutorialSteps, setTutorialSteps } = useContext(TutorialContext)
   const firebase = useFirebaseService()
   const streamRef = useStreamRef()
   const [animating, setAnimating] = useState(false)
   const [hasSeenHandRaiseTip, setHasSeenHandRaiseTip] = useLocalStorage(
      HAND_RAISE_HINT_LOCAL_KEY,
      false
   )
   const streamerIsPublished = useSelector((state) => {
      return state.stream.streaming.isPublished
   })

   useEffect(() => {
      if (hasSeenHandRaiseTip === false && !livestream.test) {
         handleStateChange("hand")
      }
   }, [hasSeenHandRaiseTip, livestream.test])

   const isOpen = (property) => {
      return Boolean(
         livestream.test &&
            showMenu &&
            tutorialSteps.streamerReady &&
            tutorialSteps[property] &&
            selectedState === "hand" &&
            !sliding
      )
   }

   const handleConfirm = (property) => {
      setTutorialSteps({
         ...tutorialSteps,
         [property]: false,
         [property + 1]: true,
      })
      if (property === 9) {
         createDemoHandRaiseRequest()
      }
   }

   if (livestream.handRaiseActive) {
      return null
   }

   function setHandRaiseModeActive() {
      return firebase.setHandRaiseMode(streamRef, true)
   }

   function createDemoHandRaiseRequest() {
      firebase.createHandRaiseRequest(streamRef, "demo@careerfairy.io", {
         firstName: "Demoman",
         lastName: "Test",
      })
   }

   return (
      <Grow
         mountOnEnter
         onEntering={() => setAnimating(true)}
         onEntered={() => setAnimating(false)}
         unmountOnExit
         in={Boolean(!livestream.handRaiseActive)}
      >
         <span>
            <CategoryContainerCentered>
               <div
                  style={{
                     width: "90%",
                     display: "grid",
                     placeItems: "center",
                  }}
               >
                  <GreyPermanentMarker>
                     Hand Raise is not active
                  </GreyPermanentMarker>
                  <Typography
                     mt={2}
                     style={{ marginBottom: "1rem" }}
                     align="center"
                     gutterBottom
                  >
                     Allow viewers to join in your stream via audio and video by
                     activating hand raise feature.
                  </Typography>
                  <WhiteTooltip
                     placement="right-start"
                     title={
                        <React.Fragment>
                           <TooltipTitle>Hand Raise (1/5)</TooltipTitle>
                           <TooltipText>
                              Invite your viewers to also ask you questions via
                              video and audio
                           </TooltipText>
                           <TooltipButtonComponent
                              onConfirm={() => {
                                 setHandRaiseModeActive()
                                 handleConfirm(9)
                              }}
                              buttonText="Ok"
                           />
                        </React.Fragment>
                     }
                     open={isOpen(9)}
                  >
                     <NewFeatureHint
                        onClickConfirm={() => setHasSeenHandRaiseTip(true)}
                        localStorageKey={HAND_RAISE_HINT_LOCAL_KEY}
                        tooltipTitle="Allow audience to join with video/audio"
                        hide={
                           tutorialSteps.streamerReady ||
                           selectedState !== "hand" ||
                           animating
                        }
                        placement="bottom"
                        tooltipText="Please activate this feature if you would like your audience to join with video and video."
                        buttonText={"I understand"}
                     >
                        <Button
                           variant="contained"
                           color="primary"
                           size="large"
                           onClick={() => {
                              setHandRaiseModeActive()
                              isOpen(9) && handleConfirm(9)
                           }}
                        >
                           Activate Hand Raise
                        </Button>
                     </NewFeatureHint>
                  </WhiteTooltip>
               </div>
            </CategoryContainerCentered>
         </span>
      </Grow>
   )
}

export default HandRaiseInactive

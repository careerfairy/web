import TutorialContext from "../context/tutorials/TutorialContext"
import { useCallback, useState } from "react"

const initialTutorialState = {
   0: true,
   1: false,
   2: false,
   3: false,
   4: false,
   5: false,
   6: false,
   7: false,
   8: false,
   9: false,
   10: false,
   11: false,
   12: false,
   13: false,
   14: false,
   15: false,
   16: false,
   // ^ start of video controls tutorial ^
   17: false,
   18: false,
   19: false,
   20: false,
   21: false,
   22: false,
   23: false,
   24: false,
   streamerReady: false,
}

const TutorialProvider = ({ children }) => {
   const [tutorialSteps, setTutorialSteps] = useState(initialTutorialState)
   const [showBubbles, setShowBubbles] = useState(false)

   const getActiveTutorialStepKey = useCallback(() => {
      const activeStep = Object.keys(tutorialSteps).find((key) => {
         if (tutorialSteps[key]) {
            return key
         }
      })
      return Number(activeStep)
   }, [tutorialSteps])

   const handleConfirmStep = (property) => {
      setTutorialSteps({
         ...tutorialSteps,
         [property]: false,
         [property + 1]: true,
      })
   }

   const isOpen = (property, isTest) => {
      const activeStep = getActiveTutorialStepKey()
      if (isTest) {
         return Boolean(activeStep === property)
      }
      return Boolean(activeStep === property)
   }

   const endTutorial = () => {
      setTutorialSteps((prevState) => ({
         ...prevState,
         streamerReady: true,
      }))
   }

   return (
      <TutorialContext.Provider
         value={{
            tutorialSteps,
            setTutorialSteps,
            showBubbles,
            setShowBubbles,
            getActiveTutorialStepKey,
            handleConfirmStep,
            isOpen,
            endTutorial,
         }}
      >
         {children}
      </TutorialContext.Provider>
   )
}

export default TutorialProvider

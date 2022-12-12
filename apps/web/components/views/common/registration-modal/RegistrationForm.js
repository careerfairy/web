import React, { useContext, useEffect, useMemo, useState } from "react"
import { RegistrationContext } from "context/registration/RegistrationContext"
import LivestreamGroupQuestionForm from "./steps/LivestreamGroupQuestionForm"
import QuestionUpvote from "./steps/QuestionUpvote"
import QuestionCreateForm from "./steps/QuestionCreateForm"
import TalentPoolJoin from "./steps/TalentPoolJoin"
import RegistrationComplete from "./steps/RegistrationComplete"
import SwipeableViews from "react-swipeable-views"
import { useTheme } from "@mui/material/styles"
import { SwipeablePanel } from "../../../../materialUI/GlobalPanels/GlobalPanels"
import UserResumeSelect from "./steps/UserResumeSelect"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { livestreamRepo } from "../../../../data/RepositoryInstances"

const styles = {
   panel: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
}

const RegistrationForm = () => {
   const {
      activeStep,
      setTotalSteps,
      setSliding,
      livestream,
      questions,
      hasMore: hasMoreQuestionsToLoad,
   } = useContext(RegistrationContext)
   const theme = useTheme()
   const { userData } = useAuth()
   const [isFirstRegistrationEver, setIsFirstRegistrationEver] = useState(false)

   const steps = useMemo(() => {
      const newSteps = []

      if (livestream?.withResume) {
         newSteps.push({
            step: <UserResumeSelect />,
            label: "Upload your resume",
            id: "resumeUpload",
         })
      }
      newSteps.push({
         step: <LivestreamGroupQuestionForm />,
         label: "Select your categories",
         id: "categorySelect",
      })

      if (!livestream?.questionsDisabled) {
         if (questions.length || hasMoreQuestionsToLoad) {
            newSteps.push({
               step: <QuestionUpvote />,
               label: "Add a Question",
               id: "questionsUpvote",
            })
         }
         newSteps.push({
            step: <QuestionCreateForm />,
            label: "Upvote questions",
            id: "questionCreate",
         })
      }

      newSteps.push(
         {
            step: <TalentPoolJoin />,
            label: "Join Talent Pool",
            id: "talentPoolJoin",
         },
         {
            step: (
               <RegistrationComplete
                  isFirstRegistration={isFirstRegistrationEver}
               />
            ),
            label: "Finish",
            id: "registrationComplete",
         }
      )

      return newSteps
   }, [
      hasMoreQuestionsToLoad,
      isFirstRegistrationEver,
      livestream?.questionsDisabled,
      livestream?.withResume,
      questions.length,
   ])

   useEffect(() => {
      setTotalSteps(steps.length)
   }, [setTotalSteps, steps.length])

   useEffect(() => {
      if (userData?.authId) {
         ;(async () => {
            const isFirstLivestream =
               await livestreamRepo.isUserRegisterOnAnyLivestream(
                  userData.authId
               )
            setIsFirstRegistrationEver(isFirstLivestream)
         })()
      }
   }, [userData])

   return (
      <SwipeableViews
         axis={theme.direction === "rtl" ? "x-reverse" : "x"}
         index={activeStep}
         onChangeIndex={() => setSliding(true)}
         onTransitionEnd={() => setSliding(false)}
         disableLazyLoading
         disabled
         animateTransitions={false}
      >
         {steps.map((stepData, index) => (
            <SwipeablePanel
               value={activeStep}
               index={index}
               key={stepData.id}
               sx={styles.panel}
            >
               {stepData.step}
            </SwipeablePanel>
         ))}
      </SwipeableViews>
   )
}

export default RegistrationForm

import React, { useContext, useEffect } from "react"
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

const styles = {
   panel: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
}
const steps = [
   {
      index: 0,
      step: <UserResumeSelect />,
      label: "Upload your resume",
      id: "resumeUpload",
   },
   {
      index: 1,
      step: <LivestreamGroupQuestionForm />,
      label: "Select your categories",
      id: "categorySelect",
   },
   {
      index: 2,
      step: <QuestionUpvote />,
      label: "Add a Question",
      id: "questionsUpvote",
   },
   {
      index: 3,
      step: <QuestionCreateForm />,
      label: "Upvote questions",
      id: "questionCreate",
   },
   {
      index: 4,
      step: <TalentPoolJoin />,
      label: "Join Talent Pool",
      id: "talentPoolJoin",
   },
   {
      index: 5,
      step: <RegistrationComplete />,
      label: "Finish",
      id: "registrationComplete",
   },
]

const RegistrationForm = () => {
   const { activeStep, setTotalSteps, setSliding } =
      useContext(RegistrationContext)
   const theme = useTheme()

   useEffect(() => {
      setTotalSteps(steps.length)
   }, [steps])
   return (
      <SwipeableViews
         axis={theme.direction === "rtl" ? "x-reverse" : "x"}
         index={activeStep}
         onChangeIndex={() => setSliding(true)}
         onTransitionEnd={() => setSliding(false)}
         disabled
      >
         {steps.map((stepData) => (
            <SwipeablePanel
               value={activeStep}
               index={stepData.index}
               key={stepData.index}
               sx={styles.panel}
            >
               {stepData.step}
            </SwipeablePanel>
         ))}
      </SwipeableViews>
   )
}

export default RegistrationForm

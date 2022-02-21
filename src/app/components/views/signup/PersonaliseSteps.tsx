import MultiStepWrapper, { MultiStepComponentType } from "./MultiStepWrapper"
import React, { useState } from "react"
import GroupProvider from "./GroupProvider"

const steps: MultiStepComponentType[] = [
   {
      component: () => GroupProvider,
      description: "Join Groups",
   },
]

const PersonaliseSteps = () => {
   const [currentStep, setCurrentStep] = useState(0)

   return (
      <MultiStepWrapper
         steps={steps}
         currentStep={currentStep}
         setCurrentStep={setCurrentStep}
      />
   )
}

export default PersonaliseSteps

import {
  ComponentType,
  createContext, Dispatch,
} from "react";

// Context that every component step should use to access/modify data
export interface IMultiStepContext {
  steps: MultiStepComponentType[]
  currentStep: number,
  setCurrentStep: Dispatch<any>,
  nextStep: () => void,
  previousStep: () => void,
}

export const MultiStepContext = createContext<IMultiStepContext>(null)

const MultiStepWrapper = ({steps, currentStep, setCurrentStep, componentData}: Props) => {

  const context: IMultiStepContext = {
    steps,
    currentStep,
    setCurrentStep: setCurrentStep,
    nextStep: () => setCurrentStep(prevStep => {
      return prevStep + 1 >= steps.length ? prevStep : ++prevStep;
    }),
    previousStep: () => setCurrentStep(prevStep => {
      return prevStep - 1 >= 0 ? --prevStep : prevStep;
    })
  }

  const Component = steps[currentStep].component(componentData)

  return (
    <MultiStepContext.Provider value={context}>
      <Component/>
    </MultiStepContext.Provider>
  )
}

type Props = {
  steps: MultiStepComponentType[],
  currentStep: number,
  setCurrentStep: Dispatch<any>,
  componentData?: any
}

export type MultiStepComponentType = {
  component: (condition?: boolean) => ComponentType
  description: string
}

export default MultiStepWrapper

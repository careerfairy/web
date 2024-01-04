import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import useSparksB2BOnboardingCompletion from "./useSparksB2BOnboardingCompletion"
import { useAuth } from "HOCs/AuthProvider"

export type OnboardingStep = {
   stepLabel: string
   view: ReactNode
}

const steps = [
   {
      stepLabel: "Welcome to Sparks",
      view: <div>Step 1</div>,
   },
   {
      stepLabel: "Tutorial",
      view: <div>Step 2</div>,
   },
   {
      stepLabel: "Your free trial",
      view: <div>Step 3</div>,
   },
] satisfies OnboardingStep[]

export type OnboardingContextType = {
   activeStep: number
   handleNext: () => void
   handleBack: () => void
   completeOnboarding: () => void
   isCompletingOnboarding: boolean
   steps: OnboardingStep[]
}

export const OnboardingContext = createContext<
   OnboardingContextType | undefined
>(undefined)

type OnboardingProviderProps = {
   children: ReactNode
}

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
   const { userData } = useAuth()

   const [activeStep, setActiveStep] = useState(0)

   const handleNext = useCallback(() => {
      if (activeStep < steps.length - 1) {
         setActiveStep((prevStep) => prevStep + 1)
      }
   }, [activeStep])

   const handleBack = useCallback(() => {
      if (activeStep > 0) {
         setActiveStep((prevStep) => prevStep - 1)
      }
   }, [activeStep])

   const { trigger: completeOnboarding, isMutating: isCompletingOnboarding } =
      useSparksB2BOnboardingCompletion(userData.id)

   const value = useMemo<OnboardingContextType>(
      () => ({
         activeStep,
         handleNext,
         handleBack,
         steps,
         completeOnboarding,
         isCompletingOnboarding,
      }),
      [
         activeStep,
         handleNext,
         handleBack,
         completeOnboarding,
         isCompletingOnboarding,
      ]
   )

   return (
      <OnboardingContext.Provider value={value}>
         {children}
      </OnboardingContext.Provider>
   )
}

export const useOnboarding = (): OnboardingContextType => {
   const context = useContext(OnboardingContext)
   if (context === undefined) {
      throw new Error("useOnboarding must be used within a OnboardingProvider")
   }
   return context
}

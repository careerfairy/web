import { useAuth } from "HOCs/AuthProvider"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import useSparksB2BOnboardingCompletion from "./useSparksB2BOnboardingCompletion"
import FreeTrial from "./views/FreeTrial"
import Tutorial from "./views/Tutorial"
import Welcome from "./views/Welcome"

export type OnboardingStep = {
   stepLabel: string
   view: ReactNode
}

const steps = [
   {
      stepLabel: "Welcome to Sparks",
      view: <Welcome />,
   },
   {
      stepLabel: "Tutorial",
      view: <Tutorial />,
   },
   {
      stepLabel: "Your free trial",
      view: <FreeTrial />,
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
   const { push, pathname } = useRouter()
   const [activeStep, setActiveStep] = useState(0)
   const { group } = useGroup()

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

   const handleCompleteOnboarding = useCallback(() => {
      completeOnboarding().then(() => {
         // redirect to get started with sparks content creation onboarding only if they are not already on that page
         if (pathname !== "/group/[groupId]/admin/content/sparks") {
            push(`/group/${group.id}/admin/content/sparks`, undefined, {
               shallow: true,
               scroll: false,
            })
         }
      })
   }, [completeOnboarding, group?.id, pathname, push])

   const value = useMemo<OnboardingContextType>(
      () => ({
         activeStep,
         handleNext,
         handleBack,
         steps,
         completeOnboarding: handleCompleteOnboarding,
         isCompletingOnboarding,
      }),
      [
         activeStep,
         handleNext,
         handleBack,
         handleCompleteOnboarding,
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

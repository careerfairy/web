import React, {
   createContext,
   useCallback,
   useEffect,
   useMemo,
   useReducer,
   useState,
} from "react"
import GroupsUtil from "../../data/util/GroupsUtil"
import { useFirebaseService } from "../firebase/FirebaseServiceContext"
import { useAuth } from "../../HOCs/AuthProvider"
import StatsUtil from "../../data/util/StatsUtil"
import useInfiniteScrollServer from "../../components/custom-hook/useInfiniteScrollServer"
import {
   LivestreamEvent,
   LivestreamGroupQuestionsMap,
   LivestreamQuestion,
} from "@careerfairy/shared-lib/dist/livestreams"
import { Group, GroupWithPolicy } from "@careerfairy/shared-lib/dist/groups"
import { dataLayerLivestreamEvent } from "../../util/analyticsUtils"
import { errorLogAndNotify } from "../../util/CommonUtil"
import { livestreamRepo, userRepo } from "data/RepositoryInstances"
import { recommendationServiceInstance } from "data/firebase/RecommendationService"
import { sparkService } from "../../data/firebase/SparksService"

type Variants = "standard"
type Margins = "normal"

// Applied to all fields
const variant: Variants = "standard"
const margin: Margins = "normal"

interface DefaultContext {
   activeStep: number
   handleNext: () => void
   handleBack: () => void
   handleClose: () => void
   handleGoToLast: () => void
   handleSkipNext: () => void
   variant: Variants
   margin: Margins
   livestream: LivestreamEvent
   group?: Group
   getMore: () => Promise<void>
   groups?: Group[]
   hasMore: boolean
   setGroup: (group: Group) => void
   setSliding: (sliding: boolean) => void
   sliding: boolean
   questions: LivestreamQuestion[]
   handleClientSideQuestionUpdate: <T>(docId: string, updateData: T) => void
   groupsWithPolicies: GroupWithPolicy[]
   hasAgreedToAll: boolean
   completeRegistrationProcess: (
      userAnsweredLivestreamGroupQuestions: LivestreamGroupQuestionsMap
   ) => Promise<void>
   promptOtherEventsOnFinal: boolean
   totalSteps: number
   setTotalSteps: (totalSteps: number) => void
   questionSortType: "timestamp" | string
   handleChangeQuestionSortType: (
      event: Event,
      questionSortType: "timestamp"
   ) => void
   onQuestionsAnswered: (...any) => void
   onFinish: () => void
   loadingInitialQuestions: boolean
   gettingPolicyStatus: boolean
   cancelable: boolean
}

export const RegistrationContext = createContext<DefaultContext>({
   activeStep: 0,
   handleNext() {},
   handleBack() {},
   handleClose() {},
   handleGoToLast() {},
   handleSkipNext() {},
   variant,
   margin,
   questions: [],
   livestream: null,
   group: null,
   groups: [],
   hasMore: true,
   getMore: async () => {},
   setGroup() {},
   setSliding() {},
   sliding: false,
   handleClientSideQuestionUpdate() {},
   groupsWithPolicies: [],
   hasAgreedToAll: false,
   async completeRegistrationProcess() {},
   promptOtherEventsOnFinal: false,
   totalSteps: 0,
   setTotalSteps() {},
   questionSortType: "timestamp",
   handleChangeQuestionSortType() {},
   onQuestionsAnswered() {},
   onFinish() {},
   loadingInitialQuestions: false,
   gettingPolicyStatus: false,
   cancelable: false,
})

function reducer(state, action) {
   switch (action.type) {
      case "increase":
         return {
            ...state,
            activeStep: state.activeStep + 1,
         }
      case "skip-next":
         return {
            ...state,
            activeStep: state.activeStep + 2,
         }
      case "decrease":
         return {
            ...state,
            activeStep: state.activeStep - 1,
         }
      case "set-step":
         return {
            ...state,
            activeStep: action.payload,
         }
      case "set-group":
         return {
            ...state,
            group: action.payload,
         }
      case "set-total-steps":
         return {
            ...state,
            totalSteps: action.payload,
         }
      case "set-policy-groups":
         return {
            ...state,
            groupsWithPolicies: action.payload,
         }
      case "set-has-agreed-to-all":
         return {
            ...state,
            hasAgreedToAll: action.payload,
         }
      default:
         return state
   }
}

type Props = {
   children: React.ReactNode
   groups?: Group[]
   livestream?: LivestreamEvent
   closeModal?: () => void
   promptOtherEventsOnFinal?: boolean
   onQuestionsAnswered?: (...any) => void
   onFinish?: () => void
   cancelable?: boolean
   targetGroupId?: string
   isRecommended?: boolean
}
export function RegistrationContextProvider({
   children,
   groups,
   livestream,
   closeModal,
   promptOtherEventsOnFinal,
   onQuestionsAnswered,
   onFinish,
   cancelable,
   targetGroupId,
   isRecommended = false,
}: Props) {
   const {
      checkIfUserAgreedToGroupPolicy,
      sendRegistrationConfirmationEmail,
      registerToLivestream,
      livestreamQuestionsQuery,
   } = useFirebaseService()
   const { authenticatedUser, userData, userStats } = useAuth()
   const [sliding, setSliding] = useState(false)
   const [gettingPolicyStatus, setGettingPolicyStatus] = useState(false)
   const [questionSortType, setQuestionSortType] = useState("timestamp")
   const [
      { activeStep, group, groupsWithPolicies, hasAgreedToAll, totalSteps },
      dispatch,
   ] = useReducer(reducer, {
      activeStep: 0,
      group: {},
      groupsWithPolicies: [],
      hasAgreedToAll: false,
      totalSteps: 0,
   })

   useEffect(() => {
      if (userData?.authId && !userStats?.hasRegisteredOnAnyLivestream) {
         ;(async () => {
            try {
               const isUserRegisterOnAnyLivestream =
                  await livestreamRepo.isUserRegisterOnAnyLivestream(
                     userData.authId
                  )
               // TODO: replace this with a livestreamRegistrations counter field on the userStats
               await userRepo.updateUserHasRegisteredToAnyLivestreamEver(
                  userData.userEmail,
                  isUserRegisterOnAnyLivestream
               )
            } catch (error) {
               errorLogAndNotify(error, {
                  message: `Not able to very if ${userData.userEmail} has registered to any Livestream`,
               })
            }
         })()
      }
   }, [
      userData?.authId,
      userData?.userEmail,
      userStats?.hasRegisteredOnAnyLivestream,
   ])

   const questionsQuery = useMemo(() => {
      // prevent an extra query for the questions if they are disabled
      if (livestream?.questionsDisabled) {
         return null
      }

      return (
         livestream && livestreamQuestionsQuery(livestream.id, questionSortType)
      )
   }, [livestream, livestreamQuestionsQuery, questionSortType])

   const {
      docs,
      hasMore,
      getMore,
      loadingInitial: loadingInitialQuestions,
      handleClientUpdate: handleClientSideQuestionUpdate,
   } = useInfiniteScrollServer({
      limit: 8,
      query: questionsQuery,
   })

   // Proceed to next step
   const handleNext = () => dispatch({ type: "increase" })
   // Go back to prev step
   const handleBack = () => dispatch({ type: "decrease" })
   const handleGoToLast = useCallback(
      () =>
         dispatch({
            type: "set-step",
            payload: totalSteps ? totalSteps - 1 : 0,
         }),
      [totalSteps]
   )

   const handleSkipNext = () => dispatch({ type: "skip-next" })

   const handleClose = useCallback(() => {
      closeModal()
      dispatch({ type: "set-step", payload: 0 })
   }, [closeModal])

   const handleChangeQuestionSortType = (event, newSortType) => {
      if (newSortType !== null) {
         setQuestionSortType(newSortType)
      }
   }
   const setGroup = (group) =>
      dispatch({ type: "set-group", payload: { ...group } || {} })

   const setTotalSteps = useCallback(
      (totalAmountOfSteps) =>
         dispatch({
            type: "set-total-steps",
            payload: totalAmountOfSteps || 0,
         }),
      []
   )
   const setPolicyGroups = (policyGroups) =>
      dispatch({ type: "set-policy-groups", payload: policyGroups || [] })

   const setHasAgreedToAll = (hasAgreedToAll) =>
      dispatch({ type: "set-has-agreed-to-all", payload: hasAgreedToAll })

   useEffect(() => {
      if (groups && groups.length) {
         if (groups.length === 1) {
            setGroup(groups[0])
            return
         }
         let targetGroup
         if (targetGroupId) {
            targetGroup = groups.find((group) => group.id === targetGroupId)
         }
         if (targetGroup) {
            setGroup(targetGroup)
         } else {
            const groupUserBelongsTo = StatsUtil.getGroupThatStudentBelongsTo(
               userData,
               groups
            )
            if (groupUserBelongsTo) {
               setGroup(groupUserBelongsTo)
            }
         }
      } else {
         setGroup({})
      }
   }, [groups])

   useEffect(() => {
      ;(async function () {
         if (groups?.length) {
            setGettingPolicyStatus(true)
            const { hasAgreedToAll, groupsWithPolicies } =
               await GroupsUtil.getPolicyStatus(
                  groups,
                  authenticatedUser.email,
                  checkIfUserAgreedToGroupPolicy
               )
            setPolicyGroups(groupsWithPolicies)
            setHasAgreedToAll(hasAgreedToAll)
         } else {
            setPolicyGroups([])
            setHasAgreedToAll(false)
         }
         setGettingPolicyStatus(false)
      })()
   }, [groups])

   const handleSendConfirmEmail = useCallback(
      () =>
         sendRegistrationConfirmationEmail(
            authenticatedUser,
            userData,
            livestream
         ),
      [
         authenticatedUser,
         livestream,
         sendRegistrationConfirmationEmail,
         userData,
      ]
   )

   const completeRegistrationProcess = useCallback(
      async (
         userAnsweredLivestreamGroupQuestions: LivestreamGroupQuestionsMap
      ) => {
         try {
            if (livestream) {
               await registerToLivestream(
                  livestream.id,
                  userData,
                  groupsWithPolicies,
                  userAnsweredLivestreamGroupQuestions,
                  {
                     isRecommended,
                  }
               )
               dataLayerLivestreamEvent(
                  "event_registration_complete",
                  livestream
               )

               // after registration, remove from this user's sparks notification the existing notification related to this event
               await sparkService.removeAndSyncUserSparkNotification({
                  userId: userData.userEmail,
                  groupId: livestream.author.groupId,
               })

               // Increase livestream popularity
               recommendationServiceInstance.registerEvent(livestream, userData)
            }
            handleSendConfirmEmail().catch((e) =>
               errorLogAndNotify(e, {
                  message: "Failed to send confirmation email",
                  user: authenticatedUser,
                  livestream,
               })
            )
         } catch (e) {
            errorLogAndNotify(e, {
               message: "Error registering to livestream",
               user: authenticatedUser,
               livestream,
            })
         }
         if (livestream) {
            // Go to booking step...
            return handleNext()
         } else {
            return handleClose()
         }
      },
      [
         authenticatedUser,
         groupsWithPolicies,
         handleClose,
         handleSendConfirmEmail,
         isRecommended,
         livestream,
         registerToLivestream,
         userData,
      ]
   )

   const contextValues = useMemo(() => {
      return {
         activeStep,
         handleNext,
         totalSteps,
         handleBack,
         variant,
         margin,
         group,
         groups,
         setGroup,
         groupsWithPolicies,
         hasAgreedToAll,
         questions: docs,
         hasMore,
         getMore,
         handleClientSideQuestionUpdate,
         livestream,
         handleClose,
         completeRegistrationProcess,
         handleSkipNext,
         setTotalSteps,
         sliding,
         setSliding,
         handleGoToLast,
         promptOtherEventsOnFinal,
         gettingPolicyStatus,
         handleChangeQuestionSortType,
         questionSortType,
         loadingInitialQuestions,
         onFinish,
         onQuestionsAnswered,
         cancelable,
      }
   }, [
      activeStep,
      cancelable,
      completeRegistrationProcess,
      docs,
      getMore,
      gettingPolicyStatus,
      group,
      groups,
      groupsWithPolicies,
      handleClientSideQuestionUpdate,
      handleClose,
      handleGoToLast,
      hasAgreedToAll,
      hasMore,
      livestream,
      loadingInitialQuestions,
      onFinish,
      onQuestionsAnswered,
      promptOtherEventsOnFinal,
      questionSortType,
      setTotalSteps,
      sliding,
      totalSteps,
   ])

   return (
      <RegistrationContext.Provider value={contextValues}>
         {children}
      </RegistrationContext.Provider>
   )
}

import React, {
   createContext,
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

// Applied to all fields
const variant = "standard"
const margin = "normal"

export const RegistrationContext = createContext({
   activeStep: 0,
   handleChange() {},
   handleNext() {},
   handleBack() {},
   handleClose() {},
   handleGoToLast() {},
   handleSkipNext() {},
   variant,
   margin,
   livestream: null,
   group: {},
   groups: [],
   setGroup() {},
   setSliding() {},
   sliding: false,
   handleClientSideQuestionUpdate() {},
   groupsWithPolicies: [],
   hasAgreedToAll: false,
   verifyResumeRequirement() {},
   completeRegistrationProcess() {},
   labels: [],
   promptOtherEventsOnFinal: false,
   totalSteps: 0,
   questionSortType: "timestamp",
   handleChangeQuestionSortType() {},
   onGroupJoin() {},
   onFinish() {},
   loadingInitialQuestions: false,
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

export function RegistrationContextProvider({
   children,
   groups,
   livestream,
   closeModal,
   promptOtherEventsOnFinal,
   onGroupJoin,
   onFinish,
   cancelable,
   targetGroupId,
}) {
   const {
      checkIfUserAgreedToGroupPolicy,
      registerToLivestream,
      sendRegistrationConfirmationEmail,
      livestreamQuestionsQuery,
   } = useFirebaseService()
   const { authenticatedUser, userData } = useAuth()
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
   const questionsQuery = useMemo(() => {
      // prevent an extra query for the questions if they are disabled
      if (livestream?.questionsDisabled) {
         return null
      }

      return (
         livestream && livestreamQuestionsQuery(livestream.id, questionSortType)
      )
   }, [livestream?.id, livestream?.questionsDisabled, questionSortType])

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
   const handleGoToLast = () =>
      dispatch({ type: "set-step", payload: totalSteps ? totalSteps - 1 : 0 })

   const handleSkipNext = () => dispatch({ type: "skip-next" })

   const handleClose = () => {
      closeModal()
      dispatch({ type: "set-step", payload: 0 })
   }

   const handleChangeQuestionSortType = (event, newSortType) => {
      if (newSortType !== null) {
         setQuestionSortType(newSortType)
      }
   }
   const setGroup = (group) => {
      let newGroup = { ...group }
      if (group?.categories?.length) {
         // filter out hidden categories if any
         newGroup = {
            ...group,
            categories: group.categories.filter((cat) => !cat.hidden),
         }
      }
      return dispatch({ type: "set-group", payload: newGroup || {} })
   }
   const setTotalSteps = (totalAmountOfSteps) =>
      dispatch({ type: "set-total-steps", payload: totalAmountOfSteps || 0 })
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

   const verifyResumeRequirement = () => {
      if (livestream) {
         if (!livestream.withResume) {
            handleNext()
         }
      } else {
         handleNext()
      }
   }

   const completeRegistrationProcess = async () => {
      try {
         if (livestream) {
            await registerToLivestream(
               livestream.id,
               authenticatedUser,
               groupsWithPolicies
            )
         }
         handleSendConfirmEmail()
      } catch (e) {}
      if (livestream) {
         // Go to booking step...
         handleNext()
      } else {
         handleClose()
      }
   }

   const handleSendConfirmEmail = () =>
      sendRegistrationConfirmationEmail(authenticatedUser, userData, livestream)

   return (
      <RegistrationContext.Provider
         value={{
            activeStep,
            handleNext,
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
            verifyResumeRequirement,
            completeRegistrationProcess,
            handleSkipNext,
            setTotalSteps,
            sliding,
            setSliding,
            handleGoToLast,
            promptOtherEventsOnFinal,
            alreadyJoined: Boolean(userData?.groupIds?.includes(group?.id)),
            gettingPolicyStatus,
            handleChangeQuestionSortType,
            questionSortType,
            loadingInitialQuestions,
            onFinish,
            onGroupJoin,
            cancelable,
         }}
      >
         {children}
      </RegistrationContext.Provider>
   )
}

import React, { createContext, useEffect, useReducer, useState } from "react";
import GroupsUtil from "../../data/util/GroupsUtil";
import { useFirebase } from "../firebase";
import { useAuth } from "../../HOCs/AuthProvider";
import { useRouter } from "next/router";
import StatsUtil from "../../data/util/StatsUtil";
import useInfiniteScrollServer from "../../components/custom-hook/useInfiniteScrollServer";

// Applied to all fields
const variant = "standard";
const margin = "normal";

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
   completeRegistrationProcess() {},
   labels: [],
   promptOtherEventsOnFinal: false,
   totalSteps: 0,
});

function reducer(state, action) {
   switch (action.type) {
      case "increase":
         return {
            ...state,
            activeStep: state.activeStep + 1,
         };
      case "skip-next":
         return {
            ...state,
            activeStep: state.activeStep + 2,
         };
      case "decrease":
         return {
            ...state,
            activeStep: state.activeStep - 1,
         };
      case "set-step":
         return {
            ...state,
            activeStep: action.payload,
         };
      case "set-group":
         return {
            ...state,
            group: action.payload,
         };
      case "set-total-steps":
         return {
            ...state,
            totalSteps: action.payload,
         };
      case "set-policy-groups":
         return {
            ...state,
            groupsWithPolicies: action.payload,
         };
      case "set-has-agreed-to-all":
         return {
            ...state,
            hasAgreedToAll: action.payload,
         };
      default:
         return state;
   }
}

export function RegistrationContextProvider({
   children,
   groups,
   livestream,
   closeModal,
   promptOtherEventsOnFinal,
}) {
   const {
      checkIfUserAgreedToGroupPolicy,
      registerToLivestream,
      sendRegistrationConfirmationEmail,
      livestreamQuestionsQuery,
   } = useFirebase();
   const {
      query: { referrerId },
   } = useRouter();
   const { authenticatedUser, userData } = useAuth();
   const [sliding, setSliding] = useState(false);

   const [
      { activeStep, group, groupsWithPolicies, hasAgreedToAll, totalSteps },
      dispatch,
   ] = useReducer(reducer, {
      activeStep: 0,
      group: {},
      groupsWithPolicies: [],
      hasAgreedToAll: false,
      totalSteps: 0,
   });

   const {
      docs,
      hasMore,
      getMore,
      handleClientUpdate: handleClientSideQuestionUpdate,
   } = useInfiniteScrollServer({
      limit: 8,
      query: livestream && livestreamQuestionsQuery(livestream?.id),
   });

   // Proceed to next step
   const handleNext = () => dispatch({ type: "increase" });
   // Go back to prev step
   const handleBack = () => dispatch({ type: "decrease" });
   const handleGoToLast = () =>
      dispatch({ type: "set-step", payload: totalSteps ? totalSteps - 1 : 0 });

   const handleSkipNext = () => dispatch({ type: "skip-next" });

   const handleClose = () => {
      closeModal();
      dispatch({ type: "set-step", payload: 0 });
   };

   const setGroup = (group) =>
      dispatch({ type: "set-group", payload: group || {} });
   const setTotalSteps = (totalAmountOfSteps) =>
      dispatch({ type: "set-total-steps", payload: totalAmountOfSteps || 0 });
   const setPolicyGroups = (policyGroups) =>
      dispatch({ type: "set-policy-groups", payload: policyGroups || [] });
   const setHasAgreedToAll = (hasAgreedToAll) =>
      dispatch({ type: "set-has-agreed-to-all", payload: hasAgreedToAll });

   useEffect(() => {
      if (groups && groups.length) {
         let targetGroup;
         targetGroup =
            StatsUtil.getGroupThatStudentBelongsTo(userData, groups) ||
            groups[0];
         setGroup(targetGroup);
      } else {
         setGroup({});
      }
   }, [groups]);

   useEffect(() => {
      (async function () {
         if (groups?.length) {
            const {
               hasAgreedToAll,
               groupsWithPolicies,
            } = await GroupsUtil.getPolicyStatus(
               groups,
               authenticatedUser.email,
               checkIfUserAgreedToGroupPolicy
            );
            setPolicyGroups(groupsWithPolicies);
            setHasAgreedToAll(hasAgreedToAll);
         } else {
            setPolicyGroups([]);
            setHasAgreedToAll(false);
         }
      })();
   }, [groups]);

   const completeRegistrationProcess = async () => {
      try {
         if (livestream) {
            await registerToLivestream(
               livestream.id,
               userData,
               groupsWithPolicies,
               referrerId
            );
         }
         handleSendConfirmEmail();
      } catch (e) {}
      if (livestream) {
         // Go to booking step...
         handleNext();
      } else {
         handleClose();
      }
   };

   const handleSendConfirmEmail = () =>
      sendRegistrationConfirmationEmail(
         authenticatedUser,
         userData,
         livestream
      );

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
            completeRegistrationProcess,
            handleSkipNext,
            setTotalSteps,
            sliding,
            setSliding,
            handleGoToLast,
            promptOtherEventsOnFinal,
            alreadyJoined: Boolean(userData?.groupIds?.includes(group?.id)),
         }}
      >
         {children}
      </RegistrationContext.Provider>
   );
}

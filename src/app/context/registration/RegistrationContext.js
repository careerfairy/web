import React, { createContext, useEffect, useReducer } from "react";
import GroupsUtil from "../../data/util/GroupsUtil";
import { useFirebase } from "../firebase";
import { useAuth } from "../../HOCs/AuthProvider";
import { useRouter } from "next/router";
import StatsUtil from "../../data/util/StatsUtil";

// Applied to all fields
const variant = "standard";
const margin = "normal";
const labels = [
   "Select your categories",
   "Add a Question",
   "Upvote questions",
   "Join Talent Pool",
   "Finish",
];

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
   groupsWithPolicies: [],
   hasAgreedToAll: false,
   completeRegistrationProcess() {},
   labels: [],
   promptOtherEventsOnFinal: false,
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
   } = useFirebase();
   const {
      query: { referrerId },
   } = useRouter();
   const { authenticatedUser, userData } = useAuth();
   const [
      { activeStep, group, groupsWithPolicies, hasAgreedToAll },
      dispatch,
   ] = useReducer(reducer, {
      activeStep: 0,
      group: {},
      groupsWithPolicies: [],
      hasAgreedToAll: false,
   });

   // Proceed to next step
   const handleNext = () => dispatch({ type: "increase" });
   // Go back to prev step
   const handleBack = () => dispatch({ type: "decrease" });
   const handleGoToLast = () =>
      dispatch({ type: "set-step", payload: labels.length - 1 });

   const handleSkipNext = () => dispatch({ type: "skip-next" });

   const handleClose = () => {
      closeModal();
      dispatch({ type: "set-step", payload: 0 });
   };

   const setGroup = (group) =>
      dispatch({ type: "set-group", payload: group || {} });
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
            livestream,
            handleClose,
            completeRegistrationProcess,
            labels,
            handleSkipNext,
            handleGoToLast,
            promptOtherEventsOnFinal,
            alreadyJoined: Boolean(userData?.groupIds?.includes(group?.id)),
         }}
      >
         {children}
      </RegistrationContext.Provider>
   );
}

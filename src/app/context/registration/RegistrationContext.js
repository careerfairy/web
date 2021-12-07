import React, { createContext, useEffect, useReducer } from "react";
import GroupsUtil from "../../data/util/GroupsUtil";
import { useFirebase } from "../firebase";
import { useAuth } from "../../HOCs/AuthProvider";
import { useRouter } from "next/router";

// Applied to all fields
const variant = "standard";
const margin = "normal";

export const RegistrationContext = createContext({
   activeStep: 0,
   handleChange() {},
   handleNext() {},
   handleBack() {},
   variant,
   margin,
   livestream: null,
});

function reducer(state, action) {
   switch (action.type) {
      case "increase":
         return {
            ...state,
            activeStep: state.activeStep + 1,
         };
      case "decrease":
         return {
            ...state,
            activeStep: state.activeStep - 1,
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
      case "set-already-joined":
         return {
            ...state,
            alreadyJoined: action.payload,
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
   withBooking,
}) {
   const {
      checkIfUserAgreedToGroupPolicy,
      registerToLivestream,
      sendRegistrationConfirmationEmail,
      deregisterFromLivestream,
   } = useFirebase();
   const {
      query: { referrerId },
      asPath,
      push,
   } = useRouter();
   const { authenticatedUser, userData } = useAuth();
   const [
      { activeStep, group, groupsWithPolicies, alreadyJoined, hasAgreedToAll },
      dispatch,
   ] = useReducer(reducer, {
      activeStep: 0,
      group: {},
      groupsWithPolicies: [],
      hasAgreedToAll: false,
      alreadyJoined: false,
   });

   // Proceed to next step
   const handleNext = () => dispatch({ type: "increase" });
   // Go back to prev step
   const handleBack = () => dispatch({ type: "decrease" });

   const setGroup = (group) =>
      dispatch({ type: "set-group", payload: group || {} });
   const setPolicyGroups = (policyGroups) =>
      dispatch({ type: "set-policy-groups", payload: policyGroups || [] });
   const setHasAgreedToAll = (hasAgreedToAll) =>
      dispatch({ type: "set-has-agreed-to-all", payload: hasAgreedToAll });
   const setAlreadyJoined = (alreadyJoined) =>
      dispatch({ type: "set-already-joined", payload: alreadyJoined });

   useEffect(() => {
      if (groups && groups.length && groups.length === 1) {
         setGroup(groups[0]);
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

   useEffect(() => {
      const newAlreadyJoined = Boolean(userData.groupIds?.includes(group?.id));
      setAlreadyJoined(newAlreadyJoined);
   }, [group, userData]);

   const completeRegistrationProcess = async () => {
      try {
         await registerToLivestream(
            livestream.id,
            userData,
            groupsWithPolicies,
            referrerId
         );
         handleSendConfirmEmail();
      } catch (e) {}
      if (withBooking) {
         // Go to booking step...
         handleNext();
      } else {
         closeModal();
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
            closeModal,
            completeRegistrationProcess,
            alreadyJoined,
         }}
      >
         {children}
      </RegistrationContext.Provider>
   );
}

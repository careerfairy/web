import React, { memo, useEffect, useRef, useState } from "react";
import { useFirebase } from "context/firebase";
import useStreamRef from "../../../../custom-hook/useStreamRef";
import { useAuth } from "../../../../../HOCs/AuthProvider";

const CallToActionNotifications = ({
   isStreamer,
   currentActiveCallToActionIds,
}) => {
   const { userData } = useAuth();
   const streamRef = useStreamRef();
   const { getCtaIdsThatUserHasNotInteractedWith } = useFirebase();
   const [localCallToActionIds, setLocalCallToActionIds] = useState([]);

   const [callToActionsToCheck, setCallToActionsToCheck] = useState([]);
   // console.log("-> callToActionsToCheck", callToActionsToCheck);

   useEffect(() => {
      if (currentActiveCallToActionIds) {
         setLocalCallToActionIds((prevLocalCallToActionIds) => {
            const newlyActiveCtaIds = getNewlyActiveCtaIds(
               prevLocalCallToActionIds,
               currentActiveCallToActionIds
            );
            if (!isStreamer && userData?.id) {
               handleCheckForCallToActionIds(newlyActiveCtaIds);
            }
            setCallToActionsToCheck(newlyActiveCtaIds);
            return currentActiveCallToActionIds;
         });
      }
   }, [currentActiveCallToActionIds, isStreamer, userData?.id]);

   const getNewlyActiveCtaIds = (prevActiveCtas, newActiveCtas) => {
      if (!prevActiveCtas) return [];
      return (
         newActiveCtas?.filter((ctaId) => !prevActiveCtas.includes(ctaId)) || []
      );
   };

   const handleCheckForCallToActionIds = async (arrayOfCtaIds) => {
      // debugger
      if (!arrayOfCtaIds?.length) return;
      await getCtaIdsThatUserHasNotInteractedWith(
         streamRef,
         arrayOfCtaIds,
         userData.id
      );
   };

   return <div></div>;
};

export default memo(CallToActionNotifications);

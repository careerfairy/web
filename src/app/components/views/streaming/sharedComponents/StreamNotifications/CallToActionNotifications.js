import React, { memo, useEffect, useState } from "react";
import { useFirebase } from "context/firebase";
import useStreamRef from "../../../../custom-hook/useStreamRef";
import { useAuth } from "../../../../../HOCs/AuthProvider";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import { makeExternalLink } from "../../../../helperFunctions/HelperFunctions";

import CallToActionSnackbar from "./CallToActionSnackbar";
import { callToActionsIconsDictionary } from "../../../../util/constants/callToActions";
import { useCurrentStream } from "../../../../../context/stream/StreamContext";

const CallToActionNotifications = ({
   isStreamer,
   currentActiveCallToActionIds,
}) => {
   const { currentLivestream } = useCurrentStream();
   const { userData, authenticatedUser } = useAuth();
   const dispatch = useDispatch();
   const streamRef = useStreamRef();
   const {
      getCtaIdsThatUserHasNotInteractedWith,
      getCallToActionsWithAnArrayOfIds,
      dismissCallToAction,
      clickOnCallToAction,
   } = useFirebase();
   const [dismissing, setDismissing] = useState(false);
   const [engaging, setEngaging] = useState(false);
   const loading = Boolean(dismissing || engaging);
   const isLoggedOut = authenticatedUser.isLoaded && authenticatedUser.isEmpty;
   const [localCallToActionIds, setLocalCallToActionIds] = useState([]);

   const [callToActionsToCheck, setCallToActionsToCheck] = useState([]);

   useEffect(() => {
      (async function handleCheckAndEnqueueActiveCallToActions() {
         if (currentActiveCallToActionIds && !isStreamer) {
            setLocalCallToActionIds((prevLocalCallToActionIds) => {
               const newlyActiveCtaIds = getNewlyActiveCtaIds(
                  prevLocalCallToActionIds,
                  currentActiveCallToActionIds
               );
               if (
                  !isStreamer &&
                  (userData?.id ||
                    (isLoggedOut && currentLivestream?.test)
                    // Actively Check for CTAs when logged in, or when logged out during a test stream
                  )
               ) {
                  handleCheckForCallToActionIds(newlyActiveCtaIds);
               }
               setCallToActionsToCheck(newlyActiveCtaIds);
               return currentActiveCallToActionIds;
            });
         }
      })();
   }, [currentActiveCallToActionIds, isStreamer]);

   useEffect(() => {
      // Only check for call to actions on page load if you're logged in
      (async function handleCheckForInitialActiveCtasOnMount() {
         if (!isStreamer && userData?.id) {
            await handleCheckForCallToActionIds(currentActiveCallToActionIds);
         }
      })();
   }, [isStreamer, userData?.id]);

   const handleDismissCallToAction = async (callToActionId) => {
      setDismissing(true);
      try {
         await dismissCallToAction(streamRef, callToActionId, userData?.id);
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
      dispatch(actions.closeSnackbar(callToActionId));
      setDismissing(false);
   };
   const handleClickCallToAction = async (callToActionId, buttonUrl) => {
      setEngaging(true);
      try {
         await clickOnCallToAction(streamRef, callToActionId, userData?.id);
         if (window) {
            window.open(buttonUrl, "_blank");
            // .focus() DOnt know if we should focus the new tab automatically
         }
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
      dispatch(actions.closeSnackbar(callToActionId));
      setEngaging(false);
   };

   const getNewlyActiveCtaIds = (prevActiveCtas, newActiveCtas) => {
      if (!prevActiveCtas) return [];
      return (
         newActiveCtas?.filter((ctaId) => !prevActiveCtas.includes(ctaId)) || []
      );
   };

   const handleCheckForCallToActionIds = async (arrayOfCtaIds) => {
      if (!arrayOfCtaIds?.length) return;
      const newCallToActionIds = await getCtaIdsThatUserHasNotInteractedWith(
         streamRef,
         arrayOfCtaIds,
         userData?.id
      );
      if (newCallToActionIds.length) {
         const callToActionsData = await getCallToActionsWithAnArrayOfIds(
            streamRef,
            newCallToActionIds
         );

         callToActionsData.forEach((callToAction) => {
            const message = callToAction.message || "";
            const buttonText = callToAction.buttonText || "Click here";
            const buttonUrl = callToAction.buttonUrl
               ? makeExternalLink(callToAction.buttonUrl)
               : "https://careerfairy.io/";
            const callToActionId = callToAction.id;
            const type = callToAction.type;
            const jobData = callToAction.jobData || null

            const jobTitle = callToAction.jobData?.jobTitle || ""
            const salary = callToAction.jobData?.salary || ""
            const applicationDeadline = callToAction.jobData?.applicationDeadline?.toDate?.() || null
            const snackBarImage = callToAction.imageUrl || currentLivestream.backgroundImageUrl

            dispatch(
               actions.enqueueCallToAction({
                  message,
                  callToActionId,
                  content: (
                     <CallToActionSnackbar
                        onClick={() =>
                           handleClickCallToAction(callToActionId, buttonUrl)
                        }
                        onDismiss={() =>
                           handleDismissCallToAction(callToActionId)
                        }
                        icon={
                           callToActionsIconsDictionary[type]?.icon ||
                           callToActionsIconsDictionary.custom.icon
                        }
                        buttonText={buttonText}
                        jobTitle={jobTitle}
                        salary={salary}
                        snackBarImage={snackBarImage}
                        applicationDeadline={applicationDeadline}
                        isJobPosting={type === "jobPosting"}
                        loading={loading}
                        message={message}
                     />
                  ),
               })
            );
         });
      }
   };

   return null;
};

export default memo(CallToActionNotifications);

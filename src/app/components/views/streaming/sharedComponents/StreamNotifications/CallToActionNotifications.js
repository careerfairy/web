import React, { memo, useEffect, useState } from "react";
import { useFirebase } from "context/firebase";
import useStreamRef from "../../../../custom-hook/useStreamRef";
import { useAuth } from "../../../../../HOCs/AuthProvider";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";

import CallToActionSnackbar from "./CallToActionSnackbar";
import { getCtaSnackBarProps } from "../../../../util/constants/callToActions";
import { useCurrentStream } from "../../../../../context/stream/StreamContext";
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions";

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
  const viewerCallToActionModalOpen = useSelector(
    (state) => state.stream.layout.viewerCtaModalOpen
  );

  const [dismissing, setDismissing] = useState(false);
  const [engaging, setEngaging] = useState(false);
  const loading = Boolean(dismissing || engaging);
  const isLoggedOut = authenticatedUser.isLoaded && authenticatedUser.isEmpty;
  const [localCallToActionIds, setLocalCallToActionIds] = useState([]);

  useEffect(() => {
    if (viewerCallToActionModalOpen) return;
    (async function handleCheckAndEnqueueActiveCallToActions() {
      if (currentActiveCallToActionIds && !isStreamer) {
        setLocalCallToActionIds((prevLocalCallToActionIds) => {
          const newlyActiveCtaIds = getNewlyActiveCtaIds(
            prevLocalCallToActionIds,
            currentActiveCallToActionIds
          );
          if (
            !viewerCallToActionModalOpen &&
            !isStreamer &&
            (userData?.id || (isLoggedOut && currentLivestream?.test))
            // Actively Check for CTAs when logged in, or when logged out during a test stream
          ) {
            handleCheckForCallToActionIds(newlyActiveCtaIds);
          }
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
        const {
          icon,
          buttonUrl,
          buttonText,
          callToActionId,
          salary,
          applicationDeadline,
          snackBarImage,
          message,
          jobTitle,
          isJobPosting,
        } = getCtaSnackBarProps(
          callToAction,
          getResizedUrl(currentLivestream.companyLogoUrl, "md")
        );

        dispatch(
          actions.enqueueCallToAction({
            message,
            callToActionId,
            content: (
              <CallToActionSnackbar
                onClick={() =>
                  handleClickCallToAction(callToActionId, buttonUrl)
                }
                onDismiss={() => handleDismissCallToAction(callToActionId)}
                icon={icon}
                buttonText={buttonText}
                jobTitle={jobTitle}
                salary={salary}
                snackBarImage={snackBarImage}
                applicationDeadline={applicationDeadline}
                isJobPosting={isJobPosting}
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

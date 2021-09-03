import React, { useContext, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import useStreamQuery from "../../../../custom-hook/useQuery";
import { isEmpty, isLoaded, useFirestoreConnect } from "react-redux-firebase";
import { createSelector } from "reselect";
import { Box, CircularProgress, Typography } from "@material-ui/core";
import { useFirebase } from "../../../../../context/firebase";
import useStreamRef from "../../../../custom-hook/useStreamRef";
import CallToActionItem from "./CallToActionItem";
import TutorialContext from "../../../../../context/tutorials/TutorialContext";

const callToActionSelector = createSelector(
   (state) => state.firestore.ordered["callToActions"],
   (callToActions) => callToActions
);

const CallToActionList = ({
   handleClickEditCallToAction,
   handleClickDeleteCallToAction,
   handleClickResendCallToAction,
   isTestStream,
                             handleClose,
}) => {
   const streamRef = useStreamRef();
   const { handleConfirmStep, isOpen } = useContext(TutorialContext);
   const { activateCallToAction, deactivateCallToAction } = useFirebase();
   const callToActions = useSelector((state) => callToActionSelector(state));
   const [tutorialCtaId, setTutorialCtaId] = useState("");

   const query = useStreamQuery({
      storeAs: "callToActions",
      subcollections: [
         {
            collection: "callToActions",
         },
      ],
      orderBy: ["created", "desc"],
   });
   useFirestoreConnect(query);

   useEffect(() => {
      const targetTutorialCtaId =
         callToActions?.find((cta) => cta.isForTutorial)?.id || "";
      setTutorialCtaId(isOpen(21) ? targetTutorialCtaId : "");
   }, [callToActions, Boolean(isOpen(21))]);

   if (!isLoaded(callToActions)) {
      return <CircularProgress />;
   }

   if (isEmpty(callToActions)) {
      return (
         <Box p={2}>
            <Typography>Add some call to actions</Typography>
         </Box>
      );
   }

   const handleToggleActive = async (callToActionId, active) => {
      if (active) {
         return await deactivateCallToAction(streamRef, callToActionId);
      } else {
         return await activateCallToAction(streamRef, callToActionId);
      }
   };

   return (
      <React.Fragment>
         {callToActions.map((callToAction) => (
            <CallToActionItem
               key={callToAction.id}
               tutorialCtaId={tutorialCtaId}
               isTestStream={isTestStream}
               callToAction={callToAction}
               handleClose={handleClose}
               setTutorialCtaId={setTutorialCtaId}
               handleClickResendCallToAction={handleClickResendCallToAction}
               handleClickEditCallToAction={handleClickEditCallToAction}
               handleClickDeleteCallToAction={handleClickDeleteCallToAction}
               handleToggleActive={handleToggleActive}
            />
         ))}
      </React.Fragment>
   );

   // return (
   //    <div style={{ flex: "1 1 auto" }}>
   //       <AutoSizer>
   //          {({ height, width }) => (
   //             <FixedSizeList
   //                itemSize={200}
   //                itemCount={callToActions.length}
   //                height={height}
   //                width={width}
   //             >
   //                {({ style, index }) => (
   //                   <CallToActionItem
   //                      style={style}
   //                      index={index}
   //                      key={callToActions[index].id}
   //                      itemKey={callToActions[index].id}
   //                      callToAction={callToActions[index]}
   //                      handleClickResendCallToAction={handleClickResendCallToAction}
   //                      handleClickEditCallToAction={handleClickEditCallToAction}
   //                      handleClickDeleteCallToAction={handleClickDeleteCallToAction}
   //                      handleToggleActive={handleToggleActive}
   //                   />
   //                )}
   //             </FixedSizeList>
   //          )}
   //       </AutoSizer>
   //    </div>
   // );
};

export default CallToActionList;

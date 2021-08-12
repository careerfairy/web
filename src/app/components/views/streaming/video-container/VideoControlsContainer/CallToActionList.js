import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import useStreamQuery from "../../../../custom-hook/useQuery";
import { useFirestoreConnect } from "react-redux-firebase";
import { createSelector } from "reselect";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import {
   Button,
   CircularProgress,
   List,
   ListItem,
   ListItemSecondaryAction,
   ListItemText,
   Switch,
   Typography,
} from "@material-ui/core";
import { isEmpty, isLoaded } from "react-redux-firebase";
import { useFirebase } from "../../../../../context/firebase";
import useStreamRef from "../../../../custom-hook/useStreamRef";
import CallToActionItem from "./CallToActionItem";

const useStyles = makeStyles((theme) => ({
   inline: {
      display: 'inline',
   },
}));

const callToActionSelector = createSelector(
   (state) => state.firestore.ordered["callToActions"],
   (callToActions) => callToActions
);

const CallToActionItemTemp = ({
   style,
   callToAction: {
      active,
      id,
      buttonUrl,
      created,
      message,
      numberOfUsersWhoClickedLink,
      numberOfUsersWhoDismissed,
     buttonText
   },
   handleToggleActive,
}) => {
   const classes = useStyles();
   return (
      <ListItem style={style}>
         <ListItemText
            primary={`Button Text: ${buttonText}`}
            secondary={
               <React.Fragment>
                  <Typography
                     component="span"
                     variant="body2"
                     className={classes.inline}
                     color="textPrimary"
                  >
                     Button Message:
                  </Typography>
                  {message}
               </React.Fragment>
            }
         />
         <Button
            color="secondary"
            variant={active ? "outlined" : "contained"}
            onClick={() => {
               handleToggleActive(id, active);
            }}
         >
            {active ? "Send" : "Deactivate"}
         </Button>
      </ListItem>
   );
};
const CallToActionList = ({handleClickEditCallToAction, handleClickDeleteCallToAction}) => {
   const classes = useStyles();
   const streamRef = useStreamRef();
   const { activateCallToAction, deactivateCallToAction } = useFirebase();
   const callToActions = useSelector((state) => callToActionSelector(state));
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

   if (!isLoaded(callToActions)) {
      return <CircularProgress />;
   }

   if (isEmpty(callToActions)) {
      return <Typography>Add some call to actions</Typography>;
   }

   const handleToggleActive = async (callToActionId, active) => {
      if (active) {
         return await deactivateCallToAction(streamRef, callToActionId);
      } else {
         return await activateCallToAction(streamRef, callToActionId);
      }
   };

   // return (
   //   <List>
   //      {callToActions.map(ctaData => (
   //        <CallToActionItem
   //          key={ctaData.id}
   //          callToAction={ctaData}
   //          handleToggleActive={handleToggleActive}
   //        />
   //      ))}
   //   </List>
   // )

   return (
      <div style={{ flex: "1 1 auto" }}>
         <AutoSizer>
            {({ height, width }) => (
               <FixedSizeList
                  itemSize={218}
                  itemCount={callToActions.length}
                  height={height}
                  width={width}
               >
                  {({ style, index }) => (
                     <CallToActionItem
                        style={style}
                        index={index}
                        key={callToActions[index].id}
                        callToAction={callToActions[index]}
                        handleClickEditCallToAction={handleClickEditCallToAction}
                        handleClickDeleteCallToAction={handleClickDeleteCallToAction}
                        handleToggleActive={handleToggleActive}
                     />
                  )}
               </FixedSizeList>
            )}
         </AutoSizer>
      </div>
   );
};

export default CallToActionList;

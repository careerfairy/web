import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import useStreamQuery from "../../../../custom-hook/useQuery";
import { useFirestoreConnect } from "react-redux-firebase";
import { createSelector } from "reselect";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import {
   CircularProgress, List,
   ListItem,
   ListItemSecondaryAction,
   ListItemText,
   Switch,
   Typography
} from "@material-ui/core";
import { isEmpty, isLoaded } from "react-redux-firebase";
import { useFirebase } from "../../../../../context/firebase";
import useStreamRef from "../../../../custom-hook/useStreamRef";

const useStyles = makeStyles((theme) => ({}));

const callToActionSelector = createSelector(
   (state) => state.firestore.ordered["callToActions"],
   (callToActions) => callToActions
);

const CallToActionItem = ({
   style,
   callToAction: {
      active,
      id,
      buttonUrl,
      created,
      message,
      numberOfUsersWhoClickedLink,
      numberOfUsersWhoDismissed,
   },
   handleToggleActive,
}) => {
   return (
      <ListItem style={style}>
         <ListItemText id="" primary="Bluetooth" />
         <ListItemSecondaryAction>
         <Switch
            edge="end"
            title={"Active"}
            onChange={(event) => {
               console.log("-> active in comp", active);
               const checked = event.target.checked;
               console.log("-> checked", checked);
               handleToggleActive(id, active);
            }}
            checked={Boolean(active)}
            inputProps={{ "aria-labelledby": "switch-list-label-bluetooth" }}
         />
         </ListItemSecondaryAction>
      </ListItem>
   );
};
const CallToActionList = ({}) => {
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
      console.log("-> active in method", active);
      if (active) {
      console.log("-> deactivateCallToAction");
         return await deactivateCallToAction(streamRef, callToActionId);
      } else {
      console.log("-> activateCallToAction");
         return await activateCallToAction(streamRef, callToActionId);
      }
   };

   return (
     <List>
        {callToActions.map(ctaData => (
          <CallToActionItem
            key={ctaData.id}
            callToAction={ctaData}
            handleToggleActive={handleToggleActive}
          />
        ))}
     </List>
   )

};

export default CallToActionList;

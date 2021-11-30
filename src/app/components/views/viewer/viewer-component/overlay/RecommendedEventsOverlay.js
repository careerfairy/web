import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useFirebase } from "context/firebase";

const useStyles = makeStyles((theme) => ({
   root: {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor:
         theme.palette.type === "dark"
            ? theme.palette.common.black
            : theme.palette.background.paper,
      zIndex: 999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
   },
}));
const RecommendedEventsOverlay = ({ recommendedEventIds }) => {
   const classes = useStyles();
   const { getEventsWithArrayOfIds } = useFirebase();
   const [recommendedEvents, setRecommendedEvents] = useState([]);
   console.log("-> recommendedEvents", recommendedEvents);
   useEffect(() => {
      if (recommendedEventIds?.length) {
         (async function () {
            try {
               const newRecommendedEvents = await getEventsWithArrayOfIds(
                  recommendedEventIds
               );
               setRecommendedEvents(newRecommendedEvents);
            } catch (e) {
               console.error(e);
            }
         })();
      }
   }, [recommendedEventIds]);

   return <div className={classes.root}>Recommended events!</div>;
};

export default RecommendedEventsOverlay;

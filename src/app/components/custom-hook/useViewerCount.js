import { useState, useEffect } from "react";
import axios from "axios";

export function useViewerCount(livestream) {
   const queryUrl =
      "https://us-central1-careerfairy-e1fd9.cloudfunctions.net/getNumberOfViewers?livestreamId=";
   const [viewerCount, setViewerCount] = useState(0);

   useEffect(() => {
      if (livestream && livestream.id) {
         clearInterval();
         if (livestream.hasStarted) {
            setInterval(() => {
               axios({
                  method: "get",
                  url: queryUrl + livestream.id,
               })
                  .then((response) => {
                     if (response.data.totalWebRTCWatchersCount > -1) {
                        setViewerCount(response.data.totalWebRTCWatchersCount);
                     }
                  })
                  .catch((error) => {
                     console.log(error);
                  });
            }, 10000);
         } else {
            setViewerCount(0);
         }
      }
   }, [livestream, livestream.hasStarted]);

   return viewerCount;
}

import { useEffect, useState } from "react";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";

interface StreamAdminPreferences {}

const useStreamAdminPreferences = (mainStreamId?: string) => {
   const firebase = useFirebaseService();
   const [adminStreamPreferences, setAdminStreamPreferences] =
      useState<StreamAdminPreferences>(undefined);

   useEffect(() => {
      if (mainStreamId) {
         const unsubscribe = firebase.listenToStreamAdminPreferences(
            mainStreamId,
            (snap) => {
               let newPreferences = undefined;
               if (snap.exists) {
                  newPreferences = snap.data();
               }
               setAdminStreamPreferences(newPreferences);
            }
         );

         return () => unsubscribe();
      }
   }, [mainStreamId]);

   return adminStreamPreferences;
};

export default useStreamAdminPreferences;

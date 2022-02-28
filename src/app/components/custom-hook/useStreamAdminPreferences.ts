import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";

interface StreamAdminPreferences {
   isNextGen?: boolean;
}

const useStreamAdminPreferences = () => {
   const {
      query: { livestreamId },
   } = useRouter();
   const firebase = useFirebaseService();
   const [adminStreamPreferences, setAdminStreamPreferences] =
      useState<StreamAdminPreferences>(undefined);

   useEffect(() => {
      const unsubscribe = firebase.listenToStreamAdminPreferences(
         livestreamId,
         (snap) => {
            let newPreferences = undefined;
            if (snap.exists) {
               newPreferences = snap.data();
            }
            setAdminStreamPreferences(newPreferences);
         }
      );

      return () => unsubscribe();
   }, [livestreamId]);

   return adminStreamPreferences;
};

export default useStreamAdminPreferences;

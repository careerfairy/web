import React, { useEffect, useState } from "react";
import { useAuth } from "../../HOCs/AuthProvider";
import { useFirebase } from "../../context/firebase";

const useFollowingGroups = () => {
   const { userData } = useAuth();
   const firebase = useFirebase();
   const [followingGroups, setFollowingGroups] = useState([]);
   const [fetching, setFetching] = useState(false);
   const [error, setError] = useState(null);

   useEffect(() => {
      if (userData?.groupIds?.length) {
         (async function getFollowingGroups() {
            try {
               setFetching(true);
               setError(null);
               const newFollowingGroups = await firebase.getFollowingGroups(
                  userData.groupIds
               );
               setFollowingGroups(newFollowingGroups);
            } catch (e) {
               setError(e);
               console.log("-> e", e);
            }
            setFetching(false);
         })();
      }
   }, [userData?.groupIds]);

   return [followingGroups, fetching, error];
};

export default useFollowingGroups;

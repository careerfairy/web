import React from "react";
import { useSelector } from "react-redux";
import { useFirestore } from "react-redux-firebase";

const useFollowers = (groupId) => {
   const firestore = useFirestore();
   const orderedFollowers = useSelector(
      (state) => state.firestore.ordered?.[`followers of ${groupId}`]?.length
   );
   const [loading, setLoading] = React.useState(false);
   React.useEffect(() => {
      if (!orderedFollowers) {
         (async function getFollowers() {
            setLoading(true);
            console.log("-> getting Followers of ", groupId);
            await firestore.get({
               collection: "userData",
               where: ["groupIds", "array-contains", groupId],
            });
            setLoading(false);
         })();
      }
   }, []);

   return { loading };
};

export default useFollowers;

import React, { useEffect } from "react";
import { useFirestore } from "react-redux-firebase";
import { useSelector } from "react-redux";

const useGetAllGroups = () => {
   const firestore = useFirestore();

   useEffect(() => {
      (async function getAllGroups() {
         await firestore.get({
            collection: "careerCenterData",
         });
      })();
   }, []);

   const ordered = useSelector(
      (state) => state.firestore.ordered["careerCenterData"]
   );
   const map = useSelector((state) => state.firestore.data["careerCenterData"]);

   return [ordered, map];
};

export default useGetAllGroups;

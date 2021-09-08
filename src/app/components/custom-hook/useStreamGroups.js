import React, { useEffect, useState } from "react";
import { useFirebase } from "context/firebase";

const useStreamGroups = (groupIds) => {
   const [careerCenters, setCareerCenters] = useState([]);
   const { getGroupsWithIds } = useFirebase();

   useEffect(() => {
      async function getCareerCenters() {
         try {
            const newCareerCenters = await getGroupsWithIds(groupIds);
            setCareerCenters(newCareerCenters);
         } catch (e) {}
      }

      if (groupIds?.length) {
         getCareerCenters();
      }
   }, [groupIds]);

   return careerCenters;
};

export default useStreamGroups;

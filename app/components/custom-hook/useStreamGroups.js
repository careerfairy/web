import React, { useEffect, useState } from "react"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"

const useStreamGroups = (groupIds) => {
   const [careerCenters, setCareerCenters] = useState([])
   const { getGroupsWithIds } = useFirebaseService()

   useEffect(() => {
      async function getCareerCenters() {
         try {
            const newCareerCenters = await getGroupsWithIds(groupIds)
            setCareerCenters(newCareerCenters)
         } catch (e) {}
      }

      if (groupIds?.length) {
         getCareerCenters()
      }
   }, [groupIds])

   return careerCenters
}

export default useStreamGroups

import { useEffect, useState } from "react"
import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useFirebaseService } from "../../../context/firebase/FirebaseServiceContext"

const useLivestreamHosts = (livestream: LivestreamEvent) => {
   const [hosts, setHosts] = useState<Group[]>([])
   const firebase = useFirebaseService()

   useEffect(() => {
      if (livestream?.groupIds?.length) {
         ;(async function getHosts() {
            const newHosts = await firebase.getCareerCentersByGroupId(
               livestream.groupIds
            )

            setHosts(newHosts)
         })()
      }
   }, [firebase, livestream?.groupIds])

   return hosts
}

export default useLivestreamHosts

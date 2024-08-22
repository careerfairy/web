import { JobApplicationSource } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useRouter } from "next/router"

const useJobApplicationSource = (): JobApplicationSource => {
   const router = useRouter()

   if (router) {
      console.log("🚀 ~ useJobApplicationSource ~ router:", router)
   }
   return "upcomingLivestream"
}

export default useJobApplicationSource

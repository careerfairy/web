import { JobApplicationSource } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useRouter } from "next/router"

const useJobApplicationSource = (): JobApplicationSource => {
   const router = useRouter()

   const pathSegments = router.asPath.split("/")

   const sources: { source: JobApplicationSource; active: boolean }[] = [
      {
         source: "portal",
         active: Boolean(
            pathSegments.find((segment, idx, arr) => {
               return segment === "portal" && !arr.at(idx + 1)
            })
         ),
      },
      {
         source: "livestream",
         active: Boolean(
            pathSegments.find((segment, idx, arr) => {
               return segment === "livestream" && arr.at(idx + 1)
            })
         ),
      },
      {
         source: "spark",
         active: Boolean(
            pathSegments.find((segment, idx, arr) => {
               return segment === "sparks" && arr.at(idx + 1)
            })
         ),
      },
      {
         source: "profile",
         active: Boolean(
            pathSegments.find((segment, idx, arr) => {
               return segment === "profile" && arr.at(idx + 1) === "jobs"
            })
         ),
      },
      {
         source: "companyPage",
         active: Boolean(
            pathSegments.find((segment, idx, arr) => {
               return segment === "company" && arr.at(idx + 1)
            })
         ),
      },
      // TODO-WG: Notifications probably use query string
   ]

   console.log("🚀 ~ useJobApplicationSource ~ router:", pathSegments)
   console.log("🚀 ~ useJobApplicationSource ~ sources:", sources)
   const source = sources.find((s) => s.active)?.source || "portal"
   console.log("🚀 ~ useJobApplicationSource ~ source:", source)
   return "livestream"
}

export default useJobApplicationSource

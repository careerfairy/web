import { useRouter } from "next/router"
import { useEffect } from "react"
import SessionStorageUtil from "../../util/SessionStorageUtil"

const utmParamsKeys = [
   "utm_source",
   "utm_medium",
   "utm_campaign",
   "utm_term",
   "utm_content",
]

const useStoreUTMQueryParams = () => {
   const router = useRouter()

   useEffect(() => {
      const utmParamsFound = {}
      for (let utmParam of utmParamsKeys) {
         if (router.query[utmParam]) {
            utmParamsFound[utmParam] = router.query[utmParam] + "" // convert to string
         }
      }

      if (Object.keys(utmParamsFound).length > 0) {
         SessionStorageUtil.setUTMParams(utmParamsFound)
      }
   }, [router.query])
}

export default useStoreUTMQueryParams

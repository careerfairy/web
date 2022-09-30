import { useRouter } from "next/router"
import { useEffect } from "react"
import SessionStorageUtil from "../../util/SessionStorageUtil"
import { UTMKeys } from "@careerfairy/shared-lib/dist/commonTypes"

const useStoreUTMQueryParams = () => {
   const router = useRouter()

   useEffect(() => {
      const utmParamsFound = {}
      for (let utmParam of UTMKeys) {
         if (router.query[utmParam]) {
            utmParamsFound[utmParam] = router.query[utmParam] + "" // convert to string
         }
      }

      if (Object.keys(utmParamsFound).length > 0) {
         SessionStorageUtil.setUTMParams(utmParamsFound)
      }

      if (document?.referrer) {
         SessionStorageUtil.setReferrer(document.referrer)
      }
   }, [router.query])
}

export default useStoreUTMQueryParams

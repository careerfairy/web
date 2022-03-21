import { useRouter } from "next/router"
import { useEffect } from "react"
import {
   queryInvite,
   queryReferralCode,
} from "../../constants/queryStringParams"
import LocalStorageUtil from "../../util/LocalStorageUtil"

const useStoreReferralQueryParams = () => {
   const router = useRouter()

   useEffect(() => {
      if (router.query[queryReferralCode]) {
         LocalStorageUtil.setReferralCode(router.query[queryReferralCode])
      }

      if (router.query[queryInvite]) {
         LocalStorageUtil.setInviteLivestream(router.query[queryInvite])
      }
   }, [router.query])
}

export default useStoreReferralQueryParams

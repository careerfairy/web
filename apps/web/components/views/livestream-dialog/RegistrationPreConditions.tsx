import { ReactNode, useEffect } from "react"
import { useAuth } from "../../../HOCs/AuthProvider"
import { useLiveStreamDialog } from "./LivestreamDialog"
import useRegistrationHandler from "./useRegistrationHandler"
import LivestreamDetailsViewSkeleton from "./views/livestream-details/LivestreamDetailsViewSkeleton"

type Options = {
   children: ReactNode
   skeleton?: ReactNode
}

/**
 * Parent component that should be used on every livestream dialog registration view
 *
 * Checks for pre-conditions to allow or not the user to register
 * to the livestream
 *
 * Users might open the dialog via a deep link like /portal/$id/register
 * This will open the dialog on the register view, in this case we need to check
 * if the user is allowed to proceed or not
 */
const RegistrationPreConditions = ({ children, skeleton }: Options) => {
   const { goToView } = useLiveStreamDialog()
   const { registrationStatus, redirectToLogin } = useRegistrationHandler()
   const { isLoadingAuth, isLoadingUserData } = useAuth()
   const status = registrationStatus()

   // check for fully auth load (auth + user data)
   const isAuthLoading = isLoadingAuth || isLoadingUserData

   useEffect(() => {
      if (isAuthLoading) {
         return
      }

      switch (status) {
         case "login_required":
            redirectToLogin()
            break

         case "registered":
            goToView("livestream-details")
            break
      }
   }, [goToView, isAuthLoading, redirectToLogin, status])

   if (isAuthLoading || status !== "can_register") {
      // if the user can't register, there will be a navigation
      // continue showing the skeleton while that happens
      return skeleton ? <>{skeleton}</> : <LivestreamDetailsViewSkeleton />
   }

   return <>{children}</>
}

export default RegistrationPreConditions

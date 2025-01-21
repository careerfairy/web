import { userIsTargetedApp } from "@careerfairy/shared-lib/countries/filters"
import { useAuth } from "HOCs/AuthProvider"
import { FC, useMemo } from "react"
import { MobileUtils } from "util/mobile.utils"
import { DiscoverContent } from "./DiscoverContent"
import { DownloadApp } from "./DownloadApp"

const RegisterSuccessView: FC = () => {
   const { userData } = useAuth()

   const userIsTargeted = useMemo(() => {
      return userIsTargetedApp(userData) && !MobileUtils.webViewPresence()
   }, [userData])

   return userIsTargeted ? <DownloadApp /> : <DiscoverContent />
}

export default RegisterSuccessView

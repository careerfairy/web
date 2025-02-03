import {
   swissGermanCountryFilters,
   userIsTargetedLevels,
} from "@careerfairy/shared-lib/countries/filters"
import useUserCountryCode from "components/custom-hook/useUserCountryCode"
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"
import { useAuth } from "HOCs/AuthProvider"
import { useMemo } from "react"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import NavList from "../common/NavList"
import BottomNavBar from "./BottomNavBar"
import { useGenericDashboard } from "./index"

type Props = {
   isDark?: boolean
}

const GenericNavList = ({ isDark }: Props) => {
   const { userData } = useAuth()
   const { userCountryCode } = useUserCountryCode()

   const isMobile = useIsMobile()
   const isFullScreen = useSparksFeedIsFullScreen()
   const { navLinks } = useGenericDashboard()

   const filteredNavList = useMemo(
      () =>
         navLinks.filter((link) => {
            if (link.id == "levels") {
               return userData
                  ? userIsTargetedLevels(userData)
                  : swissGermanCountryFilters.includes(userCountryCode)
            }
            return true
         }),
      [userData, navLinks, userCountryCode]
   )

   return isMobile || isFullScreen ? (
      <BottomNavBar links={filteredNavList} isDark={isDark} />
   ) : (
      <NavList links={filteredNavList} />
   )
}

export default GenericNavList

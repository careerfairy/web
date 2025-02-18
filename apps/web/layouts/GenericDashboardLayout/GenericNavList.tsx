import {
   swissGermanCountryFilters,
   userIsTargetedLevels,
} from "@careerfairy/shared-lib/countries/filters"
import { Badge } from "@mui/material"
import useSWRCountQuery from "components/custom-hook/useSWRCountQuery"
import useUserCountryCode from "components/custom-hook/useUserCountryCode"
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"
import { collection, limit, query, where } from "firebase/firestore"
import { useAuth } from "HOCs/AuthProvider"
import { useMemo } from "react"
import { useFirestore } from "reactfire"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import NavList from "../common/NavList"
import BottomNavBar from "./BottomNavBar"
import { useGenericDashboard } from "./index"

const useUserHasLevelsProgress = (userAuthUid: string) => {
   const firestore = useFirestore()

   return useSWRCountQuery(
      userAuthUid
         ? query(
              collection(firestore, "talentGuideProgress"),
              where("userAuthUid", "==", userAuthUid),
              limit(1)
           )
         : null
   )
}

type Props = {
   isDark?: boolean
}

export const GenericNavList = ({ isDark }: Props) => {
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

export const LevelsNewChip = ({ children }: { children: React.ReactNode }) => {
   const { userData, isLoggedIn, isLoadingUserData } = useAuth()
   const isMobile = useIsMobile()
   const { count: levelsStartedCount, loading: levelsStartedCountLoading } =
      useUserHasLevelsProgress(userData?.authId)

   const hideLevelsNewChip =
      isLoadingUserData ||
      levelsStartedCountLoading ||
      (Boolean(isLoggedIn) && levelsStartedCount > 0)

   if (isMobile)
      return (
         <Badge
            variant="dot"
            color="error"
            invisible={hideLevelsNewChip}
            sx={{
               "& .MuiBadge-badge": {
                  height: "15px",
                  width: "15px",
                  top: "5px",
                  borderRadius: "10px",
               },
            }}
         >
            {children}
         </Badge>
      )

   if (hideLevelsNewChip) return null

   return children
}

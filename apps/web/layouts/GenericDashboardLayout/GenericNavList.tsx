import { Badge } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useSWRCountQuery from "components/custom-hook/useSWRCountQuery"
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"
import { collection, limit, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { useGenericDashboard } from "."
import useIsMobile from "../../components/custom-hook/useIsMobile"
import { useNavLinks } from "../../hooks/useNavLinks"
import NavList from "../common/NavList"
import BottomNavBar from "./BottomNavBar"

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
   const isMobile = useIsMobile()
   const isFullScreen = useSparksFeedIsFullScreen()
   const { isMobile: isGenericDashboardMobile, userCountryCode } =
      useGenericDashboard()

   // Use the hook with its internal filtering
   const filteredNavLinks = useNavLinks(
      isGenericDashboardMobile,
      userCountryCode
   )

   return isMobile || isFullScreen ? (
      <BottomNavBar links={filteredNavLinks} isDark={isDark} />
   ) : (
      <NavList links={filteredNavLinks} />
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

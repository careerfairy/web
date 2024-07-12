import { EngageBadge } from "@careerfairy/shared-lib/badges/EngageBadges"
import { NetworkerBadge } from "@careerfairy/shared-lib/badges/NetworkBadges"
import { ResearchBadge } from "@careerfairy/shared-lib/badges/ResearchBadges"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useIsMobile from "../../../custom-hook/useIsMobile"
import useStreamRef from "../../../custom-hook/useStreamRef"
import useUserLivestreamDataWithRef from "../../../custom-hook/useUserLivestreamDataWithRef"
import CircularBadgeProgress from "./CircularBadgeProgress"

const ProgressIndicators = () => {
   const streamRef = useStreamRef()

   const { authenticatedUser } = useAuth()

   const userLivestreamData = useUserLivestreamDataWithRef(
      streamRef,
      authenticatedUser.email
   )
   const initialSnapshot = userLivestreamData?.participated?.initialSnapshot

   return (
      <>
         <Typography variant={"h6"} align={"center"}>
            Congrats! You are one step closer to land the job you’ll love 🚀
         </Typography>
         <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"center"}
            spacing={{
               xs: 2,
               sm: 5,
            }}
         >
            <CircularBadgeProgress
               badge={ResearchBadge}
               label={"Research"}
               initialSnapshot={initialSnapshot}
               helperText={
                  "The more you progress through these levels, the more exclusive content you'll have access to."
               }
            />
            <CircularBadgeProgress
               badge={NetworkerBadge}
               initialSnapshot={initialSnapshot}
               helperText={
                  "The more you progress through these levels, the easier it will be for you to increase your network."
               }
               label={"Network"}
            />
            <CircularBadgeProgress
               label={"Engagement"}
               badge={EngageBadge}
               initialSnapshot={initialSnapshot}
               helperText={
                  "The more you progress through these levels, the easier it will be for you to engage with company recruiters."
               }
            />
         </Stack>
      </>
   )
}

const numLoadingSkeletons = 3
export const ProgressIndicatorsLoader = () => {
   const isMobile = useIsMobile()
   const size = isMobile ? 64 : 90

   return (
      <Stack alignItems={"center"} spacing={4} justifyContent={"center"}>
         <Skeleton width={isMobile ? 300 : "45%"} />
         <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"center"}
            spacing={{
               xs: 6,
               sm: 9,
            }}
         >
            {Array.from({ length: numLoadingSkeletons }).map((_, index) => (
               <Stack alignItems={"center"} spacing={2} key={index}>
                  <Skeleton
                     key={index}
                     variant="circular"
                     width={size}
                     height={size}
                  />
                  <Skeleton width={"100%"} />
               </Stack>
            ))}
         </Stack>
      </Stack>
   )
}

export default ProgressIndicators

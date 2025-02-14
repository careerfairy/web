import { HighLight } from "@careerfairy/shared-lib/dist/highlights/Highlight"
import Box from "@mui/material/Box"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { AnalyticsEvents } from "util/analyticsConstants"
import { MARKETING_LANDING_PAGE_PATH } from "../../../constants/routes"
import { useAuth } from "../../../HOCs/AuthProvider"
import { dataLayerEvent } from "../../../util/analyticsUtils"
import useCanWatchHighlights from "../../custom-hook/useCanWatchHighlights"
import useDialogStateHandler from "../../custom-hook/useDialogStateHandler"
import CustomButtonCarousel from "../common/carousels/CustomButtonCarousel"
import HighlightItem from "./HighlightItem"
import HighlightsRestrictedDialog from "./HighlightsRestrictedDialog"
import HighlightVideoDialog from "./HighlightVideoDialog"

const styles = {
   root: {
      pt: { xs: 1, md: 4 },
   },
}
const HighlightsCarousel = ({
   serverSideHighlights,
   showHighlights,
}: Props) => {
   const { isLoggedOut, userPresenter } = useAuth()
   const {
      breakpoints: { up },
   } = useTheme()
   const highlights = useMemo(
      () => serverSideHighlights,
      [serverSideHighlights]
   )
   const { push, query, pathname } = useRouter()
   const [
      highlightsRestrictedDialogOpen,
      handleOpenHighlightsRestrictedDialog,
      handleCloseHighlightsRestrictedDialog,
   ] = useDialogStateHandler()
   const isSmall = useMediaQuery(up("sm"))
   const isMedium = useMediaQuery(up("md"))
   const isLarge = useMediaQuery(up("lg"))
   const {
      setUserTimeoutWithCookie,
      handleCheckIfCanWatchHighlight,
      timeoutDuration,
      canWatchAllHighlights,
   } = useCanWatchHighlights()
   const isOnLandingPage = pathname.includes(MARKETING_LANDING_PAGE_PATH)

   const numSlides: number = useMemo(() => {
      return isLarge ? 5 : isMedium ? 4 : isSmall ? 3 : 1
   }, [isSmall, isMedium, isLarge])

   const [videoUrl, setVideoUrl] = useState(null)

   const handleOpenVideoDialog = (videoUrl: string) => {
      const { canWatchAll } = handleCheckIfCanWatchHighlight()
      if (isOnLandingPage || canWatchAll) {
         setVideoUrl(videoUrl)
         setUserTimeoutWithCookie()
         dataLayerEvent(AnalyticsEvents.HighlightVideoPlay)
      } else {
         if (isLoggedOut) {
            dataLayerEvent(AnalyticsEvents.HighlightVideoSignedOut)
            return push({
               pathname: "/login",
               query: {
                  ...query,
                  absolutePath: "/portal?openDialog=highlightsRestrictedDialog",
               },
            })
         }
         if (videoUrl) handleCloseVideoDialog()
         handleOpenHighlightsRestrictedDialog()
         dataLayerEvent(AnalyticsEvents.HighlightVideoRestricted)
      }
   }

   useEffect(() => {
      if (
         query.openDialog === "highlightsRestrictedDialog" &&
         !userPresenter?.canWatchAllHighlights()
      ) {
         handleOpenHighlightsRestrictedDialog()
         delete query.openDialog
         void push({
            pathname: "/portal",
            query: {
               ...query,
            },
         })
      }
   }, [
      handleOpenHighlightsRestrictedDialog,
      push,
      query,
      query.openDialog,
      userPresenter,
   ])

   const handleCloseVideoDialog = () => {
      setVideoUrl(null)
   }
   if (!showHighlights || !highlights?.length) {
      return null
   }

   return (
      <Box sx={styles.root}>
         <CustomButtonCarousel
            numChildren={highlights.length}
            numSlides={numSlides}
            key={canWatchAllHighlights.timeLeft}
            carouselProps={{
               autoPlay: true,
            }}
         >
            {highlights.map((highlight) => (
               <Box key={highlight.id}>
                  <HighlightItem
                     handleOpenVideoDialog={handleOpenVideoDialog}
                     highLight={highlight}
                     locked={
                        !isOnLandingPage &&
                        Boolean(!canWatchAllHighlights.canWatchAll)
                     }
                  />
               </Box>
            ))}
         </CustomButtonCarousel>
         {Boolean(videoUrl) && (
            <HighlightVideoDialog
               videoUrl={videoUrl}
               handleClose={handleCloseVideoDialog}
            />
         )}
         {Boolean(highlightsRestrictedDialogOpen) && (
            <HighlightsRestrictedDialog
               open={highlightsRestrictedDialogOpen}
               handleClose={handleCloseHighlightsRestrictedDialog}
               timeLeft={canWatchAllHighlights.timeLeft}
               timeoutDuration={timeoutDuration}
            />
         )}
      </Box>
   )
}

interface Props {
   serverSideHighlights: HighLight[]
   showHighlights: boolean
}

export default HighlightsCarousel

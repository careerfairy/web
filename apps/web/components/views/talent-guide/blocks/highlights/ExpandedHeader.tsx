import { Group } from "@careerfairy/shared-lib/groups"
import { Box, Skeleton, Stack, Typography } from "@mui/material"
import { useLivestreamSWR } from "components/custom-hook/live-stream/useLivestreamSWR"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { HighlightComponentType } from "data/hygraph/types"
import Link from "next/link"
import {
   RefObject,
   SyntheticEvent,
   useCallback,
   useEffect,
   useRef,
   useState,
} from "react"
import { Video } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { makeGroupCompanyPageUrl } from "util/makeUrls"
import { useHighlights } from "./control/HighlightsBlockContext"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      zIndex: 2,
      gap: "12px",
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      padding: "0 16px 16px 16px",
      color: (theme) => theme.brand.white["100"],
      userSelect: "none",
      cursor: "default",
   },
   companyData: {
      display: "flex",
      alignItems: "center",
      gap: 1,
   },
   companyLogoContainer: {
      cursor: "pointer",
   },
   companyName: {
      fontSize: 16,
      fontWeight: 600,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
   },
   highlightTitle: {
      fontSize: "16px",
   },
   liveStreamTitleContainer: {
      overflowX: "hidden",
      cursor: "pointer",
      display: "flex",
   },
   iconWrapper: {
      height: {
         xs: 20,
         sm: 16,
      },
      width: {
         xs: 20,
         sm: 16,
      },
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   liveStreamTitle: {
      whiteSpace: "nowrap",
   },
})

const getScrollAnimationStyle = (
   titleRef: RefObject<HTMLDivElement>,
   parentRef: RefObject<HTMLDivElement>
) => {
   if (!titleRef.current || !parentRef.current) return []

   const titleWidth = titleRef.current.getBoundingClientRect().width
   const parentWidth = parentRef.current.getBoundingClientRect().width

   const isOverflowing = titleWidth > parentWidth

   if (!isOverflowing) return []

   const overflownWidth = titleWidth - parentWidth + 10

   // Define pixels per second (adjust this value to control the speed)
   const PIXELS_PER_SECOND = 22
   // Calculate duration based on distance and desired speed
   const duration = overflownWidth / PIXELS_PER_SECOND

   return [
      {
         animationName: "scrollToEnd",
         animationTimingFunction: "linear",
         animationIterationCount: "infinite",
         animationDuration: `${duration}s`,
         animationDelay: "1s",
      },
      {
         "@keyframes scrollToEnd": {
            "0%": {
               transform: "translateX(0)",
            },
            "40%, 50%": {
               transform: `translateX(-${overflownWidth}px)`,
            },
            "90%, 100%": {
               transform: "translateX(0)",
            },
         },
      },
   ]
}

export const ExpandedHeader = ({
   group,
   highlight,
}: {
   group: Group
   highlight: HighlightComponentType
}) => {
   const titleRef = useRef<HTMLDivElement>(null)
   const parentRef = useRef<HTMLDivElement>(null)
   const [animationStyle, setAnimationStyle] = useState([])

   const { handleLiveStreamDialogOpen } = useHighlights()

   const { data: livestream } = useLivestreamSWR(
      highlight.liveStreamIdentifier?.identifier
   )

   const handleLivestreamTitleClick = useCallback(
      (event: SyntheticEvent) => {
         event.stopPropagation()
         event.preventDefault()

         if (!livestream) return

         handleLiveStreamDialogOpen(livestream.id)
      },
      [livestream, handleLiveStreamDialogOpen]
   )

   const handleGroupClick = useCallback((event: SyntheticEvent) => {
      event.stopPropagation()
   }, [])

   useEffect(() => {
      if (livestream && titleRef.current && parentRef.current) {
         // hack needed to ensure elements are rendered and we have access to the correct dimensions
         requestAnimationFrame(() => {
            setAnimationStyle(getScrollAnimationStyle(titleRef, parentRef))
         })
      }
   }, [livestream, titleRef, parentRef])

   return (
      <Box sx={styles.root}>
         <Box sx={styles.companyData}>
            <Box
               component={Link}
               onClick={handleGroupClick}
               href={makeGroupCompanyPageUrl(group)}
               target="_blank"
               sx={styles.companyLogoContainer}
            >
               <CircularLogo
                  src={group?.logoUrl}
                  alt={`${group?.universityName} logo`}
               />
            </Box>
            <Typography variant="small" sx={styles.companyName}>
               {group?.universityName}
            </Typography>
         </Box>
         <Typography variant="small" sx={styles.highlightTitle}>
            {highlight.title}
         </Typography>
         <Stack
            direction="row"
            gap={1}
            alignItems="center"
            onClick={handleLivestreamTitleClick}
         >
            <Box sx={styles.iconWrapper}>
               <Video strokeWidth={1.5} />
            </Box>
            {livestream ? (
               <Box sx={styles.liveStreamTitleContainer} ref={parentRef}>
                  <Typography
                     ref={titleRef}
                     variant="small"
                     sx={[styles.liveStreamTitle, ...animationStyle]}
                  >
                     {livestream?.title}
                  </Typography>
               </Box>
            ) : (
               <Skeleton variant="text" width="100%" height={14} />
            )}
         </Stack>
      </Box>
   )
}

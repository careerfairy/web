import { Group } from "@careerfairy/shared-lib/groups"
import { Box, Stack, Typography } from "@mui/material"
import useLivestream from "components/custom-hook/live-stream/useLivestream"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import CircularLogo from "components/views/common/logos/CircularLogo"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
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

   return [
      {
         animationName: "scrollToEnd",
         animationTimingFunction: "linear",
         animationIterationCount: "infinite",
         animationDuration: "5s",
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

   const [isOpen, handleOpen, handleClose] = useDialogStateHandler()

   const { data: livestream } = useLivestream(
      highlight.liveStreamIdentifier.identifier
   )

   // Prevents exiting the fullscreen view when interacting with the dialog
   const handleDialogClick = useCallback((event: SyntheticEvent) => {
      event.stopPropagation()
      event.preventDefault()
   }, [])

   const handleLivestreamTitleClick = useCallback(
      (event: SyntheticEvent) => {
         event.stopPropagation()
         event.preventDefault()
         handleOpen()
      },
      [handleOpen]
   )

   const handleGroupClick = useCallback((event: SyntheticEvent) => {
      event.stopPropagation()
   }, [])

   useEffect(() => {
      if (titleRef.current && parentRef.current) {
         // hack needed to ensure elements are rendered and we have access to the correct dimensions
         setTimeout(() => {
            setAnimationStyle(getScrollAnimationStyle(titleRef, parentRef))
         }, 100)
      }
   }, [titleRef, parentRef])

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
            <Video size={16} />
            <Box sx={styles.liveStreamTitleContainer} ref={parentRef}>
               <Typography
                  ref={titleRef}
                  variant="small"
                  sx={[styles.liveStreamTitle, ...animationStyle]}
               >
                  {livestream?.title}
               </Typography>
            </Box>
         </Stack>
         <Box onClick={handleDialogClick}>
            <LivestreamDialog
               open={isOpen}
               livestreamId={highlight.liveStreamIdentifier.identifier}
               serverSideLivestream={livestream}
               handleClose={handleClose}
               page={"details"}
               serverUserEmail={""}
            />
         </Box>
      </Box>
   )
}

import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Add } from "@mui/icons-material"
import { Box, Button, IconButton, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import Link from "next/link"
import { FC, useCallback, useMemo, useRef } from "react"
import { ArrowLeft, ArrowRight } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useCompanyPage } from ".."
import EventCarousel from "./EventCarousel"
import StayUpToDateBanner from "./StayUpToDateBanner"
import MoreCard from "./MoreCard"

const styles = sxStyles({
   titleSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   addEvent: {
      borderRadius: "10px",
      height: (theme) => theme.spacing(40),
      width: (theme) => theme.spacing(35),
      border: "dashed",
      borderColor: (theme) => theme.palette.grey.A400,
      fontSize: "16px",

      "&:hover": {
         border: "dashed",
      },
   },
   arrowIcon: {
      padding: 0,
      minHeight: { xs: "25px", md: "30px" },
      minWidth: { xs: "25px", md: "30px" },
      ml: 2,
   },
   manageBtn: {
      borderRadius: 10,
      mx: "auto",
      py: (theme) => `${theme.spacing(0.75)} !important`,
      boxShadow: "none",
   },
   seeMoreLink: {
      textDecoration: "underline",
      color: "primary.main",
      fontSize: "1.2rem",
   },
})

type StreamCarouselProps = {
   livestreams: LivestreamEvent[]
   type: "upcoming" | "past"
   handleOpenEvent: (event: LivestreamEvent) => void
   title: string
   hasMore: boolean
}

const StreamCarousel: FC<StreamCarouselProps> = ({
   livestreams,
   type,
   handleOpenEvent,
   title,
   hasMore,
}) => {
   const streamsToShow = hasMore ? livestreams.slice(0, -1) : livestreams

   const isUpcoming = type === "upcoming"
   const isMobile = useIsMobile()

   const { group, editMode } = useCompanyPage()

   const sliderRef = useRef(null)

   const handleNext = useCallback(() => {
      sliderRef.current?.slickNext()
   }, [])

   const handlePrev = useCallback(() => {
      sliderRef.current?.slickPrev()
   }, [])

   const description = useMemo(() => {
      if (isUpcoming && editMode) {
         return "Below are your published live streams, these will be shown on your company page."
      }

      if (isUpcoming) {
         return "Watch live streams. Discover new career ideas, interesting jobs, internships and programmes for students. Get hired."
      }

      if (!isUpcoming && editMode) {
         return "Here are the recordings of your previous live streams, which will be featured on your company page."
      }

      // !isUpcoming && !editMode
      return `Have you missed a live stream from ${group.universityName} Corporation? Don't worry, you can re-watch them all here.`
   }, [isUpcoming, editMode, group.universityName])

   const link = useMemo(() => {
      const query = `companyId=${group.id}`

      if (isUpcoming) {
         return `/next-livestreams?${query}`
      }

      return `/past-livestreams?${query}`
   }, [group.id, isUpcoming])

   return (
      <Box>
         <Box sx={styles.titleSection}>
            <Typography variant="h4" fontWeight={"600"} color="black">
               {title}
            </Typography>
            {streamsToShow?.length > 2 && (
               <NavigationButtons
                  handlePrev={handlePrev}
                  handleNext={handleNext}
               />
            )}
         </Box>

         <Box mt={2}>
            {streamsToShow?.length > 0 ? (
               <Stack spacing={1}>
                  {!isMobile && (
                     <Typography
                        variant="h6"
                        fontWeight={"400"}
                        color="textSecondary"
                     >
                        {description}
                     </Typography>
                  )}
                  {hasMore ? (
                     <Link href={link} passHref>
                        <Box component="a" sx={styles.seeMoreLink}>
                           See all
                        </Box>
                     </Link>
                  ) : null}
                  <Box ml={-0.75}>
                     <EventCarousel sliderRef={sliderRef}>
                        {streamsToShow.map((event) => (
                           <Box key={event.id} px={0.75}>
                              <EventPreviewCard
                                 event={event}
                                 bottomElement={
                                    editMode && isUpcoming ? (
                                       <Box
                                          display="flex"
                                          justifyContent="center"
                                          flexDirection="column"
                                          component="span"
                                          width="100%"
                                          px={1}
                                          zIndex={10}
                                       >
                                          <Button
                                             variant="contained"
                                             color="primary"
                                             onClick={(e) => {
                                                e.stopPropagation()
                                                return handleOpenEvent(event)
                                             }}
                                             fullWidth
                                             size="small"
                                             sx={styles.manageBtn}
                                          >
                                             MANAGE LIVE STREAM
                                          </Button>
                                       </Box>
                                    ) : null
                                 }
                              />
                           </Box>
                        ))}
                        {hasMore ? (
                           <Box key="has-more-card" px={0.75} my="auto">
                              <MoreCard
                                 link={link}
                                 companyName={group.universityName}
                              />
                           </Box>
                        ) : null}
                     </EventCarousel>
                  </Box>
               </Stack>
            ) : type === "upcoming" && editMode ? (
               <Link href={`/group/${group.id}/admin/events`}>
                  <a>
                     <Button color="secondary" sx={styles.addEvent}>
                        <Box>
                           <Add sx={{ height: "58px", width: "58px" }} />
                           <Typography variant="subtitle2" color={"black"}>
                              Create new live stream
                           </Typography>
                        </Box>
                     </Button>
                  </a>
               </Link>
            ) : (
               <>
                  <Typography
                     variant="h6"
                     fontWeight={"400"}
                     color="textSecondary"
                     mb={2}
                  >
                     Watch live streams. Discover new career ideas, interesting
                     jobs, internships and programmes for students. Get hired.
                  </Typography>
                  <StayUpToDateBanner />
               </>
            )}
         </Box>
      </Box>
   )
}

type NavigationButtonsProps = {
   handlePrev: () => void
   handleNext: () => void
}

const NavigationButtons: FC<NavigationButtonsProps> = ({
   handlePrev,
   handleNext,
}) => {
   return (
      <Box>
         <IconButton color="inherit" sx={styles.arrowIcon} onClick={handlePrev}>
            <ArrowLeft fontSize={"large"} />
         </IconButton>
         <IconButton color="inherit" sx={styles.arrowIcon} onClick={handleNext}>
            <ArrowRight fontSize={"large"} />
         </IconButton>
      </Box>
   )
}

export default StreamCarousel

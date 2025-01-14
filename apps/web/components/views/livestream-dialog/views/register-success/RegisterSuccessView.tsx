import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import CalendarIcon from "@mui/icons-material/CalendarTodayOutlined"
import {
   Box,
   Button,
   CircularProgress,
   Fade,
   Grid,
   Slide,
   Typography,
} from "@mui/material"
import Stack from "@mui/material/Stack"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroup from "components/custom-hook/group/useGroup"
import useGroupSparks from "components/custom-hook/spark/useGroupSparks"
import { GroupSparksCarousel } from "components/views/common/sparks/GroupSparksCarousel"
import { FallbackComponent } from "components/views/portal/sparks/FallbackComponent"
import SparkPreviewCard from "components/views/sparks/components/spark-card/SparkPreviewCard"
import Image from "next/legacy/image"
import { useRouter } from "next/router"
import { FC, useCallback, useEffect } from "react"
import { MessageSquare } from "react-feather"
import { useSelector } from "react-redux"
import { confetti } from "../../../../../constants/images"
import { eventDetailsDialogVisibilitySelector } from "../../../../../store/selectors/sparksFeedSelectors"
import { sxStyles } from "../../../../../types/commonTypes"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { responsiveConfetti } from "../../../../util/confetti"
import { AddToCalendar } from "../../../common/AddToCalendar"
import BaseDialogView, { MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"

const styles = sxStyles({
   fullHeight: {
      height: "100%",
   },
   mainContentWrapper: {
      display: "flex",
      flexDirection: "column",
   },
   confettiGraphic: {
      width: "100%",
      textAlign: "center",
   },
   confettiGraphicSparksOpen: {
      transition: "all 0.5s",
      width: { xs: "0%", md: "7%" },
   },
   title: {
      textAlign: "center",
      fontWeight: 700,
      pt: { xs: 1, md: 0 },
      mb: 1,
   },
   bigTitle: {
      fontSize: { xs: "28px !important", md: "48px !important" },
      marginBottom: { xs: 4, md: 6 },
   },
   description: {
      textAlign: "center",
      maxWidth: 680,
      fontWeight: 400,
   },
   header: {
      display: "inline-flex",
      flexFlow: "wrap",
      justifyContent: "center",
      textAlign: "center",
      width: "100%",
   },
   buttonsWrapper: {
      display: "flex",
      justifyContent: "center",
      mb: { xs: 3.5, md: 4 },
      width: "100%",
   },
   buttons: {
      minWidth: { xs: "100%", md: "267px" },
   },
   mobileSparksWrapper: {
      borderRadius: "12px 12px 0px 0px",
      background: (theme) => theme.brand.white[400],
   },
   sparkCarouselTitle: {
      fontWeight: 600,
   },
   sparkGridItem: {
      height: 390,
   },
   sparksWrapper: {
      padding: 1.2,
      pb: "18px",
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
   },
   mobileSparksCarousel: {
      py: "16px",
      ml: 2,
   },
   transition: {
      transition: "all 0.5s",
   },
   contentWrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
   },
   contentWrapperSparksOpen: {
      height: "unset",
   },
   copy: {
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   sparksContentOffset: {
      margin: { xs: "0 -24px" },
   },
})

const RegisterSuccessView: FC = () => {
   const {
      closeDialog,
      activeView,
      isDiscoverCompanySparksOpen,
      handleDiscoverCompanySparks,
   } = useLiveStreamDialog()
   const isMobile = useIsMobile()

   useEffect(() => {
      if (activeView !== "register-success") return

      responsiveConfetti(isMobile)
   }, [isMobile, activeView])

   return (
      <BaseDialogView
         sx={styles.fullHeight}
         mainContent={
            <MainContent
               sx={[styles.fullHeight, styles.mainContentWrapper]}
               onBackClick={closeDialog}
               onBackPosition="top-right"
            >
               {isMobile && isDiscoverCompanySparksOpen ? (
                  <MobileSparksTransition
                     isSparksOpen={isDiscoverCompanySparksOpen}
                     handleDiscoverSparks={handleDiscoverCompanySparks}
                  />
               ) : (
                  <Component
                     isSparksOpen={isDiscoverCompanySparksOpen}
                     handleDiscoverSparks={handleDiscoverCompanySparks}
                  />
               )}
            </MainContent>
         }
      />
   )
}

const MobileSparksTransition = ({ isSparksOpen, handleDiscoverSparks }) => {
   return (
      <Slide direction="up" in={isSparksOpen} unmountOnExit>
         <Box>
            <Fade in={isSparksOpen} timeout={800}>
               <Box>
                  <Component
                     isSparksOpen={isSparksOpen}
                     handleDiscoverSparks={handleDiscoverSparks}
                  />
               </Box>
            </Fade>
         </Box>
      </Slide>
   )
}

type ComponentProps = {
   isSparksOpen: boolean
   handleDiscoverSparks: () => void
}

const Component = ({ isSparksOpen, handleDiscoverSparks }: ComponentProps) => {
   const isMobile = useIsMobile()
   const router = useRouter()
   const { livestream } = useLiveStreamDialog()

   const handleSparkClick = useCallback(
      (spark: Spark) => {
         if (spark) {
            router.push({
               pathname: `/sparks/${spark.id}`,
               query: {
                  ...router.query, // spread current query params
                  groupId: livestream.groupIds[0],
                  interactionSource:
                     SparkInteractionSources.Livestream_Registration_Flow,
               },
            })
         }
         return
      },
      [livestream.groupIds, router]
   )

   return (
      <Box
         sx={[
            styles.contentWrapper,
            isSparksOpen && styles.contentWrapperSparksOpen,
         ]}
      >
         <Header isSparksOpen={isSparksOpen} />
         <Box sx={styles.copy} gap={isSparksOpen ? 1.4 : 4}>
            {isSparksOpen ? (
               <Typography variant={"brandedBody"} sx={styles.description}>
                  Your journey doesn{"'"}t stop here: discover more about{" "}
                  <b>{livestream.company}</b> in their Sparks and add the live
                  stream to your calendar to ensure you won{"'"}t miss it.
               </Typography>
            ) : livestream.smsEnabled ? (
               <Typography variant="brandedBody" sx={styles.description}>
                  Just one last step: Don{"’"}t miss the live event by signing
                  up for a reminder via SMS or calendar now!
               </Typography>
            ) : (
               <Typography variant="brandedBody" sx={styles.description}>
                  Feel free to continue exploring and browsing other content on
                  our platform. We{"'"}ll send you a reminder just before this
                  live stream begins so you can easily join. You can also add
                  the live stream to your calendar to ensure you won
                  {"'"}t miss it.
               </Typography>
            )}
            <SuspenseWithBoundary
               fallback={
                  <Box>
                     <CircularProgress />
                  </Box>
               }
            >
               <ActionButtons
                  handleDiscoverSparks={handleDiscoverSparks}
                  isSparksOpen={isSparksOpen}
               />
            </SuspenseWithBoundary>
         </Box>
         <Slide direction="up" in={isSparksOpen} unmountOnExit>
            <Box>
               <Fade in={isSparksOpen} timeout={600}>
                  <Box sx={styles.sparksContentOffset}>
                     <SuspenseWithBoundary fallback={<CircularProgress />}>
                        {isMobile ? (
                           <SparksMobileCarousel
                              livestream={livestream}
                              handleSparkClick={handleSparkClick}
                           />
                        ) : (
                           <SparksGrid
                              livestream={livestream}
                              handleSparkClick={handleSparkClick}
                           />
                        )}
                     </SuspenseWithBoundary>
                  </Box>
               </Fade>
            </Box>
         </Slide>
      </Box>
   )
}

const Header = ({ isSparksOpen }) => {
   const isMobile = useIsMobile()

   return (
      <Box sx={styles.header}>
         <Box
            sx={[
               styles.confettiGraphic,
               isSparksOpen && styles.confettiGraphicSparksOpen,
            ]}
         >
            <Image
               src={confetti}
               objectFit={"contain"}
               width={isMobile ? 196 : 268}
               height={isMobile ? 196 : 268}
               priority
               quality={100}
               alt={"confetti"}
            />
         </Box>

         <Typography
            sx={[
               styles.title,
               styles.transition,
               !isSparksOpen && styles.bigTitle,
            ]}
            variant={isSparksOpen && isMobile ? "brandedH2" : "brandedH1"}
            component={isSparksOpen && isMobile ? "h2" : "h1"}
         >
            {"Successfully "}
            <Typography
               sx={[styles.transition, !isSparksOpen && styles.bigTitle]}
               variant={isSparksOpen && isMobile ? "brandedH2" : "brandedH1"}
               color="primary.main"
            >
               {isSparksOpen && isMobile ? <br /> : null}
               Registered
            </Typography>
         </Typography>
      </Box>
   )
}

type ActionButtonsProps = {
   handleDiscoverSparks: () => void
   isSparksOpen: boolean
}

const ActionButtons = ({
   handleDiscoverSparks,
   isSparksOpen,
}: ActionButtonsProps) => {
   const route = useRouter()
   const { closeDialog, livestream, goToView, isDiscoverCompanySparksOpen } =
      useLiveStreamDialog()
   const { data: group } = useGroup(livestream.groupIds[0])
   const groupHasSparks = Boolean(group?.publicSparks)
   const eventDetailsDialogVisibility = useSelector(
      eventDetailsDialogVisibilitySelector
   )

   const handleBackClick = useCallback(() => {
      if (eventDetailsDialogVisibility) {
         closeDialog()
      } else {
         void route.push("/next-livestreams")
      }
   }, [closeDialog, eventDetailsDialogVisibility, route])

   return (
      <Box sx={styles.buttonsWrapper}>
         <Stack spacing={1.2} sx={styles.buttons}>
            {Boolean(livestream.smsEnabled) && !isDiscoverCompanySparksOpen && (
               <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  fullWidth
                  startIcon={<MessageSquare />}
                  onClick={() => goToView("ask-phone-number")}
               >
                  Get SMS Reminder
               </Button>
            )}

            <AddToCalendar
               event={livestream}
               filename={`${livestream.company}-event`}
               onCalendarClick={() => groupHasSparks && handleDiscoverSparks()}
            >
               {(handleClick) => (
                  <Button
                     fullWidth
                     variant={"contained"}
                     color={"primary"}
                     onClick={handleClick}
                     size="large"
                     startIcon={<CalendarIcon />}
                  >
                     Add to calendar
                  </Button>
               )}
            </AddToCalendar>

            {!isSparksOpen && (
               <Button
                  variant={groupHasSparks ? "outlined" : "text"}
                  color={groupHasSparks ? "primary" : "grey"}
                  onClick={
                     groupHasSparks ? handleDiscoverSparks : handleBackClick
                  }
                  size="large"
               >
                  {groupHasSparks
                     ? "Discover company Sparks"
                     : eventDetailsDialogVisibility
                     ? "Back to Sparks"
                     : "Discover more live streams"}
               </Button>
            )}
         </Stack>
      </Box>
   )
}

const SparksGrid = ({ livestream, handleSparkClick }) => {
   const { data: publicSparks } = useGroupSparks(livestream.groupIds[0], {
      isPublished: true,
   })
   return (
      <Box sx={styles.sparksWrapper} gap={1.2}>
         <Typography
            variant={"brandedH4"}
            display="block"
            align="center"
            sx={styles.sparkCarouselTitle}
         >
            More content from this company
         </Typography>
         <Grid container spacing={1.5}>
            {publicSparks.map((spark: Spark) => (
               <Grid key={spark.id} item sm={3} sx={styles.sparkGridItem}>
                  <SparkPreviewCard
                     spark={spark}
                     onClick={handleSparkClick}
                     type="gallery"
                  />
               </Grid>
            ))}
         </Grid>
      </Box>
   )
}

const CarouselHeader = () => {
   return (
      <Typography variant={"brandedBody"} sx={styles.sparkCarouselTitle}>
         More content from this company
      </Typography>
   )
}

const SparksMobileCarousel = ({ livestream, handleSparkClick }) => {
   return (
      <Box sx={styles.mobileSparksWrapper}>
         <SuspenseWithBoundary
            fallback={
               <FallbackComponent
                  header={<CarouselHeader />}
                  sx={styles.mobileSparksCarousel}
               />
            }
         >
            <GroupSparksCarousel
               handleSparksClicked={handleSparkClick}
               header={<CarouselHeader />}
               groupId={livestream.groupIds[0]}
               sx={styles.mobileSparksCarousel}
            />
         </SuspenseWithBoundary>
      </Box>
   )
}

export default RegisterSuccessView

import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Button, Link, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { EmptyItemsView } from "components/views/common/EmptyItemsView"
import FollowButton from "components/views/common/company/FollowButton"
import NewStreamModal from "components/views/group/admin/events/NewStreamModal"
import { useLivestreamRouting } from "components/views/group/admin/events/useLivestreamRouting"
import EventsPreviewCarousel, {
   EventsCarouselStyling,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import { FC, useCallback, useState } from "react"
import { Plus, Radio } from "react-feather"
import { TabValue, useCompanyPage } from "../"
import { sxStyles } from "../../../../types/commonTypes"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import { StreamCreationProvider } from "../../draftStreamForm/StreamForm/StreamCreationProvider"
import { SeeAllLink } from "../Overview/SeeAllLink"
import {
   EMPTY_UPCOMING_EVENTS_DESCRIPTION,
   EMPTY_UPCOMING_EVENTS_TITLE,
} from "../Tabs/EventsTab"
import StayUpToDateBanner from "./StayUpToDateBanner"

const styles = sxStyles({
   root: {
      position: "relative",
      minHeight: (theme) => theme.spacing(50),
   },
   eventsWrapper: {
      mt: 1,
      mb: 2,
   },
   eventsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      pr: 0,
      pb: 1,
   },
   seeMoreText: {
      textDecoration: "underline",
      fontSize: "14px",
      mr: 1,
      color: "neutral.600",
      fontWeight: "400",
      cursor: "pointer",
   },
   titleLink: {
      color: "#000",
      "&:hover": {
         color: "#000",
      },
   },
   underlined: {
      textDecoration: "underline",
   },
   stayUpWrapper: {
      pb: 1,
   },
   createStreamButton: {
      mt: 2,
      backgroundColor: (theme) => theme.brand.white[200],
      border: (theme) => `1px solid ${theme.brand.white[500]}`,
      borderRadius: "16px",
      width: "360px",
      height: "322px",
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[400],
      },
   },
   createStreamIcon: {
      color: (theme) => theme.palette.secondary.main,
      width: "44px !important",
      height: "44px !important",
   },
})

const SectionTitle = ({ title }: { title: string }) => {
   return (
      <Typography variant="brandedH3" fontWeight={"600"} color="black">
         {title}
      </Typography>
   )
}

const EventSection = () => {
   const {
      group,
      upcomingLivestreams,
      pastLivestreams,
      editMode,
      getCompanyPageTabLink,
      tabMode,
      setActiveTab,
   } = useCompanyPage()

   const isMobile = useIsMobile()

   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

   const [eventToEdit, setEventToEdit] = useState(null)
   const handleOpenEvent = useCallback(
      (event: LivestreamEvent) => {
         setEventToEdit(event)
         handleOpenDialog()
      },
      [handleOpenDialog]
   )

   const upcomingEventsHref = getCompanyPageTabLink(TabValue.livesStreams)
   const pastEventsHref = getCompanyPageTabLink(TabValue.recordings)

   const eventsCarouselStyling: EventsCarouselStyling = {
      mainWrapperBoxSx: {
         mt: 2,
         mr: "-16px !important",
         ml: "-16px !important",
      },
      showArrows: isMobile,
      seeMoreSx: styles.seeMoreText,
      headerAsLink: false,
   }

   return (
      <Box sx={styles.root}>
         <Stack spacing={"8px"} sx={isMobile ? styles.eventsWrapper : null}>
            {upcomingLivestreams?.length ? (
               <EventsPreviewCarousel
                  title={<SectionTitle title="Live streams" />}
                  header={
                     isMobile ? (
                        <EventSectionHeader
                           title="Live streams"
                           href={upcomingEventsHref}
                        />
                     ) : null
                  }
                  events={upcomingLivestreams}
                  location={`company-page-next-livestreams-carousel-${group.id}`}
                  seeMoreLink={upcomingEventsHref}
                  handleSeeMoreClick={
                     tabMode
                        ? () => setActiveTab(TabValue.livesStreams)
                        : undefined
                  }
                  styling={eventsCarouselStyling}
                  hideChipLabels={editMode}
                  showManageButton={editMode}
                  handleOpenEvent={handleOpenEvent}
               />
            ) : editMode ? (
               <CreateStreamButton />
            ) : (
               <Stack spacing={2}>
                  <SectionTitle title="Live streams" />
                  <EmptyItemsView
                     title={EMPTY_UPCOMING_EVENTS_TITLE}
                     description={EMPTY_UPCOMING_EVENTS_DESCRIPTION}
                     icon={<Radio width={"44px"} height={"44px"} />}
                  >
                     <FollowButton
                        sx={{ fontSize: "14px", mt: "18px" }}
                        group={group}
                        interactionSource={InteractionSources.Company_Page}
                        showStartIcon
                     />
                  </EmptyItemsView>
               </Stack>
            )}
            {pastLivestreams?.length ? (
               <EventsPreviewCarousel
                  title={<SectionTitle title="Recordings" />}
                  header={
                     isMobile ? (
                        <EventSectionHeader
                           title="Recordings"
                           href={pastEventsHref}
                        />
                     ) : null
                  }
                  events={pastLivestreams ?? []}
                  location={`company-page-past-livestreams-carousel-${group.id}`}
                  disableAutoPlay
                  seeMoreLink={pastEventsHref}
                  handleSeeMoreClick={
                     tabMode
                        ? () => setActiveTab(TabValue.recordings)
                        : undefined
                  }
                  styling={eventsCarouselStyling}
                  preventPaddingSlide
               />
            ) : null}
         </Stack>
         {isDialogOpen ? (
            <StreamCreationProvider>
               <NewStreamModal
                  group={group}
                  typeOfStream={"upcoming"}
                  open={isDialogOpen}
                  handlePublishStream={null}
                  handleResetCurrentStream={() => {
                     /* default mpty function with comment to prevent linting */
                  }}
                  currentStream={eventToEdit}
                  onClose={handleCloseDialog}
               />
            </StreamCreationProvider>
         ) : null}
      </Box>
   )
}

type EventSectionHeaderProps = {
   title: string
   href?: string
}
const EventSectionHeader = ({ title, href }: EventSectionHeaderProps) => {
   return (
      <Stack
         sx={styles.eventsHeader}
         direction="row"
         justifyContent="space-between"
         alignItems="center"
      >
         <Typography variant="brandedH3" fontWeight={"600"} color="black">
            {title}
         </Typography>
         <Box mr={2}>
            <SeeAllLink href={href} />
         </Box>
      </Stack>
   )
}
type StayUpToDateProps = {
   title: string
   description?: string
   titleAsLink?: boolean
   seeMoreLink?: string
}
/**
 *
 * @param props Component properties, name title, description, isMobile and titleAsLink
 * @returns  <StayUpToDateBanner> wrapped with Title and description and link for mobile
 */
export const StayUpToDateComponent: FC<StayUpToDateProps> = ({
   title,
   titleAsLink,
   seeMoreLink,
}) => {
   const showTitleAsLink = titleAsLink && seeMoreLink?.length > 0

   const titleComponent = (
      <Typography
         variant={"brandedH3"}
         sx={showTitleAsLink ? styles.underlined : null}
         fontWeight={"600"}
         color="black"
      >
         {title}
      </Typography>
   )
   return (
      <Box sx={styles.stayUpWrapper}>
         <Box sx={styles.eventsHeader}>
            {showTitleAsLink ? (
               <Link href={seeMoreLink} style={styles.titleLink}>
                  {titleComponent}
               </Link>
            ) : (
               titleComponent
            )}
         </Box>
         <StayUpToDateBanner />
      </Box>
   )
}

const CreateStreamButton = () => {
   const { createDraftLivestream } = useLivestreamRouting()

   return (
      <Stack>
         <SectionTitle title="Live streams" />
         <Button
            variant="contained"
            color="primary"
            onClick={createDraftLivestream}
            sx={styles.createStreamButton}
         >
            <Stack alignItems="center">
               <Box component={Plus} sx={styles.createStreamIcon} />
               <Typography variant="medium" color={"neutral.800"}>
                  Create new live stream
               </Typography>
            </Stack>
         </Button>
      </Stack>
   )
}
export const MAX_UPCOMING_STREAMS = 10
export const MAX_PAST_STREAMS = 5

export default EventSection

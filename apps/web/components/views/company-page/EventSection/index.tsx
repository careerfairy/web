import { Box, Button, Link, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import NewStreamModal from "components/views/group/admin/events/NewStreamModal"
import EventsPreviewCarousel, {
   EventsCarouselStyling,
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import { FC, useCallback, useState } from "react"
import { TabValue, useCompanyPage } from "../"
import { sxStyles } from "../../../../types/commonTypes"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import { StreamCreationProvider } from "../../draftStreamForm/StreamForm/StreamCreationProvider"

import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { useLivestreamRouting } from "components/views/group/admin/events/useLivestreamRouting"
import { Plus } from "react-feather"
import { SeeAllLink } from "../Overview/SeeAllLink"
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
   const { group, upcomingLivestreams, pastLivestreams, editMode } =
      useCompanyPage()

   const query = `companyId=${group.id}`
   const isMobile = useIsMobile()

   const { setActiveTab } = useCompanyPage()

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
            <ConditionalWrapper
               condition={Boolean(upcomingLivestreams?.length)}
               fallback={
                  editMode ? (
                     <CreateStreamButton />
                  ) : (
                     <StayUpToDateComponent
                        title="Next Live Streams"
                        seeMoreLink={`/next-livestreams?${query}`}
                     />
                  )
               }
            >
               <EventsPreviewCarousel
                  title={<SectionTitle title="Live streams" />}
                  header={
                     isMobile ? (
                        <EventSectionHeader
                           title="Live streams"
                           seeAllClick={() =>
                              setActiveTab?.(TabValue.livesStreams)
                           }
                        />
                     ) : null
                  }
                  events={upcomingLivestreams}
                  type={EventsTypes.COMING_UP}
                  seeMoreLink={""}
                  onClickSeeMore={() => {
                     setActiveTab?.(TabValue.livesStreams)
                  }}
                  styling={eventsCarouselStyling}
                  hideChipLabels={editMode}
                  showManageButton={editMode}
                  handleOpenEvent={handleOpenEvent}
               />
            </ConditionalWrapper>
            <ConditionalWrapper condition={Boolean(pastLivestreams?.length)}>
               <EventsPreviewCarousel
                  title={<SectionTitle title="Recordings" />}
                  header={
                     isMobile ? (
                        <EventSectionHeader
                           title="Recordings"
                           seeAllClick={() =>
                              setActiveTab?.(TabValue.recordings)
                           }
                        />
                     ) : null
                  }
                  events={pastLivestreams ?? []}
                  type={EventsTypes.PAST_EVENTS}
                  seeMoreLink={""}
                  onClickSeeMore={() => {
                     setActiveTab?.(TabValue.recordings)
                  }}
                  styling={eventsCarouselStyling}
                  preventPaddingSlide
               />
            </ConditionalWrapper>
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
   seeAllClick?: () => void
}
const EventSectionHeader = ({
   title,
   seeAllClick,
}: EventSectionHeaderProps) => {
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
            <SeeAllLink handleClick={seeAllClick} />
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

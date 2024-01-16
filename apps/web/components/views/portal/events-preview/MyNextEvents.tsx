import React, { FC, useMemo } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import EventsPreviewCarousel, { EventsTypes } from "./EventsPreviewCarousel"
import { Box, Button, Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import Heading from "../common/Heading"
import ConditionalWrapper from "components/util/ConditionalWrapper"

const config = {
   suspense: false,
   initialData: [],
}

const slideSpacing = 21

const styles = sxStyles({
   slide: {
      flex: {
         xs: `0 0 90%`,
         sm: `0 0 45%`,
         md: `0 0 40%`,
         lg: `0 0 30%`,
      },
      minWidth: 0,
      position: "relative",
      height: {
         xs: 355,
         md: 355,
      },
      "&:not(:first-of-type)": {
         paddingLeft: `calc(${slideSpacing}px - 5px)`,
      },
      "&:first-of-type": {
         ml: 0.3,
      },
   },
   eventsBackground: {
      background: "black",
   },
   contentWrapper: {
      pl: 2,
   },
   cardWrapperContainerCircle: {
      border: "15px solid #229584",
      background: "#2ABAA5",
      width: {
         xs: "90vw",
         md: "60vw",
         lg: "45vw",
      },
      height: {
         xs: "90vw",
         md: "60vw",
         lg: "45vw",
      },
      borderRadius: "50%",
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxShadow:
         "0px 11px 15px -7px rgba(34, 149, 132,0.2),0px 24px 38px 3px rgba(34, 149, 132, 0.14),0px 9px 46px 100px rgba(34, 149, 132, 0.12)",
   },
   title: {
      fontFamily: "Poppins",
      fontSize: "18px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "27px",
      color: "black",
   },
   cardWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "16px",
      border: "1px solid #D6D6E0",
      overflow: "hidden",
      background: "#3D3D47",
      marginY: 1,
      paddingTop: 5,
      paddingBottom: 4,
      backgroundColor: "black",
      position: "relative",
      width: "100%",
      maxHeight: "292px",
      cardInnerWrapper: {
         background: "#2ABAA5",
         borderRadius: "100%",
         boxShadow: "0.375em 0.375em 0 0 rgba(15, 28, 63, 0.125)",
      },
   },
   noRegistrations: {
      overflow: "hidden",
      title: {
         color: "white",
         opacity: 1,
         fontWeight: "bold",
      },
      description: {
         color: "white",
         textAlign: "center",
         fontFamily: "Poppins",
         fontSize: "16px",
         fontStyle: "normal",
         fontWeight: "400",
         lineHeight: "27px" /* 168.75% */,
         paddingX: "15px",
      },
      descriptionWrapper: {
         maxWidth: "600px",
      },
      redirectButton: {
         color: "#229584",
         backgroundColor: "white",
         textTransform: "none",
         "&:hover": {
            backgroundColor: "#F3F3F5",
         },
      },
   },
   eventsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      pr: 2,
      pb: 0,
   },
   seeMoreText: {
      color: "text.secondary",
      textDecoration: "underline",
      pr: 1,
   },
   eventTitle: {
      fontFamily: "Poppins",
      fontSize: "18px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "27px",
      color: "black",
      pb: 1,
   },
   eventTitleEmpty: {
      fontFamily: "Poppins",
      fontSize: "18px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "27px",
      color: "black",
   },
   viewportSx: {
      overflow: "hidden",
   },
   boxContainerEmpty: {
      pr: {
         xs: 2,
         xl: 0,
      },
   },
})
const MyNextEvents = ({ limit }: Props) => {
   const { authenticatedUser } = useAuth()
   const registeredEventsQuery = useMemo(() => {
      return livestreamRepo.registeredEventsQuery(
         authenticatedUser.email,
         limit
      )
   }, [authenticatedUser.email, limit])

   const { data: events, status } = useFirestoreCollection<LivestreamEvent>(
      registeredEventsQuery,
      config
   )

   const isLoading = status === "loading"

   if (!authenticatedUser.email) {
      return null
   }
   return (
      <Box sx={events?.length > 0 ? null : styles.boxContainerEmpty}>
         <ConditionalWrapper
            condition={events?.length > 0}
            fallback={<EmptyRegistrationsBanner></EmptyRegistrationsBanner>}
         >
            <EventsPreviewCarousel
               id={"my-next-events"}
               type={EventsTypes.MY_NEXT}
               events={events}
               isEmpty={Boolean(!isLoading && !events.length)}
               title={MY_NEXT_EVENTS_TITLE}
               loading={isLoading}
               seeMoreLink="/next-livestreams/my-registrations"
               styling={{
                  compact: true,
                  seeMoreSx: styles.seeMoreText,
                  showArrows: true,
                  headerAsLink: false,
                  slide: styles.slide,
                  viewportSx: styles.viewportSx,
                  title:
                     events?.length > 0
                        ? styles.eventTitle
                        : styles.eventTitleEmpty,
                  eventsHeader: styles.eventsHeader,
                  titleVariant: "h6",
                  padding: true,
               }}
            />
         </ConditionalWrapper>
      </Box>
   )
}
const EmptyRegistrationsBanner: FC = () => {
   return (
      <Box sx={styles.contentWrapper}>
         <Box>
            <Typography
               variant={"h6"}
               sx={styles.title}
               fontWeight={"600"}
               color="black"
            >
               My Registrations
            </Typography>
         </Box>

         <Box sx={styles.cardWrapper}>
            <Box sx={styles.cardWrapperContainerCircle}>
               <Stack
                  spacing={1.25}
                  alignItems="center"
                  flexDirection={"column"}
               >
                  <Box>
                     <Heading sx={styles.noRegistrations.title}>
                        No registrations Yet!
                     </Heading>
                  </Box>
                  <Box sx={styles.noRegistrations.descriptionWrapper}>
                     <Typography
                        sx={styles.noRegistrations.description}
                        variant="h6"
                        fontWeight={"400"}
                        color="textSecondary"
                     >
                        You don’t have any registrations to upcoming live
                        streams! Browse, register, discover new opportunities
                        and kick-start your career.
                     </Typography>
                  </Box>
                  <Box>
                     <Button
                        sx={styles.noRegistrations.redirectButton}
                        variant="contained"
                        href="/next-livestreams"
                     >
                        <Typography>Check all live streams</Typography>
                     </Button>
                  </Box>
               </Stack>
            </Box>
         </Box>
      </Box>
   )
}
export const MY_NEXT_EVENTS_TITLE = "My registrations"
type Props = {
   limit?: number
}

export default MyNextEvents

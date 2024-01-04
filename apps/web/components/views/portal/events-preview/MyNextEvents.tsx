import React, { useMemo } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import EventsPreviewCarousel, { EventsTypes } from "./EventsPreviewCarousel"
import { EmblaOptionsType } from "embla-carousel-react"
import { Box, Button, Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import Heading from "../common/Heading"

const config = {
   suspense: false,
   initialData: [],
}

const desktopCircleWidth = 45
const mobileCircleWidth = 85

const styles = sxStyles({
   eventsBackground: {
      background: "black",
   },
   cardWrapperContainerCircle: {
      border: "30px solid #229584",
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
   cardWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "16px",
      border: "1px solid #D6D6E0",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
      overflow: "hidden",
      background: "#3D3D47",
      marginTop: 2,
      paddingTop: 5,
      paddingBottom: 4,
      backgroundColor: "black",
      // display: "flex",
      marginLeft: 2,
      position: "relative",
      width: "100%",
      maxHeight: "292px",

      cardInnerWrapper: {
         background: "#2ABAA5",
         borderRadius: "100%",
         boxShadow: "0.375em 0.375em 0 0 rgba(15, 28, 63, 0.125)",
         // height: "371px",
         //   width: "5em"
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
      <EventsPreviewCarousel
         id={"my-next-events"}
         type={EventsTypes.myNext}
         events={events}
         isEmpty={Boolean(!isLoading && !events.length)}
         title={"My registrations"}
         loading={isLoading}
         seeMoreLink="/next-livestreams/my-registrations" // TODO: does not make sense when showing the empty message
         styling={{
            backgroundSx: styles.eventsBackground,
            compact: true,
            seeMoreSx: {
               textDecoration: "underline",
            },
            showArrows: false,
         }}
      >
         <Box sx={styles.cardWrapper}>
            {/* <Box sx={styles.cardWrapperContainerCircleOne}> */}
            <Box sx={styles.cardWrapperContainerCircle}>
               <Stack
                  spacing={1.25}
                  alignItems="center"
                  flexDirection={"column"}
               >
                  <Box>
                     {
                        <Heading sx={styles.noRegistrations.title}>
                           No registrations Yet!
                        </Heading>
                     }
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
                     >
                        <Typography>Check all live streams</Typography>
                     </Button>
                  </Box>
               </Stack>
               {/* </Box> */}
            </Box>
         </Box>
      </EventsPreviewCarousel>
   )
}

interface Props {
   limit?: number
}

export default MyNextEvents

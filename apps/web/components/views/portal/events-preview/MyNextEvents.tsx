import { Box, Button, Stack, Typography } from "@mui/material"
import useRegisteredStreams from "components/custom-hook/useRegisteredStreams"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import { useAuth } from "../../../../HOCs/AuthProvider"
import Heading from "../common/Heading"
import EventsPreviewCarousel, { EventsTypes } from "./EventsPreviewCarousel"

const styles = sxStyles({
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
      fontWeight: "600",
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
         lineHeight: "27px",
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
   boxContainerEmpty: {
      pr: {
         xs: 2,
         xl: 0,
      },
   },
   boxContainer: {
      pb: 1,
   },
})
const MyNextEvents = () => {
   const { authenticatedUser } = useAuth()
   const { data: registeredStreams, isLoading } = useRegisteredStreams()

   if (!authenticatedUser.email) {
      return null
   }
   return (
      <Box
         sx={[
            registeredStreams?.length > 0 ? null : styles.boxContainerEmpty,
            styles.boxContainer,
         ]}
      >
         <ConditionalWrapper
            condition={Boolean(registeredStreams?.length)}
            fallback={<EmptyRegistrationsBanner></EmptyRegistrationsBanner>}
         >
            <EventsPreviewCarousel
               id={"my-next-events"}
               type={EventsTypes.MY_NEXT}
               events={registeredStreams}
               isEmpty={Boolean(!isLoading && !registeredStreams?.length)}
               title={MY_NEXT_EVENTS_TITLE}
               loading={isLoading}
               seeMoreLink="/next-livestreams/my-registrations"
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
               variant={"brandedH4"}
               sx={styles.title}
               fontWeight={"600"}
               color="neutral.800"
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
                        No registrations yet!
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

export default MyNextEvents

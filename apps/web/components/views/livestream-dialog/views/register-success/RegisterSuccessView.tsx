import React, { FC, useEffect } from "react"
import BaseDialogView, { MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import { sxStyles } from "../../../../../types/commonTypes"
import { Box, Button, Grow, Typography } from "@mui/material"
import { confetti } from "../../../../../constants/images"
import Image from "next/image"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import Stack from "@mui/material/Stack"
import CalendarIcon from "@mui/icons-material/CalendarTodayOutlined"
import Link from "../../../common/Link"
import { AddToCalendar } from "../../../common/AddToCalendar"
import { responsiveConfetti } from "../../../../util/confetti"

const styles = sxStyles({
   fullHeight: {
      height: "100%",
   },
   mainContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      py: {
         md: 5,
      },
      lineHeight: "150%",
      justifyContent: {
         xs: "space-between",
         md: "center",
      },
      minHeight: {
         xs: 650,
      },
   },
   confettiGraphic: {
      mx: "auto",
   },
   title: {
      display: "inline-block",
      position: "relative",
      textAlign: "center",
      fontWeight: 600,
   },
   description: {
      textAlign: "center",
      fontSize: "1.142rem",
      my: "auto",
      maxWidth: 680,
   },
   btn: {
      textTransform: "none",
      boxShadow: "none",
   },
   discoverBtn: {
      color: "grey.600",
   },
   buttons: {
      maxWidth: 400,
      width: "100%",
   },
})

type Props = {}

const RegisterSuccessView: FC<Props> = () => {
   const { closeDialog, livestream, activeView } = useLiveStreamDialog()

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
               sx={[styles.fullHeight]}
               onBackClick={closeDialog}
               onBackPosition="top-right"
            >
               <Grow in>
                  <Box sx={styles.mainContent}>
                     <Box sx={styles.confettiGraphic}>
                        <Image
                           src={confetti}
                           objectFit={"contain"}
                           width={150}
                           height={150}
                           priority
                           quality={100}
                           alt={"confetti"}
                        />
                     </Box>
                     <Typography mb={2} sx={styles.title} variant={"h2"}>
                        Registration{" "}
                        <Typography
                           sx={styles.title}
                           variant={"h2"}
                           color="primary.main"
                        >
                           Successful
                        </Typography>
                     </Typography>
                     <Typography sx={styles.description}>
                        You can continue exploring and browsing through other
                        content on our platform. We will send you a reminder as
                        soon as this live stream is about to start, so you can
                        join it. Additionally, you can add the live stream to
                        your calendar to ensure you don't forget about it.
                     </Typography>
                     <Stack spacing={1} mt={4} sx={styles.buttons}>
                        <AddToCalendar
                           event={livestream}
                           filename={`${livestream.company}-event`}
                        >
                           {(handleClick) => (
                              <Button
                                 fullWidth
                                 variant={"contained"}
                                 color={"secondary"}
                                 onClick={handleClick}
                                 sx={styles.btn}
                                 startIcon={<CalendarIcon />}
                              >
                                 Add to calendar
                              </Button>
                           )}
                        </AddToCalendar>

                        <Button
                           component={Link}
                           href={"/next-livestreams"}
                           fullWidth
                           variant={"text"}
                           color={"grey"}
                           sx={[styles.btn, styles.discoverBtn]}
                        >
                           Discover more live streams
                        </Button>
                     </Stack>
                  </Box>
               </Grow>
            </MainContent>
         }
      />
   )
}

export default RegisterSuccessView

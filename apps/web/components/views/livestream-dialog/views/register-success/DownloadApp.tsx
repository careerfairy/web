import CalendarIcon from "@mui/icons-material/CalendarTodayOutlined"
import { Box, Button, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import Image from "next/legacy/image"
import { FC } from "react"
import { Download } from "react-feather"
import {
   appQrCodeLSRegistration,
   confetti,
} from "../../../../../constants/images"
import { sxStyles } from "../../../../../types/commonTypes"
import useIsMobile from "../../../../custom-hook/useIsMobile"
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
   title: {
      textAlign: "center",
      fontWeight: 700,
      pt: { xs: 1, md: 0 },
      mb: 1,
   },
   bigTitle: {
      fontSize: { xs: "28px !important", md: "48px !important" },
   },
   description: {
      textAlign: "center",
      maxWidth: 680,
      fontWeight: 400,
      width: { xs: "100%", md: "initial" },
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
   transition: {
      transition: "all 0.5s",
   },
   contentWrapper: {
      display: "flex",
      flexDirection: "column",
      gap: "12px !important",
      justifyContent: "center",
      height: "100%",
   },
   copy: {
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   actionsDesktop: (theme) => ({
      padding: "16px",
      gap: "12px",
      display: "flex",
      flexDirection: "row",
      borderRadius: "17px",
      border: `1px solid ${theme.palette.primary["200"]}`,
      background: `${theme.palette.primary.light}`,
   }),
   actionsDesktopContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
      gap: "12px",
   },
   actionsDesktopTitle: {
      textAlign: "center",
      fontStyle: "normal",
      fontWeight: 500,
   },
   actionsDesktopOr: {
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "20px !important",
   },
   addToCalendarButtonDesktop: {
      display: "flex",
      padding: "8px 16px",
      justifyContent: "center",
      alignItems: "center",
      gap: "6px",
      fontFamily: "Poppins",
      fontSize: 14,
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "20px",
   },
})

export const DownloadApp: FC = () => {
   const { closeDialog, goToView } = useLiveStreamDialog()
   const isMobile = useIsMobile()

   return (
      <BaseDialogView
         sx={styles.fullHeight}
         mainContent={
            <MainContent
               sx={[styles.fullHeight, styles.mainContentWrapper]}
               onBackClick={closeDialog}
               onBackPosition="top-right"
            >
               <Box sx={styles.contentWrapper}>
                  <Box sx={styles.header}>
                     <Box sx={styles.confettiGraphic}>
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
                        sx={[styles.title, styles.transition, styles.bigTitle]}
                        variant="brandedH1"
                        component="h1"
                        data-testid="registration-success-heading"
                     >
                        {"Get "}
                        <Typography
                           variant="brandedH1"
                           color="primary.main"
                           sx={styles.bigTitle}
                        >
                           Notified
                        </Typography>
                        {"!"}
                     </Typography>
                  </Box>
                  <Box sx={styles.copy} gap={4}>
                     <Typography variant="brandedBody" sx={styles.description}>
                        Download our mobile app to get notified when this event
                        starts!
                     </Typography>
                     {isMobile ? <ActionsMobile /> : <ActionsDesktop />}
                  </Box>
               </Box>
               {/* TODO: Remove this button after reviewing the recommendations view PR */}
               <Button
                  variant="contained"
                  onClick={() => goToView("recommendations")}
               >
                  Go to new view
               </Button>
            </MainContent>
         }
      />
   )
}

const ActionsDesktop = () => {
   return (
      <Box sx={styles.actionsDesktop}>
         <Image
            src={appQrCodeLSRegistration}
            alt="App QR code"
            width={147}
            height={147}
         />
         <Box sx={styles.actionsDesktopContent}>
            <Typography variant="brandedH5" sx={styles.actionsDesktopTitle}>
               Scan to download CareerFairy App!
            </Typography>
            <Typography variant="small" sx={styles.actionsDesktopOr}>
               or
            </Typography>
            <AddToCalendarButton />
         </Box>
      </Box>
   )
}

const ActionsMobile = () => {
   return (
      <Box sx={styles.buttonsWrapper}>
         <Stack spacing={1.2} sx={styles.buttons}>
            <Button
               variant="contained"
               component="a"
               href={
                  "/install-mobile-application?utm_source=careerfairy&utm_campaign=AppDownloadQ12025&utm_medium=lsregistrationbutton&utm_content=appdownload"
               }
               target="_blank"
               startIcon={<Download />}
            >
               Download app
            </Button>
            <AddToCalendarButton />
         </Stack>
      </Box>
   )
}

const AddToCalendarButton = () => {
   const isMobile = useIsMobile()
   const { livestream } = useLiveStreamDialog()
   return (
      <AddToCalendar
         event={livestream}
         filename={`${livestream.company}-event`}
      >
         {(handleClick) => (
            <Button
               fullWidth={isMobile}
               variant="outlined"
               color="primary"
               onClick={handleClick}
               size="large"
               startIcon={<CalendarIcon />}
               sx={!isMobile ? styles.addToCalendarButtonDesktop : {}}
            >
               Add to calendar
            </Button>
         )}
      </AddToCalendar>
   )
}

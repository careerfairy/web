import { Box, Button, Stack, Typography } from "@mui/material"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerEvent } from "util/analyticsUtils"
import { useCompanyPage } from ".."
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   banner: (theme) => ({
      borderRadius: "12px",
      p: 3,
      pb: 0,
      width: "100%",
      height: "auto",
      position: "relative",
      overflow: "hidden",
      mx: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      // Mobile gradient
      background: `linear-gradient(148deg, ${theme.palette.primary[600]} 19.92%, #F5B07E 107.66%)`,
      // Desktop gradient
      [theme.breakpoints.up("md")]: {
         pb: 3,
         alignItems: "flex-start",
         background: `linear-gradient(98deg, ${theme.palette.primary[600]} 0%, #F5B07E 100%)`,
         // Switch to mobile layout when banner width < 355px on desktop
         [theme.breakpoints.down(1150)]: {
            alignItems: "center",
            pb: 0,
            background: `linear-gradient(148deg, ${theme.palette.primary[600]} 19.92%, #F5B07E 107.66%)`,
         },
      },
   }),
   textContent: (theme) => ({
      width: "100%",
      position: "relative",
      zIndex: 2,
      // Desktop layout
      [theme.breakpoints.up("md")]: {
         width: "60%",
         // Switch to mobile layout when banner width < 355px on desktop
         [theme.breakpoints.down(1150)]: {
            width: "100%",
         },
      },
   }),
   title: {
      color: "common.white",
      fontWeight: 600,
   },
   description: {
      color: "common.white",
   },
   button: {
      borderColor: "primary.600",
      color: "primary.600",
      "&:hover": {
         backgroundColor: "primary.50",
         borderColor: "primary.600",
         color: "primary.600",
      },
   },
   backgroundImage: (theme) => ({
      position: "absolute",
      right: "auto",
      top: "auto",
      bottom: "-130px",
      pointerEvents: "none",
      // Desktop layout
      [theme.breakpoints.up("md")]: {
         right: "-120px",
         top: 0,
         bottom: 0,
         // Switch to mobile layout when banner width < 355px on desktop
         [theme.breakpoints.down(1150)]: {
            right: "auto",
            top: "auto",
            bottom: "-130px",
         },
      },
   }),
   modelImage: (theme) => ({
      position: "relative",
      maxHeight: "200px",
      height: "auto",
      width: "auto",
      right: "auto",
      bottom: "auto",
      display: "block",
      pointerEvents: "none",
      // Desktop layout
      [theme.breakpoints.up("md")]: {
         position: "absolute",
         maxHeight: "none",
         height: "100%",
         width: "auto",
         right: "-20px",
         bottom: 0,
         // Switch to mobile layout when banner width < 355px on desktop
         [theme.breakpoints.down(1150)]: {
            position: "relative",
            maxHeight: "200px",
            height: "auto",
            width: "auto",
            right: "auto",
            bottom: "auto",
         },
      },
   }),
})

export const CoffeeChatsSection = () => {
   const { group } = useCompanyPage()

   const handleClick = () => {
      dataLayerEvent(AnalyticsEvents.CompanyPageCoffeeChatsClick, {
         companyName: group.universityName,
         companyId: group.id,
      })
      window.open("https://tally.so/r/mKqrbD", "_blank")
   }

   return (
      <Box sx={styles.banner}>
         <Box sx={styles.textContent}>
            <Stack spacing={2}>
               <Typography variant="brandedH5" sx={styles.title}>
                  Want to meet {group.universityName}?
               </Typography>
               <Typography variant="brandedBody" sx={styles.description}>
                  Join their upcoming coffee chat and get to know the team.
               </Typography>
               <Box>
                  <Button
                     variant="outlined"
                     sx={styles.button}
                     onClick={handleClick}
                  >
                     Book a chat
                  </Button>
               </Box>
            </Stack>
         </Box>
         <Box
            component="img"
            src="https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/CoffeeChats%2FCoffee-chat-star-background.svg?alt=media&token=d7387610-9b53-485c-956a-7deddd3b296e"
            alt=""
            sx={styles.backgroundImage}
         />
         <Box
            component="img"
            src="https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/CoffeeChats%2Fcoffee-chats-girl-model.webp?alt=media&token=34428295-c744-48fc-a7e9-cc57c9c5c593"
            alt=""
            sx={styles.modelImage}
         />
      </Box>
   )
}

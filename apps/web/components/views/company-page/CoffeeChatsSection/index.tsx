import { Box, Button, Stack, Typography } from "@mui/material"
import { useCompanyPage } from ".."
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   banner: {
      background: "linear-gradient(98deg, #2ABAA5 0%, #F5B07E 100%)",
      borderRadius: "12px",
      p: 3,
      width: "100%",
      height: "auto",
      position: "relative",
      overflow: "hidden",
   },
   textContent: {
      width: "40%",
   },
   title: {
      color: (theme) => theme.brand.white[50],
   },
   description: {
      color: (theme) => theme.brand.white[50],
   },
   button: {
      borderColor: (theme) => theme.brand.white[50],
      color: (theme) => theme.brand.white[50],
      "&:hover": {
         borderColor: (theme) => theme.brand.white[50],
         backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
   },
   backgroundImage: {
      position: "absolute",
      right: "-166px",
      top: 0,
      bottom: 0,
      pointerEvents: "none",
   },
})

export const CoffeeChatsSection = () => {
   const { group } = useCompanyPage()

   return (
      <Box sx={styles.banner}>
         <Box sx={styles.textContent}>
            <Stack spacing={2}>
               <Typography variant="desktopBrandedH5" sx={styles.title}>
                  Want to meet {group.universityName}?
               </Typography>
               <Typography variant="brandedBody" sx={styles.description}>
                  Join their upcoming coffee chat and get to know the team.
               </Typography>
               <Box>
                  <Button variant="outlined" sx={styles.button}>
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
      </Box>
   )
}

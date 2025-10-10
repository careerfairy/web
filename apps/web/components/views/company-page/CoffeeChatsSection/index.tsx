import { Box, Button, Stack, Typography } from "@mui/material"
import { useCompanyPage } from ".."
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   banner: {
      background: "linear-gradient(98deg, #2ABAA5 0%, #F5B07E 100%)",
      borderRadius: "12px",
      p: 3,
      pb: { xs: 0, md: 3 },
      width: "100%",
      height: "auto",
      position: "relative",
      overflow: "hidden",
      mx: { xs: 2, md: 0 },
   },
   textContent: {
      width: { xs: "100%", md: "60%" },
   },
   title: {
      color: (theme) => theme.brand.white[50],
      fontWeight: 600,
   },
   description: {
      color: (theme) => theme.brand.white[50],
   },
   button: {
      borderColor: (theme) => theme.brand.tq[600],
      color: (theme) => theme.brand.tq[600],
      "&:hover": {
         backgroundColor: (theme) => theme.brand.tq[50],
         borderColor: (theme) => theme.brand.tq[600],
         color: (theme) => theme.brand.tq[600],
      },
   },
   backgroundImage: {
      position: "absolute",
      right: { xs: 0, md: "-120px" },
      top: { xs: "auto", md: 0 },
      bottom: { xs: "-110px", md: 0 },
      pointerEvents: "none",
   },
   modelImage: {
      position: { xs: "relative", md: "absolute" },
      height: { xs: "auto", md: "100%" },
      width: { xs: "70%", md: "auto" },
      right: { xs: "auto", md: "-20px" },
      bottom: { xs: "auto", md: 0 },
      display: "block",
      pointerEvents: "none",
   },
})

export const CoffeeChatsSection = () => {
   const { group } = useCompanyPage()

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
         <Box
            component="img"
            src="https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/CoffeeChats%2Fcoffee-chats-girl-model.webp?alt=media&token=34428295-c744-48fc-a7e9-cc57c9c5c593"
            alt=""
            sx={styles.modelImage}
         />
      </Box>
   )
}

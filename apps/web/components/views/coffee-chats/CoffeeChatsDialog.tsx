import CloseIcon from "@mui/icons-material/Close"
import {
   Button,
   DialogProps,
   IconButton,
   Stack,
   Typography,
} from "@mui/material"
import Box from "@mui/material/Box"
import { CoffeeChatsBadge } from "components/views/common/icons/CoffeeChatsIcon"
import { ResponsiveDialogLayout } from "components/views/common/ResponsiveDialog"
import { sxStyles } from "types/commonTypes"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerEvent } from "util/analyticsUtils"

type CoffeeChatsDialogProps = {
   open: boolean
   onClose: () => void
   companyName?: string
   bookChatLink: string
   source?: "livestreamDialog" | "streamingPage"
   TransitionComponent?: DialogProps["TransitionComponent"]
}

const styles = sxStyles({
   paper: {
      borderRadius: "20px",
      borderBottomLeftRadius: {
         md: "20px",
         xs: "0px",
      },
      borderBottomRightRadius: {
         md: "20px",
         xs: "0px",
      },
      maxWidth: { xs: "100%", md: "517px" },
   },
   drawerRoot: {
      zIndex: (theme) => theme.zIndex.modal + 1,
   },
   container: {
      display: "flex",
      flexDirection: "column",
      gap: 3,
      p: { xs: 1.5, md: 1.5 },
      pb: { xs: 3, md: 3 },
      position: "relative",
   },
   headerImage: (theme) => ({
      position: "relative",
      height: 177,
      width: "100%",
      borderRadius: "12px",
      overflow: "hidden",
      border: `1px solid ${theme.brand.white[200]}`,
      background: `linear-gradient(97deg, #2ABAA5 0%, #F5B07E 172.04%)`,
   }),
   starBackground: {
      position: "absolute",
      top: "-35px",
      left: "50%",
      width: "320px",
      height: "320px",
      transform: "translateX(-45%) rotate(-5deg)",
      pointerEvents: "none",
   },
   modelImage: {
      position: "absolute",
      top: "5px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "243px",
      height: "240px",
      pointerEvents: "none",
      objectFit: "cover",
   },
   closeButton: {
      position: "absolute",
      right: 0,
      backgroundColor: "transparent",
      color: "white",
      "&:hover": {
         backgroundColor: "transparent",
      },
      "& svg": {
         width: 24,
         height: 24,
      },
   },
   coffeePrompt: {
      position: "absolute",
      bottom: "8px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      pl: 0.25,
      pr: 1.5,
      py: 0.25,
      borderRadius: "60px",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(30px)",
      border: "0.7px solid white",
   },
   coffeeIcon: {
      width: 22,
      height: 22,
   },
   promptText: {
      color: "neutral.800",
      fontWeight: 400,
      whiteSpace: "nowrap",
   },
   content: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      width: { xs: "100%", md: 477 },
      mx: "auto",
      textAlign: "center",
   },
   title: {
      color: "neutral.800",
      fontWeight: 700,
   },
   body: {
      color: "neutral.700",
      fontWeight: 400,
   },
   actions: {
      display: "flex",
      gap: 1.5,
      width: "100%",
      justifyContent: "center",
      flexDirection: { xs: "column", md: "row" },
      alignItems: "center",
   },
   button: {
      width: { xs: "100%", md: "auto" },
      flex: { xs: "none", md: 1 },
      px: 3,
      py: 1,
      borderRadius: "20px",
   },
})

export const CoffeeChatsDialog = ({
   open,
   onClose,
   companyName = "Zurich Schweiz Versicherung",
   TransitionComponent,
   bookChatLink,
   source = "livestreamDialog",
}: CoffeeChatsDialogProps) => {
   const handleBookChat = () => {
      if (source === "livestreamDialog") {
         dataLayerEvent(AnalyticsEvents.LivestreamDialogCoffeeChatsClick, {
            companyName: companyName,
         })
      } else if (source === "streamingPage") {
         dataLayerEvent(AnalyticsEvents.StreamingPageCoffeeChatsClick, {
            companyName: companyName,
         })
      }
      window.open(bookChatLink, "_blank")
      onClose()
   }

   return (
      <ResponsiveDialogLayout
         open={open}
         handleClose={onClose}
         dialogPaperStyles={styles.paper}
         drawerStyles={styles.drawerRoot}
         TransitionComponent={TransitionComponent}
         SlideProps={{ appear: true }}
      >
         <ResponsiveDialogLayout.Content>
            <Box sx={styles.container}>
               <Box sx={styles.headerImage}>
                  {/* Star background image */}
                  <Box
                     component="img"
                     src="https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/CoffeeChats%2FCoffee-chat-star-background.svg?alt=media&token=d7387610-9b53-485c-956a-7deddd3b296e"
                     alt=""
                     sx={styles.starBackground}
                  />

                  {/* Model image */}
                  <Box
                     component="img"
                     src="https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/CoffeeChats%2Fcoffee-chats-girl-model.webp?alt=media&token=34428295-c744-48fc-a7e9-cc57c9c5c593"
                     alt=""
                     sx={styles.modelImage}
                  />

                  <IconButton
                     onClick={onClose}
                     sx={styles.closeButton}
                     aria-label="close"
                  >
                     <CloseIcon />
                  </IconButton>

                  {/* Coffee chat prompt badge */}
                  <Box sx={styles.coffeePrompt}>
                     <CoffeeChatsBadge sx={styles.coffeeIcon} />
                     <Typography variant="xsmall" sx={styles.promptText}>
                        You&apos;re invited to have a coffee
                     </Typography>
                  </Box>
               </Box>

               <Box sx={styles.content}>
                  <Stack>
                     <Typography variant="brandedH5" sx={styles.title}>
                        {companyName}
                     </Typography>
                     <Typography variant="brandedH5" sx={styles.title}>
                        wants to have a coffee!
                     </Typography>
                  </Stack>

                  <Typography variant="medium" sx={styles.body}>
                     You just signed up for their livestream, now grab the
                     chance to chat with them directly in a casual coffee chat.
                  </Typography>

                  <Box sx={styles.actions}>
                     <Button
                        variant="outlined"
                        color="grey"
                        onClick={onClose}
                        sx={styles.button}
                     >
                        Lose this chance
                     </Button>
                     <Button
                        variant="contained"
                        color="primary"
                        onClick={handleBookChat}
                        sx={styles.button}
                     >
                        Book a chat
                     </Button>
                  </Box>
               </Box>
            </Box>
         </ResponsiveDialogLayout.Content>
      </ResponsiveDialogLayout>
   )
}

export default CoffeeChatsDialog

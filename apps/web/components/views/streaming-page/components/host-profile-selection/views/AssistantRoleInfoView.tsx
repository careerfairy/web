import { Box, Button } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { ShieldUserIcon } from "components/views/common/icons/ShieldUserIcon"
import { sxStyles } from "types/commonTypes"
import { useHostProfileSelection } from "../HostProfileSelectionProvider"
import { View } from "../View"

const styles = sxStyles({
   outerLogoContainer: {
      width: 140,
      height: 140,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mb: 3,
   },
   innerLogoContainer: {
      width: 140,
      height: 140,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: (theme) => theme.palette.secondary[50],
      border: (theme) => `1.75px solid ${theme.palette.secondary.light}`,
      "& svg": {
         color: (theme) => theme.brand.purple[500],
         width: 70,
         height: 70,
      },
   },
   assistantText: {
      color: (theme) => theme.palette.secondary.main,
   },
})

export const AssistantRoleInfoView = () => {
   const { goBackToSelectSpeaker, joinLiveStreamAsAssistant } =
      useHostProfileSelection()
   const isMobile = useStreamIsMobile()

   return (
      <View
         sx={{
            height: isMobile ? "100%" : "auto",
         }}
      >
         <View.Content>
            <Box sx={styles.outerLogoContainer}>
               <Box sx={styles.innerLogoContainer}>
                  <ShieldUserIcon />
               </Box>
            </Box>
            <View.Title>
               Joining as{" "}
               <Box component="span" sx={styles.assistantText}>
                  assistant
               </Box>
            </View.Title>
            <View.Subtitle>
               Assistants don&apos;t appear in the live stream unless they
               choose to while inside the room. They can type answers in the Q&A
               and participate in the chat.
            </View.Subtitle>
         </View.Content>
         <View.Actions>
            <Button
               color="grey"
               variant="outlined"
               onClick={goBackToSelectSpeaker}
            >
               Back
            </Button>
            <Button
               variant="contained"
               color="primary"
               onClick={joinLiveStreamAsAssistant}
            >
               Join live stream
            </Button>
         </View.Actions>
      </View>
   )
}

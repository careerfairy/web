import { Box, Button, Fade, Typography } from "@mui/material"
import FramerBox from "components/views/common/FramerBox"
import Image from "next/image"
import { useState } from "react"
import { Mail } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { BaseDetailView } from "./BaseDetailView"

const styles = sxStyles({
   wrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "start",
      height: "100%",
   },
   card: {
      backgroundColor: "secondary.50",
      borderRadius: 2,
      p: "14px",
      width: "100%",
      maxWidth: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 2.5,
      boxShadow: "none",
   },
   headingGroup: {
      display: "flex",
      flexDirection: "column",
      gap: 0.5,
   },
   title: {
      color: "#1c0d5e",
      fontWeight: 700,
   },
   highlightPill: {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      px: 0.5,
      borderRadius: "5px",
      alignSelf: "flex-start",
   },
   highlightGradient: {
      position: "absolute",
      inset: 0,
      borderRadius: "5px",
   },
   highlightLabel: {
      position: "relative",
      color: "#1c0d5e",
      fontWeight: 700,
   },
   mediaWrapper: {
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      width: "100%",
   },
   backgroundImageContainer: {
      position: "absolute",
      maxWidth: 270,
      width: "100%",
      height: "92%",
   },
   videoContainer: {
      position: "relative",
      maxWidth: 180,
      borderRadius: 2,
      overflow: "hidden",
      transition: "transform 0.3s ease-in-out",
      "&:hover": {
         transform: "scale(1.03)",
      },
   },
   video: {
      width: "100%",
      aspectRatio: "9 / 16",
      display: "block",
      backgroundColor: (theme) => theme.brand.white[100],
   },
   thumbnailOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: 2,
      overflow: "hidden",
   },
})

type HighlightsViewProps = {
   onBack: () => void
}

export const HighlightsView = ({ onBack }: HighlightsViewProps) => {
   const [isVideoReady, setIsVideoReady] = useState(false)
   const thumbnailUrl = "/highlights-coming-soon-thumbnail.png"
   const backgroundImageURL = "/highlights-coming-soon-background.png"

   const videoURL =
      "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/landing-videos%2Fhighlights-coming-soon-video.mp4?alt=media"

   const buttonURL =
      "https://b553325d.sibforms.com/serve/MUIFAMPLUz_HP01EsLMTfw5TMmnq_TC5fSEmrHNeC4evZKwp-euX492wpj06ifJbzpfiw8ZPpdo1Kk6cmlWTwiBYYAv9YA7ct9--kOwiGTLsOQswPJxSHY--2kSnhXd00DJteWZfEjm1zug-UKSLvuyOlAKFcAfZ1bACn0n4bIwXGyyAPFULOp18_6DLP4TmwvUtWq7Ltj4ef6R7"
   return (
      <BaseDetailView title="Highlights" onBack={onBack}>
         <Box sx={styles.wrapper}>
            <Box sx={styles.card}>
               <Box sx={styles.headingGroup}>
                  <Typography variant="brandedH5" sx={styles.title}>
                     Your best moments, ready to share with no hassle.
                  </Typography>
                  <Box sx={styles.highlightPill}>
                     <FramerBox
                        sx={styles.highlightGradient}
                        animate={{
                           background: [
                              "linear-gradient(90deg, #EB90FF 0%, #FFED94 50%, #FFD7AA 100%)",
                              "linear-gradient(90deg, #FFD7AA 0%, #EB90FF 50%, #FFED94 100%)",
                              "linear-gradient(90deg, #FFED94 0%, #FFD7AA 50%, #EB90FF 100%)",
                              "linear-gradient(90deg, #EB90FF 0%, #FFED94 50%, #FFD7AA 100%)",
                           ],
                        }}
                        transition={{
                           duration: 3,
                           repeat: Infinity,
                           ease: "linear",
                        }}
                     />
                     <Typography variant="brandedH5" sx={styles.highlightLabel}>
                        Coming soon!
                     </Typography>
                  </Box>
               </Box>
               <Box sx={styles.mediaWrapper}>
                  <Box sx={styles.backgroundImageContainer}>
                     <Image
                        src={backgroundImageURL}
                        alt=""
                        priority
                        fill
                        style={{
                           objectFit: "contain",
                        }}
                     />
                  </Box>
                  <Box sx={styles.videoContainer}>
                     <Box
                        component="video"
                        sx={styles.video}
                        src={videoURL}
                        autoPlay
                        loop
                        muted
                        playsInline
                        onLoadedData={() => setIsVideoReady(true)}
                     />
                     <Fade in={!isVideoReady} timeout={50}>
                        <Box sx={styles.thumbnailOverlay}>
                           <Image
                              src={thumbnailUrl}
                              priority
                              alt=""
                              fill
                              style={{
                                 objectFit: "cover",
                              }}
                           />
                        </Box>
                     </Fade>
                  </Box>
               </Box>
               <Button
                  startIcon={<Mail size={16} />}
                  variant="contained"
                  color="secondary"
                  fullWidth
                  component="a"
                  href={buttonURL}
                  target="_blank"
               >
                  Keep me posted
               </Button>
            </Box>
         </Box>
      </BaseDetailView>
   )
}

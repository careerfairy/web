import { Box, Typography, TypographyProps } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { sxStyles } from "types/commonTypes"
import { HostDetails } from "../../HostDetails"
import { SpeakersList } from "../SpeakersList"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   rootMobile: {
      px: 2,
   },
   rootDesktop: {
      p: 4,
   },
   title: {
      fontWeight: 700,
      textAlign: "center",
   },
})

export const SelectSpeakerView = () => {
   const streamIsMobile = useStreamIsMobile()
   return (
      <Box
         sx={[
            styles.root,
            streamIsMobile ? styles.rootMobile : styles.rootDesktop,
         ]}
      >
         <HostDetails />
         <Title>
            Welcome to your{" "}
            <Box component="span" color="primary.main">
               stream
            </Box>
            :
         </Title>
         <SpeakersList />
      </Box>
   )
}

const Title = ({ children, ...props }: TypographyProps) => {
   const streamIsMobile = useStreamIsMobile()

   return (
      <Typography
         sx={styles.title}
         variant={streamIsMobile ? "desktopBrandedH3" : "mobileBrandedH2"}
         {...props}
      >
         {children}
      </Typography>
   )
}

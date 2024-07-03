import { Box, Typography } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import FramerBox from "components/views/common/FramerBox"
import {
   useStartsAt,
   useStreamTitle,
} from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
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
      py: 3,
   },
   rootDesktop: {
      p: 4,
   },
   heading: {
      fontWeight: 700,
      textAlign: "center",
      mt: {
         xs: 2,
         md: 3,
      },
   },
   subHeading: {
      color: "neutral.800",
      textAlign: "center",
      ...getMaxLineStyles(2),
      mb: {
         xs: 3.5,
         md: 4,
      },
   },
})

export const SelectSpeakerView = () => {
   const streamIsMobile = useStreamIsMobile()
   return (
      <FramerBox
         sx={[
            styles.root,
            streamIsMobile ? styles.rootMobile : styles.rootDesktop,
         ]}
      >
         <HostDetails />
         <StartDate />
         <Heading />
         <SubHeading />
         <SpeakersList />
      </FramerBox>
   )
}

const Heading = () => {
   const streamIsMobile = useStreamIsMobile()

   return (
      <Typography
         sx={styles.heading}
         variant={streamIsMobile ? "desktopBrandedH3" : "mobileBrandedH2"}
      >
         Welcome to your{" "}
         <Box component="span" color="primary.main">
            stream
         </Box>
         :
      </Typography>
   )
}

const SubHeading = () => {
   const streamTitle = useStreamTitle()
   return (
      <Typography sx={styles.subHeading} variant="brandedH5">
         {streamTitle}
      </Typography>
   )
}

const StartDate = () => {
   const startsAt = useStartsAt()
   return (
      <Typography variant="small" color="neutral.700">
         Starting on: {DateUtil.formatDateTime(startsAt)}
      </Typography>
   )
}

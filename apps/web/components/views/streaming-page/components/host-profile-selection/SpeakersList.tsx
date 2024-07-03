import { Typography } from "@mui/material"
import { useLivestreamData } from "components/custom-hook/streaming"
import FramerBox from "components/views/common/FramerBox"
import { Variants } from "framer-motion"
import { Fragment, useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import { useHostProfileSelection } from "./HostProfileSelectionProvider"
import { SpeakerButton } from "./SpeakerButton"

const styles = sxStyles({
   root: {
      maxWidth: 706,
      display: "flex",
      gap: "24px",
      flexWrap: "wrap",
      justifyContent: "center",
   },
   item: {
      width: {
         xs: 96,
         sm: 116,
      },
      display: "flex",
      justifyContent: "center",
   },
   heading: {
      color: "neutral.700",
      mb: 2.5,
   },
})

const containerVariants: Variants = {
   hidden: { opacity: 0 },
   visible: {
      opacity: 1,
      transition: {
         staggerChildren: 0.2,
      },
   },
}

const itemVariants: Variants = {
   hidden: { opacity: 0, scale: 0.9 },
   visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
}

export const SpeakersList = () => {
   const { selectSpeaker } = useHostProfileSelection()
   const livestream = useLivestreamData()

   const speakers = useMemo(() => {
      return [
         ...(livestream?.speakers || []),
         ...(livestream?.adHocSpeakers || []),
      ]
   }, [livestream.speakers, livestream.adHocSpeakers])

   return (
      <Fragment>
         <Typography sx={styles.heading} variant="medium">
            Please select your profile:
         </Typography>
         <FramerBox
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            sx={styles.root}
         >
            {speakers.map((speaker) => (
               <FramerBox
                  key={speaker.id}
                  sx={styles.item}
                  variants={itemVariants}
               >
                  <SpeakerButton
                     onClick={() => selectSpeaker(speaker)}
                     speaker={speaker}
                  />
               </FramerBox>
            ))}
         </FramerBox>
      </Fragment>
   )
}

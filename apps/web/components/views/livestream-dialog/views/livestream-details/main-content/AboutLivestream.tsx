import React, { FC } from "react"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import LinkifyText from "../../../../../util/LinkifyText"
import { Typography } from "@mui/material"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { sxStyles } from "../../../../../../types/commonTypes"
import Stack from "@mui/material/Stack"

const styles = sxStyles({
   companyName: {
      fontSize: "2.28rem",
   },
   summary: {
      fontSize: "1.285rem",
      whiteSpace: "pre-line",
   },
   customBullet: {
      listStyleType: "none",
      paddingLeft: "1em",
      position: "relative",
   },
   list: {
      listStyleType: "none",
      pl: 0,
      mb: 0,
   },
   listItem: {
      fontSize: "1.1428rem",
      display: "list-item",
      position: "relative",
      paddingLeft: 3,
      "&:not(:last-child)": {
         mb: 2.25,
      },
      "&::before": {
         content: "''",
         position: "absolute",
         left: 0,
         top: "0.36em",
         width: 15,
         height: 15,
         borderRadius: "50%",
         backgroundColor: "primary.main",
         background: `url(/icons/themed-check.svg)`,
         backgroundSize: "contain",
         backgroundRepeat: "no-repeat",
      },
   },
})

interface Props {
   presenter: LivestreamPresenter
}

const AboutLivestream: FC<Props> = ({ presenter }) => {
   return (
      <Box>
         <SectionTitle>About the live stream</SectionTitle>
         <Typography sx={styles.companyName} component="h3">
            {presenter.company}
         </Typography>
         <Stack spacing={6}>
            <LinkifyText>
               <Typography sx={styles.summary}>{presenter.summary}</Typography>
            </LinkifyText>
            <ReasonsToJoin presenter={presenter} />
         </Stack>
      </Box>
   )
}

type ReasonToJoinProps = {
   presenter: LivestreamPresenter
}

const ReasonsToJoin: FC<ReasonToJoinProps> = ({ presenter }) => {
   const reasonsToJoinLivestream = presenter.reasonsToJoinLivestream.trim()
   const hasReasonsToJoinLivestream = Boolean(reasonsToJoinLivestream)

   const reasonsList = reasonsToJoinLivestream.split("\n").map((reason) => {
      // replace the first occurrence of "-" but exclude any subsequent occurrences
      return reason.replace(/^-(?!.*-)/, "").trim()
   })

   if (!hasReasonsToJoinLivestream) {
      return null
   }

   return (
      <Box>
         <SectionTitle>Why should you join the Live Stream?</SectionTitle>
         <Box sx={styles.list} component="ul">
            {reasonsList.map((point) => (
               <Box sx={styles.listItem} component="li" key={point}>
                  <LinkifyText>
                     <Typography fontSize="inherit">{point}</Typography>
                  </LinkifyText>
               </Box>
            ))}
         </Box>
      </Box>
   )
}

export default AboutLivestream

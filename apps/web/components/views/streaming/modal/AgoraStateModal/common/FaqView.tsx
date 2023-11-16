import React, { useMemo } from "react"
import { Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import Link from "next/link"
import Box from "@mui/material/Box"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded"
import { getDictValues } from "../../../../../../util/CommonUtil"

const styles = sxStyles({
   cardRoot: {
      borderColor: "primary.main",
      borderRadius: 2,
      borderStyle: "solid",
      borderWidth: 1,
      p: 1.5,
      color: "text.primary",
   },
   viewHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   viewAction: {
      display: "flex",
      alignItems: "center",
      color: "secondary.main",
      "& svg": {
         ml: 1,
      },
   },
})
type FaqId = "whatIsACareerLiveStream" | "whichDeviceShouldIUseForTheLiveStream"

type Props = {
   faqIds?: FaqId[]
}
const FaqView = ({ faqIds }: Props) => {
   const faqElements = useMemo(() => getDictValues(faqIds, faqDict), [faqIds])

   return (
      <Stack spacing={2}>
         <Box sx={styles.viewHeader}>
            <Typography variant="h5" fontWeight={500}>
               Frequently Asked Questions
            </Typography>
            <Link href="/faq" target={"_blank"}>
               <Box sx={styles.viewAction}>
                  <Typography variant={"h6"} fontWeight={600}>
                     VIEW ALL
                  </Typography>
                  <ArrowForwardIosIcon />
               </Box>
            </Link>
         </Box>
         <Stack spacing={1.5}>
            {faqElements.map((resource) => (
               <FaqCard {...resource} key={resource.title} />
            ))}
         </Stack>
      </Stack>
   )
}

export default FaqView

interface FaqCardProps {
   title: string
   href: string
}

export const FaqCard = ({ href, title }: FaqCardProps) => {
   return (
      <Link href={href} target={"_blank"}>
         <Stack
            justifyContent={"space-between"}
            alignItems={"center"}
            sx={styles.cardRoot}
            direction={"row"}
            spacing={2}
         >
            <Typography fontWeight={400} variant="h6">
               {title}
            </Typography>
            <ArrowForwardRoundedIcon />
         </Stack>
      </Link>
   )
}

const faqDict: Record<FaqId, FaqCardProps> = {
   whatIsACareerLiveStream: {
      title: "What is a career live stream?",
      href: "https://support.careerfairy.io/en/article/live-streaming-on-careerfairy-pqhfx3/#1-what-is-a-career-live-stream",
   },
   whichDeviceShouldIUseForTheLiveStream: {
      title: "Which device should I use for the live stream?",
      href: "https://support.careerfairy.io/en/article/technical-requirements-to-use-careerfairy-1g4nk1t/#1-compatible-browsers",
   },
}

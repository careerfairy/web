import React, { ComponentProps } from "react"
import { Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import Link from "next/link"
import Box from "@mui/material/Box"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded"

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

type Props = {
   faqElements: ComponentProps<typeof FaqCard>[]
}
const FaqView = ({ faqElements }: Props) => {
   return (
      <Stack spacing={2}>
         <Box sx={styles.viewHeader}>
            <Typography variant="h5" fontWeight={500}>
               Frequently Asked Questions
            </Typography>
            <Link href="/faq">
               <a target={"_blank"}>
                  <Box sx={styles.viewAction}>
                     <Typography variant={"h5"} fontWeight={500}>
                        View all
                     </Typography>
                     <ArrowForwardIosIcon />
                  </Box>
               </a>
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
      <Link href={href}>
         <a target={"_blank"}>
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
         </a>
      </Link>
   )
}

export const faqResources: ComponentProps<typeof FaqCard>[] = [
   // {
   //    title: "How to use the Agora Live Streaming",
   //    href: "https://www.agora.io/en/blog/video-call-invitations-with-agora-rtm-and-rtc-using-vue-js-and-flask/",
   // },
   // {
   //    title: "How to use the Agora Live Streaming",
   //    href: "https://www.agora.io/en/blog/extensions-marketplace-how-to-add-voice-fx-to-your-android-application-using-agora-and-synervoz/",
   // },
]

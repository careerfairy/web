import { Box, Stack, StackProps, Typography, alpha } from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"
import Image from "next/image"
import { Calendar, MapPin } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useOfflineEventPreviewContext } from "./OfflineEventPreviewContext"

const styles = sxStyles({
   root: {
      width: "100%",
      height: "100%",
      overflowX: "hidden",
   },
   headerOverlayTop: {
      position: "absolute",
      inset: 0,
      background: (theme) =>
         `linear-gradient(0deg, ${alpha(
            theme.palette.common.black,
            0.2
         )} 0%, ${alpha(theme.palette.common.black, 0.2)} 100%)`,
      pointerEvents: "none",
   },
   headerOverlayBottom: {
      position: "absolute",
      inset: 0,
      background: (theme) =>
         `linear-gradient(180deg, ${alpha(
            theme.palette.common.black,
            0
         )} 73%, ${alpha(theme.palette.common.black, 0.5)} 97%)`,
      pointerEvents: "none",
   },
   headerImage: {
      position: "relative",
      width: "100%",
      aspectRatio: "3/2",
      overflow: "hidden",
      maxHeight: "40vh",
      borderTopLeftRadius: "12px",
      borderTopRightRadius: "12px",
   },
   details: {
      backgroundColor: (theme) => theme.brand.white[100],
      minHeight: "300px",
      borderRadius: "12px",
      p: "12px 8px",
      mt: -2,
      zIndex: 1,
   },
   subSection: {
      backgroundColor: (theme) => theme.brand.white[300],
      borderRadius: "8px",
      p: 1,
   },
   detailsItem: {
      p: 1,
      // minWidth: "300px",
   },
})

export type DetailsProps = {
   detailsDirection?: StackProps["direction"]
}

export type OfflineEventPreviewContentProps = DetailsProps

export const OfflineEventPreviewContent = ({
   detailsDirection = "row",
}: OfflineEventPreviewContentProps) => {
   return (
      <Stack sx={styles.root}>
         <Header />
         <Details detailsDirection={detailsDirection} />
      </Stack>
   )
}

const Header = () => {
   const { offlineEvent } = useOfflineEventPreviewContext()

   return (
      <Box sx={styles.headerImage}>
         <Image
            src={offlineEvent.backgroundImageUrl}
            alt={`${offlineEvent.title} banner`}
            fill
            style={{ objectFit: "cover" }}
            priority
         />
      </Box>
   )
}

const Details = ({ detailsDirection = "row" }: DetailsProps) => {
   const { offlineEvent } = useOfflineEventPreviewContext()

   return (
      <Stack sx={styles.details} spacing={1}>
         <Box pl={1}>
            <Typography
               variant="brandedH4"
               fontWeight={600}
               color={"neutral.800"}
            >
               {offlineEvent.title}
            </Typography>
         </Box>
         <Stack spacing={1} direction={detailsDirection} sx={styles.subSection}>
            <DetailsItem
               icon={<Box component={Calendar} size={18} />}
               title={"Monday, 25 Aug 2025"}
               subtitle={"13:00"}
            />
            <DetailsItem
               icon={<Box component={MapPin} size={18} />}
               title={"Bern, Switzerland"}
               subtitle={"Route de la glane"}
            />
         </Stack>
         <OrganizedBy />
         <About />
      </Stack>
   )
}

type DetailsItemProps = {
   icon: React.ReactNode
   title: string
   subtitle: string
}

const DetailsItem = ({ icon, title, subtitle }: DetailsItemProps) => {
   return (
      <Stack
         direction="row"
         alignItems="start"
         spacing={1}
         sx={styles.detailsItem}
      >
         <Box sx={{ pt: 0.5 }}>{icon}</Box>
         <Stack direction="column" alignItems="start" spacing={0}>
            <Typography variant="medium" color={"neutral.800"}>
               {title}
            </Typography>
            <Typography variant="medium" color={"neutral.600"}>
               {subtitle}
            </Typography>
         </Stack>
      </Stack>
   )
}

const OrganizedBy = () => {
   const { offlineEvent } = useOfflineEventPreviewContext()

   const groupIndustries =
      offlineEvent.group.companyIndustries
         ?.map((industry) => industry.name)
         .join(", ") || ""

   return (
      <Box alignItems={"start"} sx={styles.subSection}>
         <Stack spacing={1}>
            <Typography variant="medium" fontWeight={600} color={"neutral.800"}>
               Organized by
            </Typography>
            <Stack spacing={1} direction="row" alignItems="start">
               <CircularLogo
                  src={offlineEvent.group.logoUrl}
                  alt={offlineEvent.group.universityName}
                  size={40}
               />
               <Stack>
                  <Typography variant="medium" color={"neutral.800"}>
                     {offlineEvent.group.universityName}
                  </Typography>
                  <Typography variant="small" color={"neutral.700"}>
                     {groupIndustries}
                  </Typography>
               </Stack>
            </Stack>
         </Stack>
      </Box>
   )
}

const About = () => {
   const { offlineEvent } = useOfflineEventPreviewContext()

   return (
      <Stack spacing={1} sx={styles.subSection}>
         <Typography variant="medium" color={"neutral.800"} fontWeight={600}>
            About this event
         </Typography>
         <Typography
            sx={{ wordBreak: "break-word" }}
            variant="medium"
            color={"neutral.700"}
         >
            {offlineEvent.description}
         </Typography>
      </Stack>
   )
}

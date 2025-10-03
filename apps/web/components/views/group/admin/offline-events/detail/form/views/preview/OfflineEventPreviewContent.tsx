import {
   Box,
   Button,
   Skeleton,
   Stack,
   StackProps,
   SxProps,
   Theme,
   Typography,
   alpha,
} from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { DateTime } from "luxon"
import Image from "next/image"
import {
   Calendar,
   ChevronLeft,
   ChevronRight,
   MapPin,
   Share2,
} from "react-feather"
import { combineStyles, sxStyles } from "types/commonTypes"
import { useOfflineEventPreviewContext } from "./OfflineEventPreviewContext"

// Helper function to format date in the desired format: "Monday, 25 Aug 2025"
const formatEventDate = (date: Date | null | undefined): string => {
   if (!date) return ""

   const luxonDate = DateTime.fromJSDate(date)
   return luxonDate.toFormat("cccc, d MMM yyyy")
}

// Helper function to format time in the desired format: "13:00"
const formatEventTime = (date: Date | null | undefined): string => {
   if (!date) return ""

   const luxonDate = DateTime.fromJSDate(date)
   return luxonDate.toFormat("HH:mm")
}

const skeletonStyles = sxStyles({
   skeleton: {
      width: "100%",
   },
   default: {
      height: "30px",
      backgroundColor: "#CBCBCB",
   },
   secondary: {
      height: "25px",
      background: "rgba(203, 203, 203, 0.7)",
      width: "80%",
   },
})

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
      borderTopLeftRadius: "12px",
      borderTopRightRadius: "12px",
   },
   headerIcons: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      p: 1,
      zIndex: 2,
   },
   headerIcon: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      backgroundColor: (theme) => alpha(theme.palette.common.black, 0.3),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      "&:hover": {
         backgroundColor: (theme) => alpha(theme.palette.common.black, 0.5),
      },
      "& svg": {
         width: 10,
         height: 10,
         color: (theme) => theme.palette.common.white,
      },
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
      width: "100%",
   },
   aboutDescription: {
      wordBreak: "break-word",
      whiteSpace: "pre-line",
      color: (theme) => theme.palette.neutral[800],
   },
})

export type DetailsProps = {
   detailsDirection?: StackProps["direction"]
}

export type HeaderProps = {
   showHeaderIcons?: boolean
}

export type OfflineEventPreviewContentProps = DetailsProps & HeaderProps

export const OfflineEventPreviewContent = ({
   detailsDirection = "row",
   showHeaderIcons = false,
}: OfflineEventPreviewContentProps) => {
   return (
      <Stack sx={styles.root}>
         <Header showHeaderIcons={showHeaderIcons} />
         <Details detailsDirection={detailsDirection} />
      </Stack>
   )
}

const Header = ({ showHeaderIcons = false }: HeaderProps) => {
   const { offlineEvent } = useOfflineEventPreviewContext()

   return (
      <Box
         sx={[
            styles.headerImage,
            !offlineEvent.backgroundImageUrl && { backgroundColor: "#B4B4B4" },
         ]}
      >
         {offlineEvent.backgroundImageUrl ? (
            <Image
               src={offlineEvent.backgroundImageUrl}
               alt={`${offlineEvent.title} banner`}
               fill
               style={{ objectFit: "cover" }}
               priority
            />
         ) : null}
         <Box sx={styles.headerOverlayTop} />
         <Box sx={styles.headerOverlayBottom} />
         {showHeaderIcons ? (
            <Box sx={styles.headerIcons}>
               <Box sx={styles.headerIcon}>
                  <ChevronLeft />
               </Box>
               <Box sx={styles.headerIcon}>
                  <Share2 />
               </Box>
            </Box>
         ) : null}
      </Box>
   )
}

const Details = ({ detailsDirection = "row" }: DetailsProps) => {
   const { offlineEvent } = useOfflineEventPreviewContext()

   const startAtText = offlineEvent?.startAt
      ? formatEventDate(offlineEvent?.startAt?.toDate())
      : ""
   const startAtTimeText = offlineEvent?.startAt
      ? formatEventTime(offlineEvent?.startAt?.toDate())
      : ""

   const cityAndCountryText = offlineEvent?.address?.street
      ? `${offlineEvent?.address?.city}, ${offlineEvent?.address?.country}`
      : ""
   const streetText = offlineEvent?.address?.street
      ? `${offlineEvent?.address?.street} ${offlineEvent?.address?.city}, ${offlineEvent?.address?.country}`
      : ""

   return (
      <Stack sx={styles.details} spacing={1}>
         <Box pl={1}>
            <Typography
               variant="brandedH4"
               fontWeight={600}
               color={"neutral.800"}
            >
               <SkeletonWrapper
                  applySkeleton={!offlineEvent?.title?.length}
                  sx={{ width: "70%" }}
               >
                  <Typography variant="medium" color={"neutral.800"}>
                     {offlineEvent?.title}
                  </Typography>
               </SkeletonWrapper>
            </Typography>
         </Box>
         <Stack spacing={1} direction={detailsDirection} sx={styles.subSection}>
            <DetailsItem
               icon={<Box component={Calendar} size={18} />}
               title={startAtText}
               subtitle={startAtTimeText}
            />
            <DetailsItem
               icon={<Box component={MapPin} size={18} />}
               title={cityAndCountryText}
               subtitle={streetText}
            />
         </Stack>
         <OrganizedBy />
         <About />
         <Stack width={"100%"} alignItems={"center"} px={1}>
            <Button variant="contained" color="primary" sx={{ width: "100%" }}>
               <Typography
                  variant="medium"
                  color={(theme) => theme.brand.white[100]}
               >
                  Register to event
               </Typography>
            </Button>
         </Stack>
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
         <Stack
            direction="column"
            alignItems="start"
            spacing={0}
            sx={{ width: "100%" }}
         >
            <SkeletonWrapper applySkeleton={!title?.length}>
               <Typography variant="medium" color={"neutral.800"}>
                  {title}
               </Typography>
            </SkeletonWrapper>
            <SkeletonWrapper applySkeleton={!subtitle?.length} type="secondary">
               <Typography variant="medium" color={"neutral.600"}>
                  {subtitle}
               </Typography>
            </SkeletonWrapper>
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
            <Stack
               direction="row"
               justifyContent="space-between"
               alignItems="center"
            >
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
               <Box component={ChevronRight} size={16} color="neutral.700" />
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
         {offlineEvent.description ? (
            <Typography
               sx={styles.aboutDescription}
               variant="medium"
               color={"neutral.700"}
            >
               {offlineEvent.description}
            </Typography>
         ) : (
            <Stack>
               <Stack direction="row" spacing={1}>
                  <Skeleton width="40%" height="30px" />
                  <Skeleton width="100%" height="30px" />
               </Stack>
               <Stack direction="row" spacing={1}>
                  <Skeleton width="25%" height="25px" />
                  <Skeleton width="100%" height="25px" />
                  <Skeleton width="100%" height="25px" />
                  <Skeleton width="100%" height="25px" />
               </Stack>
               <Stack direction="row" spacing={1}>
                  <Skeleton width="60%" height="25px" />
                  <Skeleton width="100%" height="25px" />
               </Stack>

               <Stack direction="row" spacing={1}>
                  <Skeleton width="100%" height="30px" />
                  <Skeleton width="50%" height="30px" />
                  <Skeleton width="100%" height="30px" />
               </Stack>
            </Stack>
         )}
      </Stack>
   )
}

type SkeletonWrapperProps = {
   type?: "default" | "secondary"
   children: React.ReactNode
   applySkeleton?: boolean
   sx?: SxProps<Theme>
}

const SkeletonWrapper = ({
   type = "default",
   children,
   applySkeleton = false,
   sx,
}: SkeletonWrapperProps) => {
   if (!applySkeleton) {
      return children
   }
   return (
      <Skeleton
         sx={combineStyles(skeletonStyles.skeleton, skeletonStyles[type], sx)}
      />
   )
}

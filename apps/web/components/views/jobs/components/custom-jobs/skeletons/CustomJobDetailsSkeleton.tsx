import { Box, Skeleton, Stack, Typography } from "@mui/material"
import { combineStyles, sxStyles } from "types/commonTypes"

const responsiveBreakpoint = "md"

const styles = sxStyles({
   root: {
      p: {
         xs: 1,
         [responsiveBreakpoint]: 2.25,
      },
   },
   content: {
      mt: 4,
   },
   header: {
      display: "flex",
      backgroundColor: (theme) => theme.brand.white[400],
      borderRadius: "8px",
      padding: "12px",
   },
   headerLeftSide: {
      display: "flex",
      width: "100%",
      alignItems: "center",
   },
   headerContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "4px",
      ml: 3,
   },
   jobTitle: {
      fontWeight: 600,
   },
   subTitle: {
      fontSize: "18px",
      fontWeight: 600,
   },
   editButton: {
      textTransform: "none",
      color: "#A0A0A0",
      width: "max-content",
   },
   mobileEditBtnSection: {
      mb: 3,
      display: "flex",
      justifyContent: "center",
   },
   detailsWrapper: {
      display: { xs: "flex", md: "inline" },
      flexDirection: "column",
   },
   details: {
      color: "#8B8B8B",
      fontSize: "12px",
   },
   detailsValue: {
      display: "inline",

      "& svg": {
         verticalAlign: "bottom",
         mr: "6px !important",
      },
   },
   skeletonDetailsValue: {
      display: "flex",
      alignItems: "center",
   },
   logoSkeleton: {
      borderRadius: 4,
   },
   jobName: {
      fontWeight: 600,
   },
   html: {
      fontSize: "1.1rem",
      lineHeight: "1.7rem",
      width: "100%",
      overflowWrap: "break-word",
      wordWrap: "break-word",
      wordBreak: "break-word",
      hyphens: "auto",
      maxWidth: "100%",
      "& img": {
         maxWidth: "-webkit-fill-available",
      },
   },
   heroContent: {
      backgroundColor: (theme) => theme.brand.white[400],
      height: {
         xs: 100,
         md: 185,
      },
      borderRadius: 4,
   },
})

type Props = {
   heroContent?: boolean
}
export const CustomJobDetailsSkeleton = ({ heroContent }: Props) => {
   return (
      <>
         <Stack spacing={4.75} sx={combineStyles(styles.root)}>
            {heroContent ? <CustomJobHeroContentSkeleton /> : null}
            <Box>
               <CustomJobHeaderSkeleton />
               <Box sx={styles.content}>
                  <Stack spacing={2}>
                     <CustomJobDescriptionSkeleton />
                     <CustomJobLinkedContentsSkeleton />
                  </Stack>
               </Box>
            </Box>
         </Stack>
      </>
   )
}

export const CustomJobLinkedContentsSkeleton = () => {
   return <></>
}
export const CustomJobDescriptionSkeleton = () => {
   return (
      <Stack>
         <Typography component="h4" sx={styles.jobTitle}>
            <Skeleton width={200} />
         </Typography>
         <Typography sx={styles.html}>
            {[...Array(3)].map((_, i) => (
               <Skeleton key={i} />
            ))}
            <Skeleton width="50%" />
            <br />
            {[...Array(8)].map((_, i) => (
               <Skeleton key={i} />
            ))}
            <Skeleton width="40%" />
            <br />
            {[...Array(6)].map((_, i) => (
               <Skeleton key={i} />
            ))}
            <Skeleton width="60%" />
         </Typography>
      </Stack>
   )
}

export const CustomJobHeaderSkeleton = () => {
   return (
      <Box sx={styles.header}>
         <Box sx={styles.headerLeftSide}>
            <Skeleton
               sx={styles.logoSkeleton}
               variant={"rectangular"}
               width={63}
               height={63}
            />
            <Box sx={styles.headerContent}>
               <Typography variant={"h4"} sx={styles.jobName}>
                  <Skeleton width={300} />
               </Typography>

               <Box sx={styles.detailsWrapper}>
                  <Typography variant={"subtitle1"} sx={styles.details}>
                     <Stack
                        direction={"row"}
                        spacing={2}
                        sx={styles.skeletonDetailsValue}
                     >
                        <Skeleton
                           sx={styles.logoSkeleton}
                           variant={"rectangular"}
                           width={14}
                           height={14}
                        />
                        <Skeleton width={100} />
                        <Skeleton
                           sx={styles.logoSkeleton}
                           variant={"rectangular"}
                           width={14}
                           height={14}
                        />
                        <Skeleton width={100} />
                     </Stack>
                  </Typography>
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

const CustomJobHeroContentSkeleton = () => {
   return <Box sx={styles.heroContent} />
}

export default CustomJobDetailsSkeleton

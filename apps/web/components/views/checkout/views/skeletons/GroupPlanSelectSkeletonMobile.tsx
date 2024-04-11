import { Box, Skeleton, Stack } from "@mui/material"
import GroupPlansDialog, {
   GROUP_PLANS_DIALOG_SUBTITLE,
   GROUP_PLANS_DIALOG_TITLE,
   GROUP_PLANS_DIALOG_TITLE_SPARKS,
} from "../../GroupPlansDialog"
import { sxStyles } from "types/commonTypes"
import BrandedSwipableDrawer from "components/views/common/inputs/BrandedSwipeableDrawer"
import { FC } from "react"

const styles = sxStyles({
   mobilePaperRoot: { maxHeight: "95%", backgroundColor: "#F6F6FA" },
   skeletonWrapper: {
      p: "20px",
   },
   plansSkeletonWrapper: {
      pt: "15px",
      pb: "10px",
   },
   planSkeleton: {
      width: "33vw",
      height: "109px",
      backgroundColor: "lightgray",
      m: "5px",
   },
   planSkeletonTitle: {
      height: "48px",
      width: "60vw",
      backgroundColor: "lightgray",
   },
   planSkeletonDescription: {
      height: "20px",
      width: "70vw",
      backgroundColor: "lightgray",
   },
   planSkeletonPrice: {
      height: "24px",
      width: "50vw",
      backgroundColor: "lightgray",
   },
   planSkeletonFeatures: {
      height: "20px",
      width: "100%",
   },
   plansFeaturesSkeletonWrapper: {
      my: "25px",
      direction: "column",
      spacing: 1,
      alignItems: "start",
   },
   planSkeletonDisclaimer: {
      height: "20px",
      width: "90%",
      backgroundColor: "lightgrey",
   },
   planSkeletonConfirmButton: {
      height: "48px",
      width: "343px",
      borderRadius: "28px",
      backgroundColor: "lightgrey",
   },
   planSkeletonCancelButton: {
      height: "20px",
      width: "83px",
      px: "10px",
   },
   swipeableDrawer: {
      maxHeight: "90%",
   },
})

type GroupPlanSelectSkeletonMobileProps = {
   open: boolean
}

const GroupPlanSelectSkeletonMobile: FC<GroupPlanSelectSkeletonMobileProps> = ({
   open,
}) => {
   return (
      <BrandedSwipableDrawer
         sx={styles.swipeableDrawer}
         open={open}
         onOpen={() => {}}
         PaperProps={{
            sx: styles.mobilePaperRoot,
         }}
         transitionDuration={400}
         onClose={() => {}}
      >
         <Stack sx={styles.skeletonWrapper}>
            <Stack alignItems={"center"}>
               <GroupPlansDialog.Title>
                  {GROUP_PLANS_DIALOG_TITLE}
                  <Box component="span" color="secondary.main">
                     {GROUP_PLANS_DIALOG_TITLE_SPARKS}
                  </Box>{" "}
                  plan
               </GroupPlansDialog.Title>
               <GroupPlansDialog.Subtitle>
                  {GROUP_PLANS_DIALOG_SUBTITLE}
               </GroupPlansDialog.Subtitle>
            </Stack>
            <Stack
               direction={"row"}
               spacing={1}
               alignItems={"start"}
               sx={styles.plansSkeletonWrapper}
            >
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeleton}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeleton}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeleton}
               />
            </Stack>
            <Stack direction={"column"} spacing={1} alignItems={"start"}>
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonTitle}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonDescription}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonPrice}
               />
            </Stack>
            <Stack sx={styles.plansFeaturesSkeletonWrapper}>
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonFeatures}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonFeatures}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonFeatures}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonFeatures}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonFeatures}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonFeatures}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonFeatures}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonFeatures}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonDisclaimer}
               />
            </Stack>
            <Stack direction={"column"} spacing={2} alignItems={"center"}>
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonConfirmButton}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonCancelButton}
               />
            </Stack>
         </Stack>
      </BrandedSwipableDrawer>
   )
}

export default GroupPlanSelectSkeletonMobile

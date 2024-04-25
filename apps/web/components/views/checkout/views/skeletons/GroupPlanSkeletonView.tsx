import { Box, Dialog, IconButton, Skeleton, Stack } from "@mui/material"
import GroupPlansDialog, {
   GROUP_PLANS_DIALOG_SUBTITLE,
   GROUP_PLANS_DIALOG_TITLE,
   GROUP_PLANS_DIALOG_TITLE_SPARKS,
} from "../../GroupPlansDialog"
import { sxStyles } from "types/commonTypes"
import { SlideUpTransition } from "components/views/common/transitions"
import CloseIcon from "@mui/icons-material/CloseRounded"
import { FC } from "react"

const mobileBreakpoint = "md"

const styles = sxStyles({
   closeBtn: {
      position: "absolute",
      top: 0,
      right: 0,
      zIndex: 2,
      pt: {
         xs: 2.5,
         [mobileBreakpoint]: 2.125,
      },
      pr: {
         xs: 2,
         [mobileBreakpoint]: 2.5,
      },
      color: "text.primary",
      "& svg": {
         width: 32,
         height: 32,
         color: "text.primary",
      },
   },
   skeletonWrapper: {
      p: "20px",
      alignItems: "center",
   },
   planSkeleton: {
      width: "100vw",
      height: "100vh",
      px: 4,
      py: 3,
   },
   planSkeletonPlan: {
      width: "300px",
      height: "500px",
      backgroundColor: "lightgray",
      borderRadius: "15px",
   },
   planSkeletonSelectButton: {
      mt: 2,
      backgroundColor: "lightgray",
      "&:hover": {
         backgroundColor: (theme) => theme.palette.grey,
      },
      width: "276px",
      height: "40px",
      color: (theme) => theme.brand.white[100],
      textAlign: "center",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "24px",
   },
   planSkeletonSelectButtonDescription: {
      width: "190px",
      height: "20px",
      backgroundColor: (theme) => theme.brand.black,
   },
})

type SkeletonSelectSparksPlanProps = {
   open: boolean
}

const SkeletonSelectSparksPlan: FC<SkeletonSelectSparksPlanProps> = ({
   open,
}) => {
   return (
      <Dialog
         scroll="paper"
         open={open}
         maxWidth={false}
         TransitionComponent={SlideUpTransition}
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
            <Stack direction={"row"} spacing={1} p={2}>
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonPlan}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonPlan}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonPlan}
               />
            </Stack>
            <Stack spacing={2} alignItems={"center"}>
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonSelectButton}
               />
               <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={styles.planSkeletonSelectButtonDescription}
               />
            </Stack>
         </Stack>
         <Box sx={styles.closeBtn}>
            <IconButton>
               <CloseIcon />
            </IconButton>
         </Box>
      </Dialog>
   )
}

export default SkeletonSelectSparksPlan

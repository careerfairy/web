import { Box, Dialog, IconButton, Skeleton, Stack } from "@mui/material"
import GroupPlansDialog from "../GroupPlansDialog"
import { sxStyles } from "types/commonTypes"
import { SlideUpTransition } from "components/views/common/transitions"
import CloseIcon from "@mui/icons-material/CloseRounded"

const mobileBreakpoint = "md"

const styles = sxStyles({
   content: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
   },
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
   contentMobile: {
      display: "flex",
      flexDirection: "column",
   },
   contentMobileWrapper: {
      display: "flex",
      flexDirection: "column",
   },
   checkoutButton: {
      mt: 2,
      backgroundColor: (theme) => theme.palette.secondary.main,
      "&:hover": {
         backgroundColor: (theme) => theme.palette.secondary.dark,
      },
      width: "276px",
      color: (theme) => theme.brand.white[100],
      textAlign: "center",
      fontFamily: "Poppins",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "24px",
   },
   checkoutWrapper: {
      mt: 2,
      alignItems: "center",
   },
   cancelButton: {
      color: (theme) => theme.palette.black[700],
   },
   checkoutDescription: {
      color: (theme) => theme.palette.neutral[600],
      textAlign: "center",
      fontFamily: "Poppins",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "20px",
   },
   skeletonWrapper: {
      p: "20px",
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
      fontFamily: "Poppins",
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
const SkeletonSelectSparksPlan = () => {
   return (
      <Dialog
         scroll="paper"
         open={true}
         maxWidth={false}
         TransitionComponent={SlideUpTransition}
      >
         <Stack alignItems={"center"} sx={styles.skeletonWrapper}>
            <Stack alignItems={"center"}>
               <GroupPlansDialog.Title>
                  Select your{" "}
                  <Box component="span" color="secondary.main">
                     Sparks
                  </Box>{" "}
                  plan
               </GroupPlansDialog.Title>
               <GroupPlansDialog.Subtitle>
                  Tailored offers that best suit YOUR needs.
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

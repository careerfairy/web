import { Box, Skeleton, Stack } from "@mui/material"
import GroupPlansDialog from "../../GroupPlansDialog"
import { sxStyles } from "types/commonTypes"
import BrandedSwipableDrawer from "components/views/common/inputs/BrandedSwipableDrawer"

const styles = sxStyles({
   mobilePaperRoot: { maxHeight: "95%", backgroundColor: "#F6F6FA" },
   skeletonWrapper: {
      p: "20px",
   },
})

type GroupPlanSkeletonMobileProps = {
   open: boolean
}

const GroupPlanSkeletonMobile = ({ open }: GroupPlanSkeletonMobileProps) => {
   return (
      <BrandedSwipableDrawer
         sx={{ maxHeight: "90%" }}
         open={open}
         onOpen={() => {}}
         PaperProps={{
            sx: styles.mobilePaperRoot,
         }}
         transitionDuration={400}
         onClose={() => {}}
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
               <Skeleton variant="rounded" animation="wave" />
               <Skeleton variant="rounded" animation="wave" />
               <Skeleton variant="rounded" animation="wave" />
            </Stack>
            <Stack spacing={2} alignItems={"center"}>
               <Skeleton variant="rounded" animation="wave" />
               <Skeleton variant="rounded" animation="wave" />
            </Stack>
         </Stack>
      </BrandedSwipableDrawer>
   )
}

export default GroupPlanSkeletonMobile

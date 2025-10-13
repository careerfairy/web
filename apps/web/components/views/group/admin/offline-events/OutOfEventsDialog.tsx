import { Box, Button, Dialog, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import BrandedSwipeableDrawer from "components/views/common/inputs/BrandedSwipeableDrawer"
import Link from "next/link"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   contentRoot: {
      p: "12px 12px 24px 12px ",
      height: "100%",
      width: "100%",
      // borderRadius: "24px",
      // p: { xs: 3, sm: 3 },
      // pb: { xs: 3, sm: 3 },
      // pt: { xs: 1.5, sm: 1.5 },
      // maxWidth: "517px",
      // width: "100%",
      // position: "relative",
   },
   illustrationContainer: {
      height: "100%",
      maxHeight: "177px",
      borderRadius: "14px",
      background:
         "conic-gradient(from 180deg at 50% 50%, #E7E1FF 0deg, #C9BFF9 160.9615409374237deg, #CDB4FF 271.7307758331299deg, #D0C8F5 360deg)",
   },
})

type OutOfEventsDialogProps = {
   open: boolean
   onClose: () => void
   onPromoteEvents: () => void
   onContactTeam?: () => void
}

export const OutOfEventsDialog = ({
   open,
   onClose,
   onPromoteEvents,
   onContactTeam,
}: OutOfEventsDialogProps) => {
   const isMobile = useIsMobile(900)

   const dialogContent = (
      <Stack spacing={"24px"} sx={styles.contentRoot}>
         <Box sx={styles.illustrationContainer}></Box>

         <Stack spacing={2} px={isMobile ? "12px" : "24px"}>
            <Stack spacing={0} alignItems="center">
               <Typography
                  variant="brandedH5"
                  color="neutral.800"
                  fontWeight={700}
               >
                  No offline events left
               </Typography>
               <Typography
                  variant="medium"
                  color="neutral.700"
                  textAlign="center"
               >
                  You&apos;ve used all your offline events, but your
                  opportunities don&apos;t have to stop here. Add more and
                  continue reaching the students that matter most.
               </Typography>
            </Stack>
            <Stack spacing={1.5}>
               <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={onPromoteEvents}
               >
                  Promote more offline events
               </Button>
               <Button
                  variant="outlined"
                  color="grey"
                  fullWidth
                  onClick={() => onContactTeam?.()}
                  component={Link}
                  href="https://library.careerfairy.io/meetings/kandeeban/offline-events"
                  target="_blank"
               >
                  Contact our team
               </Button>
            </Stack>
         </Stack>
      </Stack>
   )

   if (isMobile) {
      return (
         <BrandedSwipeableDrawer
            open={open}
            onClose={onClose}
            onOpen={() => {}}
            anchor="bottom"
            PaperProps={{
               sx: {
                  borderTopLeftRadius: "24px",
                  borderTopRightRadius: "24px",
                  height: "485px",
               },
            }}
         >
            {dialogContent}
         </BrandedSwipeableDrawer>
      )
   }

   return (
      <Dialog
         open={open}
         onClose={onClose}
         maxWidth="sm"
         fullWidth
         PaperProps={{
            sx: {
               borderRadius: {
                  xs: "12px 12px 0 0",
                  sm: "12px 12px 0 0",
                  md: "24px",
               },
               height: "461px",
            },
         }}
      >
         {dialogContent}
      </Dialog>
   )
}

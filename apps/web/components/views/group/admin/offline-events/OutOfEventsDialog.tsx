import { Box, Button, Dialog, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import PlusCircleIcon from "components/views/common/icons/PlusCircleIcon"
import BrandedSwipeableDrawer from "components/views/common/inputs/BrandedSwipeableDrawer"
import Image from "next/image"
import Link from "next/link"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   desktopPaper: {
      borderRadius: {
         xs: "12px 12px 0 0",
         sm: "12px 12px 0 0",
         md: "24px",
      },
      height: "461px",
   },
   mobilePaper: {
      borderTopLeftRadius: "24px",
      borderTopRightRadius: "24px",
      height: "485px",
   },
   contentRoot: {
      p: "12px 12px 24px 12px ",
      height: "100%",
      width: "100%",
   },
   illustrationContainer: {
      height: "100%",
      maxHeight: "177px",
      borderRadius: "14px",
      background:
         "conic-gradient(from 180deg at 50% 50%, #E7E1FF 0deg, #C9BFF9 160.9615409374237deg, #CDB4FF 271.7307758331299deg, #D0C8F5 360deg)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
   },
   plusCircleIcon: {
      position: "absolute",
      ml: 23,
      mt: 4,
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
         <Stack minWidth="100%" alignItems="center">
            <Box sx={styles.illustrationContainer} minWidth="100%">
               <Image
                  src="https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2Fcalendar.png?alt=media&token=9ec49476-8a85-4316-b7c9-748a79dd2145"
                  alt="Calendar"
                  style={{ objectFit: "contain", marginLeft: "36px" }}
                  priority
                  height={225}
                  width={221}
               />
            </Box>
            <Box
               sx={styles.plusCircleIcon}
               component={PlusCircleIcon}
               width={144}
               height={186}
            />
         </Stack>
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
               sx: styles.mobilePaper,
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
            sx: styles.desktopPaper,
         }}
      >
         {dialogContent}
      </Dialog>
   )
}

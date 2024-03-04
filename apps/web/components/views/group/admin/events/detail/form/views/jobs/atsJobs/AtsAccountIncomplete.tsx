import AtsNotLinked from "./components/AtsNotLinked"
import { sxStyles } from "types/commonTypes"
import { Box, Button, Stack, Typography, useTheme } from "@mui/material"
import { AlertCircle as AlertIcon } from "react-feather"
import { useATSAccount } from "components/views/group/admin/ats-integration/ATSAccountContextProvider"
import { FC } from "react"

const styles = sxStyles({
   wrap: {
      display: "flex",
      justifyContent: "center",
      width: "100%",
      background: "#F7F8FC",
      borderRadius: (theme) => theme.spacing(1),
      border: "1px solid #EDE7FD",
      py: "32px",
   },
   content: {
      alignItems: "center",
      textAlign: "center",
      maxWidth: "500px",
      mx: 2,
   },
   dialog: {
      top: { xs: "70px", md: 0 },
      borderRadius: 5,
   },
})

type Props = {
   onDialogOpen: () => void
}

const AtsAccountIncomplete: FC<Props> = ({ onDialogOpen }) => {
   const theme = useTheme()
   const { atsAccount } = useATSAccount()

   if (!atsAccount || !atsAccount.firstSyncCompletedAt) {
      return <AtsNotLinked />
   }

   return (
      <>
         <Box sx={styles.wrap}>
            <Stack spacing={3} sx={styles.content}>
               <AlertIcon size={70} color={theme.palette.secondary.main} />

               <Typography variant="brandedH4" fontWeight={"bold"}>
                  One more step!
               </Typography>

               <Typography variant={"brandedBody"}>
                  Before you can associate jobs to your live stream you need to
                  complete the Application Test for {atsAccount.name}.
               </Typography>

               <Typography variant={"brandedBody"}>
                  This test will not be necessary in future live streams.
               </Typography>

               <Button
                  variant="contained"
                  color="secondary"
                  onClick={onDialogOpen}
               >
                  Start application test
               </Button>
            </Stack>
         </Box>
      </>
   )
}

export default AtsAccountIncomplete

import { Box, Typography } from "@mui/material"
import { PollIcon } from "components/views/common/icons"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      px: 3.625,
      py: 5.25,
      textAlign: "center",
   },
   icon: {
      fontSize: 56,
      color: "neutral.200",
   },
})

export const EmptyPollsView = () => {
   return (
      <Box sx={styles.root}>
         <PollIcon sx={styles.icon} />
         <Box pt={1.5} />
         <Typography variant="medium" color="neutral.600" fontWeight={600}>
            No ongoing polls yet
         </Typography>
         <Box pt={0.5} />
         <Typography variant="small" color="neutral.500">
            {
               "There aren't any polls to participate in right now, but keep an eye out! Interactive polls might be coming up during the stream."
            }
         </Typography>
      </Box>
   )
}

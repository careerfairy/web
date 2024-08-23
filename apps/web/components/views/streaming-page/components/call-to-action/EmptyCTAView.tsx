import { Box, Button, Stack, Typography } from "@mui/material"
import { Link2 } from "react-feather"
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
      gap: "24px",
      flexShrink: 0,
   },
   content: {
      gap: 1.5,
      alignItems: "center",
      alignSelf: "stretch",
   },
   icon: {
      color: "primary.main",
      opacity: 0.5,
   },
})

type Props = {
   onCreateClick: () => void
}

export const EmptyCTAView = ({ onCreateClick }: Props) => {
   return (
      <Box sx={styles.root}>
         <Stack sx={styles.content}>
            <Box component={Link2} size={53} sx={styles.icon} />
            <Typography
               variant="brandedH3"
               color="primary.main"
               fontWeight={600}
            >
               No call to action
            </Typography>
            <Typography variant="brandedBody" color="neutral.700">
               {"There are no calls to action created yet for this live stream"}
            </Typography>
         </Stack>
         <Button variant="contained" onClick={onCreateClick}>
            Create call to action
         </Button>
      </Box>
   )
}

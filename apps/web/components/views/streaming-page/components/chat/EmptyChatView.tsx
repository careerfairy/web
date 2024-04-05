import { Stack, Typography } from "@mui/material"
import { MessageCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      maxWidth: 162,
      color: (theme) => theme.brand.black[600],
      "& svg": {
         color: "inherit",
      },
   },
})

export const EmptyChatView = () => {
   return (
      <Stack sx={styles.root} alignItems="center" spacing={1}>
         <MessageCircle size={55} />
         <Typography textAlign="center" variant="brandedBody" color="inherit">
            No messages yet. Be the first one!
         </Typography>
      </Stack>
   )
}

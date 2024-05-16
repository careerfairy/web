import { sxStyles } from "@careerfairy/shared-ui"
import ShareIcon from "@mui/icons-material/ShareOutlined"
import { IconButton, Tooltip } from "@mui/material"
import Box from "@mui/material/Box"

const styles = sxStyles({
   root: {
      position: "absolute",
      top: 0,
      right: (theme) => ({ xs: 0, md: theme.spacing(4.5) }),
      color: "white",
      p: 1,
      "& svg": {
         fontSize: "24px",
      },
   },
})

const ShareButton = () => {
   return (
      <Box sx={styles.root}>
         <Tooltip title="Share">
            <IconButton color="info">
               <ShareIcon fontSize="inherit" />
            </IconButton>
         </Tooltip>
      </Box>
   )
}

export default ShareButton

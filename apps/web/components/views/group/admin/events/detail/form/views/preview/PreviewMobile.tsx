import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Fab, IconButton, useTheme } from "@mui/material"
import { Eye } from "react-feather"

const styles = sxStyles({
   root: {
      position: "fixed",
      right: 10,
      bottom: 82,
      zIndex: 2,
   },
   fab: (theme) => ({
      backgroundColor: theme.brand.white[300],
      border: `1px solid ${theme.palette.secondary.light}`,
      boxShadow: "0px 0px 10px 0px #0000000D",
   }),
})

type PreviewMobileProps = {
   handleOnClick: () => void
}

const PreviewMobile = ({ handleOnClick }: PreviewMobileProps) => {
   const theme = useTheme()
   return (
      <Box sx={styles.root}>
         <IconButton onClick={handleOnClick}>
            <Fab sx={styles.fab}>
               <Eye size={24} color={theme.palette.secondary.main} />
            </Fab>
         </IconButton>
      </Box>
   )
}

export default PreviewMobile

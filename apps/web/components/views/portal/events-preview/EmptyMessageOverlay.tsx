import React from "react"
import { Box, Button, Typography } from "@mui/material"
import Link from "../../common/Link"
import { alpha } from "@mui/material/styles"

const styles = {
   stackOverlay: {
      position: "absolute",
      inset: 0,
      display: "grid",
      placeItems: "center",
      backgroundColor: (theme) => alpha(theme.palette.common.white, 0.2),
      backdropFilter: "blur(2px)",
      p: 3,
      zIndex: 1,
   },
   overlayText: {
      fontWeight: 600,
   },
} as const

const EmptyMessageOverlay = ({
   message,
   buttonLink,
   buttonText,
   buttonOnClick,
   showButton = true,
   targetBlank = false,
}: Props) => {
   return (
      <Box sx={styles.stackOverlay}>
         <Typography
            sx={styles.overlayText}
            align="center"
            variant="h5"
            component={"div"}
         >
            {message}
            <br />
            {showButton && (
               <Button
                  onClick={buttonOnClick}
                  sx={{ mt: 2 }}
                  component={Link}
                  href={buttonLink}
                  variant="contained"
                  size="large"
                  target={targetBlank ? "_blank" : "_self"}
               >
                  {buttonText}
               </Button>
            )}
         </Typography>
      </Box>
   )
}

interface Props {
   message: string
   buttonText: string
   buttonLink: string
   buttonOnClick?: () => void
   showButton?: boolean
   targetBlank?: boolean
}
export default EmptyMessageOverlay

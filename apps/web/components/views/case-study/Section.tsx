import React, { FC, ReactElement } from "react"
import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import { SxProps } from "@mui/material"
import { Theme } from "@mui/material/styles"

const styles = {
   root: {
      position: "relative",
      py: {
         xs: 12,
         md: 20,
      },
   },
   imagesWrapper: {
      position: "absolute",
      inset: 0,
   },
   container: {
      px: { xs: 0.5, sm: 2 },
   },
}
const Section: FC<SectionProps> = ({
   children,
   backgroundColor,
   backgroundImages,
   color,
   sx,
   ...props
}) => {
   return (
      <Box
         {...props}
         sx={[
            styles.root,
            { bgcolor: backgroundColor, color },
            ...(Array.isArray(sx) ? sx : [sx]),
         ]}
         component={"section"}
      >
         <Container sx={styles.container} disableGutters maxWidth={"lg"}>
            {children}
         </Container>
         {backgroundImages && (
            <Box sx={styles.imagesWrapper}>{backgroundImages}</Box>
         )}
      </Box>
   )
}
interface SectionProps {
   backgroundColor?: string
   color?: string
   sx?: SxProps<Theme>
   backgroundImages?: ReactElement[]
}

export default Section

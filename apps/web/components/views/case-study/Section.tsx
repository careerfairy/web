import React, { FC, ReactElement } from "react"
import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import { SxProps } from "@mui/material"
import { Theme } from "@mui/material/styles"

const styles = {
   root: {
      position: "relative",
   },
   imagesWrapper: {
      position: "absolute",
      inset: 0,
   },
   container: {
      px: { xs: 0.8, sm: 2 },
   },
}
const Section: FC<SectionProps> = ({
   children,
   backgroundColor,
   backgroundImages,
   color,
   verticalSpacing = 20,
   sx,
   disableBottomPadding,
   disableTopPadding,
   ...props
}) => {
   return (
      <Box
         {...props}
         sx={[
            styles.root,
            {
               bgcolor: backgroundColor,
               color,
            },
            !disableTopPadding && {
               pt: {
                  xs: verticalSpacing * 0.6,
                  md: verticalSpacing,
               },
            },
            !disableBottomPadding && {
               pb: {
                  xs: verticalSpacing * 0.6,
                  md: verticalSpacing,
               },
            },
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
   verticalSpacing?: number
   disableBottomPadding?: boolean
   disableTopPadding?: boolean
}

export default Section

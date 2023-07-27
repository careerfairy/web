import Container, { ContainerProps } from "@mui/material/Container"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const containerMobileHorizontalPadding = 16
const containerDesktopHorizontalPadding = 50

const styles = sxStyles({
   root: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      pt: 2.875,
      position: "relative",
      overflow: "visible",
      px: {
         xs: `${containerMobileHorizontalPadding}px`,
         md: `${containerDesktopHorizontalPadding}px`,
      },
   },
})

const SparksContainer: FC<ContainerProps> = ({ children, sx, ...props }) => {
   return (
      <Container
         sx={[styles.root, ...(Array.isArray(sx) ? sx : [sx])]}
         maxWidth="xl"
      >
         {children}
      </Container>
   )
}

export default SparksContainer

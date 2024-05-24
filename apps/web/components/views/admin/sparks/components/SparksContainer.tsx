import Container, { ContainerProps } from "@mui/material/Container"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { FC } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

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

const SparksContainer: FC<ContainerProps & { hide?: boolean }> = ({
   children,
   sx,
   hide,
   ...props
}) => {
   return (
      <ConditionalWrapper condition={!hide}>
         <Container
            sx={combineStyles(styles.root, sx)}
            maxWidth="xl"
            {...props}
         >
            {children}
         </Container>
      </ConditionalWrapper>
   )
}

export default SparksContainer

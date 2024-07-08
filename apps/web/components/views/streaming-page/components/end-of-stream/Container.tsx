import { Container, ContainerProps } from "@mui/material"
import { ReactNode } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

const PADDING = 16
const MAX_WIDTH = 1136

const styles = sxStyles({
   root: {
      maxWidth: `calc(${MAX_WIDTH}px + ${PADDING * 2}px)`,
      px: `${PADDING}px`,
   },
})

type Props = {
   children: ReactNode
} & ContainerProps

export const EndOfStreamContainer = ({ children, sx, ...props }: Props) => {
   return (
      <Container
         maxWidth={false}
         disableGutters
         sx={combineStyles(styles.root, sx)}
         {...props}
      >
         {children}
      </Container>
   )
}

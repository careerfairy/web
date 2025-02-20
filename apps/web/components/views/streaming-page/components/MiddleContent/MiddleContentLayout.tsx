import { Container, Stack, SxProps } from "@mui/material"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      overflowY: "auto",
      overflowX: "hidden",
      display: "flex",
      flexDirection: "column",
   },
   fullHeight: {
      height: "100%",
   },
   inner: {
      transition: (theme) => theme.transitions.create("padding"),
   },
})

type Props = {
   children?: JSX.Element[]
   sxProps?: SxProps
}

export const MiddleContentLayout = ({ children, sxProps }: Props) => {
   return (
      <Container
         sx={combineStyles(styles.root, styles.fullHeight, sxProps)}
         maxWidth="xl"
      >
         <Stack sx={[styles.fullHeight, styles.inner]} spacing={1.5}>
            {children}
         </Stack>
      </Container>
   )
}

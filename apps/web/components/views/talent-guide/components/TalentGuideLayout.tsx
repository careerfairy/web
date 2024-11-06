import { Box, Container } from "@mui/material"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      minHeight: "100vh",
      position: "relative",
   },
})

type Props = {
   children: ReactNode
}

export const TalentGuideLayout = ({ children }: Props) => {
   return (
      <Box id="talent-guide-layout" component="main" sx={styles.root}>
         <Container maxWidth="md">{children}</Container>
      </Box>
   )
}

import { Box, Container } from "@mui/material"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: (theme) => ({
      minHeight: "100vh",
      position: "relative",
      bgcolor: theme.brand.white[300],
   }),
   header: (theme) => ({
      width: "100%",
      position: "sticky",
      top: 0,
      bgcolor: theme.brand.white[200],
      borderBottom: "1px solid",
      borderColor: theme.brand.white[500],
   }),
})

type Props = {
   children: ReactNode
   header?: ReactNode
}

export const TalentGuideLayout = ({ children, header }: Props) => {
   return (
      <Box id="talent-guide-layout" component="main" sx={styles.root}>
         {Boolean(header) && <Box sx={styles.header}>{header}</Box>}
         <Container maxWidth="md">{children}</Container>
      </Box>
   )
}

import { Container } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import Search from "./Search"
import Title from "./Title"
import { Box } from "@mui/material"

const styles = sxStyles({
   root: {
      overflow: "auto",
      height: {
         xs: "calc(100vh - 56px)",
         sm: "calc(100vh - 64px)",
      },
   },
})

const CompanyPlansOverview = () => {
   return (
      <Box sx={styles.root}>
         <Container>
            <Title />
            <Search />
         </Container>
      </Box>
   )
}

export default CompanyPlansOverview

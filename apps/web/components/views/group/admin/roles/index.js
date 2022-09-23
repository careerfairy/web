import React from "react"
import { Container } from "@mui/material"
import MembersTable from "./MembersTables"
import { sxStyles } from "../../../../../types/commonTypes"
import Box from "@mui/material/Box"

const styles = sxStyles({
   root: {
      backgroundColor: "background.dark",
      minHeight: "100%",
      paddingBottom: 3,
      paddingTop: 3,
   },
})

const RolesOverview = () => {
   return (
      <Container className={styles.root} maxWidth="lg">
         <Box p={3}>
            <MembersTable />
         </Box>
      </Container>
   )
}

export default RolesOverview

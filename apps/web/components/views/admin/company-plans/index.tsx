import { Box, Container } from "@mui/material"
import React from "react"
import { sxStyles } from "types/commonTypes"
import Title from "./Title"

const styles = sxStyles({
   root: {},
})

const CompanyPlansOverview = () => {
   return (
      <Container>
         <Title />
      </Container>
   )
}

export default CompanyPlansOverview

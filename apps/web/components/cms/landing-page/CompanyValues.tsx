import { sxStyles } from "../../../types/commonTypes"
import Box from "@mui/material/Box"
import React from "react"
import { HygraphResponseCompanyValues } from "../../../types/cmsTypes"
import ValuesSection from "../../views/aboutUs/ValuesSection"

const styles = sxStyles({
   wrapper: {
      marginTop: 6,
      marginBottom: 6,
   },
})

const CompanyValues = ({ values, title }: HygraphResponseCompanyValues) => {
   return (
      <Box sx={styles.wrapper}>
         <ValuesSection title={title} valuesData={values} />
      </Box>
   )
}

export default CompanyValues

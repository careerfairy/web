import ScrollToTop from "../../components/views/common/ScrollToTop"
import React from "react"
import { Typography } from "@mui/material"
import SEO from "../../components/util/SEO"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"

const CompaniesPage = () => {
   return (
      <>
         <SEO
            id={"CareerFairy | Companies"}
            description={"Meet all the partners of CareerFairy."}
            title={"CareerFairy | Companies"}
         />
         <GenericDashboardLayout pageDisplayName={"Companies"}>
            <Typography variant={"h5"}>Companies list</Typography>
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </>
   )
}

export default CompaniesPage

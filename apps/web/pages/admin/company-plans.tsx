import CompanyPlansOverview from "components/views/admin/company-plans"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"
import Head from "next/head"
import React from "react"

const CompanyPlansPage = () => {
   return (
      <>
         <Head>
            <title>CareerFairy | Company Plans Overview</title>
         </Head>
         <AdminDashboardLayout>
            <CompanyPlansOverview />
         </AdminDashboardLayout>
      </>
   )
}

export default CompanyPlansPage

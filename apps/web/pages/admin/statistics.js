import React from "react"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"
import StatisticsOverview from "../../components/views/admin/statistics"
import Head from "next/head"

const UserTablePage = () => {
   return (
      <>
         <Head>
            <title>CareerFairy | Admin Statistics Dashboard</title>
         </Head>
         <AdminDashboardLayout>
            <StatisticsOverview />
         </AdminDashboardLayout>
      </>
   )
}

export default UserTablePage

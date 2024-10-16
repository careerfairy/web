import React from "react"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"
import QueryUsersOverview from "../../components/views/admin/query-users"
import Head from "next/head"

const QueryDataPage = () => {
   return (
      <>
         <Head>
            <title>CareerFairy | User Query Tool</title>
         </Head>
         <AdminDashboardLayout>
            <QueryUsersOverview />
         </AdminDashboardLayout>
      </>
   )
}

export default QueryDataPage

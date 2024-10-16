import React from "react"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"
import QueryUsersOverview from "../../components/views/admin/query-users"

const QueryDataPage = () => {
   return (
      <AdminDashboardLayout>
         <QueryUsersOverview />
      </AdminDashboardLayout>
   )
}

export default QueryDataPage

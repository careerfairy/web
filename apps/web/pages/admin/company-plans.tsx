import React from "react"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"
import QueryUsersOverview from "../../components/views/admin/query-users"

const CompanyPlansPage = () => {
   return (
      <AdminDashboardLayout>
         <QueryUsersOverview />
      </AdminDashboardLayout>
   )
}

export default CompanyPlansPage

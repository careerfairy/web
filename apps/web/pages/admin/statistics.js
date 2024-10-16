import React from "react"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"
import StatisticsOverview from "../../components/views/admin/statistics"

const UserTablePage = () => {
   return (
      <AdminDashboardLayout>
         <StatisticsOverview />
      </AdminDashboardLayout>
   )
}

export default UserTablePage

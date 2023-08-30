import React from "react"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"
import CalendarManager from "components/views/calendar/management/CalendarManager"

const AcademicCalendarManager = () => {
   return (
      <AdminDashboardLayout>
         <CalendarManager />
      </AdminDashboardLayout>
   )
}

export default AcademicCalendarManager

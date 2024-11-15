import React from "react"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"
import CalendarManager from "components/views/calendar/management/CalendarManager"
import Head from "next/head"

const AcademicCalendarManager = () => {
   return (
      <>
         <Head>
            <title>CareerFairy | Academic Calendar Management</title>
         </Head>
         <AdminDashboardLayout>
            <CalendarManager />
         </AdminDashboardLayout>
      </>
   )
}

export default AcademicCalendarManager

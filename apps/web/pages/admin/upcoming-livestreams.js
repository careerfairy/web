import React from "react"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"
import AdminStreams from "../../components/views/admin/streams"
import { withFirebase } from "../../context/firebase/FirebaseServiceContext"

const UpcomingStreamsPage = () => {
   return (
      <AdminDashboardLayout>
         <AdminStreams typeOfStream="upcoming" />
      </AdminDashboardLayout>
   )
}

export default withFirebase(UpcomingStreamsPage)

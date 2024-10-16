import React from "react"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"
import AdminStreams from "../../components/views/admin/streams"
import { withFirebase } from "../../context/firebase/FirebaseServiceContext"

const PastStreamsPage = () => {
   return (
      <AdminDashboardLayout>
         <AdminStreams typeOfStream="past" />
      </AdminDashboardLayout>
   )
}

export default withFirebase(PastStreamsPage)

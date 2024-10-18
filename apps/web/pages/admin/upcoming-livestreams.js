import React from "react"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"
import AdminStreams from "../../components/views/admin/streams"
import { withFirebase } from "../../context/firebase/FirebaseServiceContext"
import Head from "next/head"

const UpcomingStreamsPage = () => {
   return (
      <>
         <Head>
            <title>CareerFairy | Upcoming Live Streams Management</title>
         </Head>
         <AdminDashboardLayout>
            <AdminStreams typeOfStream="upcoming" />
         </AdminDashboardLayout>
      </>
   )
}

export default withFirebase(UpcomingStreamsPage)

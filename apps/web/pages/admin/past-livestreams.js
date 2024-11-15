import React from "react"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"
import AdminStreams from "../../components/views/admin/streams"
import { withFirebase } from "../../context/firebase/FirebaseServiceContext"
import Head from "next/head"

const PastStreamsPage = () => {
   return (
      <>
         <Head>
            <title>CareerFairy | Past Live Streams Archive</title>
         </Head>
         <AdminDashboardLayout>
            <AdminStreams typeOfStream="past" />
         </AdminDashboardLayout>
      </>
   )
}

export default withFirebase(PastStreamsPage)

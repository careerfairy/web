import React, { useState, useEffect } from "react"
import { firestore } from "../../data/firebase/FirebaseInstance"
import {
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   Paper,
   CircularProgress,
   Pagination,
} from "@mui/material"
import { useRouter } from "next/navigation"
import Button from "@mui/material/Button"
import Head from "next/head"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"

const SavedPushNotifications = () => {
   const [notifications, setNotifications] = useState([])
   const [loading, setLoading] = useState(false)
   const [page, setPage] = useState(1)
   const [totalPages, setTotalPages] = useState(1)
   const router = useRouter()
   const pageSize = 10 // Number of rows per page

   useEffect(() => {
      const fetchNotifications = async () => {
         setLoading(true)
         try {
            const snapshot = await firestore
               .collection("savedNotifications")
               .limit(pageSize)
               .get()

            console.log(snapshot)

            const data = snapshot.docs.map((doc) => ({
               id: doc.id,
               ...doc.data(),
            }))

            setNotifications(data)
            setTotalPages(Math.ceil(data.length / pageSize)) // Adjust this based on total documents
         } catch (error) {
            console.error("Error fetching notifications:", error)
         } finally {
            setLoading(false)
         }
      }

      fetchNotifications()
   }, [page])

   const handlePageChange = (event, value) => {
      setPage(value)
   }

   return (
      <>
         <Head>
            <title>CareerFairy | Admin Saved Notifications Table</title>
         </Head>
         <AdminDashboardLayout>
            <div>
               <h1>Saved Notifications</h1>
               <Button
                  onClick={() => router.push("/admin/create-notification")}
               >
                  Create New Notification
               </Button>
               {loading ? (
                  <CircularProgress />
               ) : (
                  <TableContainer component={Paper}>
                     <Table component="table">
                        <TableHead>
                           <TableRow>
                              <TableCell>Title</TableCell>
                              <TableCell>Body</TableCell>
                              <TableCell>Created At</TableCell>
                              <TableCell>Actions</TableCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                           {notifications.map((notification) => (
                              <TableRow key={notification.id}>
                                 <TableCell>{notification.title}</TableCell>
                                 <TableCell>{notification.body}</TableCell>
                                 <TableCell>
                                    {notification.createdAt
                                       ?.toDate()
                                       .toLocaleString()}
                                 </TableCell>
                                 <TableCell>
                                    {/* Add action buttons like Edit or Delete */}
                                    <Button
                                       onClick={() =>
                                          router.push(
                                             `/admin/create-notification?id=${notification.id}`
                                          )
                                       }
                                    >
                                       Edit
                                    </Button>
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </TableContainer>
               )}
               <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  style={{ marginTop: "20px" }}
               />
            </div>
         </AdminDashboardLayout>
      </>
   )
}

export default SavedPushNotifications

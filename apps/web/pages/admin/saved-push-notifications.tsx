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
import { deleteSavedNotification } from "../../data/firebase/PushNotificationsService"

const SavedPushNotifications = () => {
   const [loading, setLoading] = useState(false)
   const [page, setPage] = useState(1)
   const [totalPages, setTotalPages] = useState(1)
   const router = useRouter()
   const pageSize = 10 // Number of rows per page
   const [allItems, setAllItems] = useState([]) // Store all documents
   const [items, setItems] = useState([]) // Items to display on current page

   useEffect(() => {
      fetchAllData()
   }, [])

   const fetchAllData = async () => {
      setLoading(true)
      try {
         const snapshot = await firestore.collection("pushNotifications").get()

         const allData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }))

         setAllItems(allData) // Store all fetched data
         setTotalPages(Math.ceil(allData.length / pageSize))
         setPage(1) // Start on page 1
      } catch (error) {
         console.error("Error fetching all data:", error)
      }
      setLoading(false)
   }

   // Update displayed items when `allItems` or `currentPage` changes
   useEffect(() => {
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      setItems(allItems.slice(startIndex, endIndex)) // Slice the items for the current page
   }, [allItems, page])

   const deleteNotification = (id: string) => {
      deleteSavedNotification(id).then(() => {
         setPage(1)
         fetchAllData()
      })
   }

   const handlePageChange = (event, value) => {
      setPage(value)
   }

   return (
      <>
         <Head>
            <title>CareerFairy | Admin Saved Notifications Table</title>
         </Head>
         <AdminDashboardLayout>
            <div style={{ padding: 10 }}>
               <h1>Push Notifications</h1>
               <Button
                  variant={"contained"}
                  style={{ marginBottom: 20 }}
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
                           {items.map((notification) => (
                              <TableRow key={notification.id}>
                                 <TableCell>{notification.title}</TableCell>
                                 <TableCell>{notification.body}</TableCell>
                                 <TableCell>
                                    {notification.createdAt
                                       ?.toDate()
                                       .toLocaleString()}
                                 </TableCell>
                                 <TableCell>
                                    <Button
                                       onClick={() =>
                                          router.push(
                                             `/admin/create-notification?id=${notification.id}`
                                          )
                                       }
                                    >
                                       Edit
                                    </Button>
                                    <Button
                                       onClick={() =>
                                          deleteNotification(notification.id)
                                       }
                                    >
                                       Delete
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

import React, { useState } from "react"
import { useRouter } from "next/router"
import {
   createSavedNotification,
   updateSavedNotification,
   sendNotificationToFilteredUsers,
} from "../../data/firebase/FirestoreService"
import Button from "@mui/material/Button"
import Head from "next/head"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"

const CreateNotification = ({ notification }) => {
   const [title, setTitle] = useState(notification?.title || "")
   const [body, setBody] = useState(notification?.body || "")
   const [filters, setFilters] = useState({
      firstName: "",
      lastName: "",
      fieldOfStudy: "",
      levelOfStudy: "",
      position: "",
      avatar: "",
      university: "",
      badges: [],
      groupIds: [],
      talentPools: [],
      interestsIds: [],
   })

   const router = useRouter()
   const notificationId: any = router.query.id

   const handleInputChange = (e) => {
      const { name, value } = e.target
      setFilters((prevFilters) => ({
         ...prevFilters,
         [name]: value,
      }))
   }

   const handleSaveNotification = async () => {
      const data = { title, body, filters }
      if (notificationId) {
         await updateSavedNotification(notificationId, data)
      } else {
         await createSavedNotification(data)
      }
      router.push("/admin/saved-push-notifications")
   }

   const handleSendNotification = async () => {
      // Call sendNotificationToFilteredUsers with filters and message
      await sendNotificationToFilteredUsers(filters, { title, body })
      alert("Notification sent")
   }

   return (
      <>
         <Head>
            <title>CareerFairy | Admin Saved Notifications Table</title>
         </Head>
         <AdminDashboardLayout>
            <div>
               <h1>
                  {notificationId
                     ? "Edit Notification"
                     : "Create New Notification"}
               </h1>
               <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
               />
               <textarea
                  placeholder="Body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
               />
               <h3>Filters</h3>
               <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={filters.firstName}
                  onChange={handleInputChange}
               />
               <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={filters.lastName}
                  onChange={handleInputChange}
               />
               <input
                  type="text"
                  name="fieldOfStudy"
                  placeholder="Field of Study"
                  value={filters.fieldOfStudy}
                  onChange={handleInputChange}
               />
               <input
                  type="text"
                  name="levelOfStudy"
                  placeholder="Level of Study"
                  value={filters.levelOfStudy}
                  onChange={handleInputChange}
               />
               <input
                  type="text"
                  name="position"
                  placeholder="Position"
                  value={filters.position}
                  onChange={handleInputChange}
               />
               <input
                  type="text"
                  name="university"
                  placeholder="University"
                  value={filters.university}
                  onChange={handleInputChange}
               />
               <input
                  type="text"
                  name="badges"
                  placeholder="Badges (comma-separated)"
                  value={filters.badges.join(",")}
                  onChange={(e) =>
                     setFilters({
                        ...filters,
                        badges: e.target.value.split(","),
                     })
                  }
               />
               <input
                  type="text"
                  name="groupIds"
                  placeholder="Group IDs (comma-separated)"
                  value={filters.groupIds.join(",")}
                  onChange={(e) =>
                     setFilters({
                        ...filters,
                        groupIds: e.target.value.split(","),
                     })
                  }
               />
               <input
                  type="text"
                  name="talentPools"
                  placeholder="Talent Pools (comma-separated)"
                  value={filters.talentPools.join(",")}
                  onChange={(e) =>
                     setFilters({
                        ...filters,
                        talentPools: e.target.value.split(","),
                     })
                  }
               />
               <input
                  type="text"
                  name="interestsIds"
                  placeholder="Interest IDs (comma-separated)"
                  value={filters.interestsIds.join(",")}
                  onChange={(e) =>
                     setFilters({
                        ...filters,
                        interestsIds: e.target.value.split(","),
                     })
                  }
               />

               <Button onClick={handleSaveNotification}>
                  {notificationId
                     ? "Update Notification"
                     : "Create Notification"}
               </Button>
               <Button onClick={handleSendNotification}>
                  Send Notification
               </Button>
            </div>
         </AdminDashboardLayout>
      </>
   )
}

export default CreateNotification

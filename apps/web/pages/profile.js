import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import Head from "next/head"
import ProfileNav from "../components/views/profile/ProfileNav"
import { useAuth } from "../HOCs/AuthProvider"
import ScrollToTop from "../components/views/common/ScrollToTop"
import UserLayout from "../layouts/UserLayout"

const useStyles = makeStyles((theme) => ({
   content: {
      minHeight: "60vh",
   },
}))

const UserProfile = () => {
   const classes = useStyles()
   const { userData, authenticatedUser: user } = useAuth()

   return (
      <React.Fragment>
         <Head>
            <title key="title">CareerFairy | My Profile</title>
         </Head>
         <UserLayout>
            {userData ? (
               <ProfileNav user={user} userData={userData} />
            ) : (
               <div className={classes.content} />
            )}
         </UserLayout>
         <ScrollToTop />
      </React.Fragment>
   )
}

export default UserProfile

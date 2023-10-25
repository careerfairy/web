import { useEffect, useState, Fragment } from "react"
import { withFirebase } from "context/firebase/FirebaseServiceContext"
import HighlightOffIcon from "@mui/icons-material/HighlightOff"
import AuthenticatedHeader from "./authenticated-header/AuthenticatedHeader"
import NonAuthenticatedHeader from "./non-authenticated-header/NonAuthenticatedHeader"
import { compose } from "redux"
import * as actions from "../../../store/actions"
import { connect } from "react-redux"
import Link from "next/link"
import { useRouter } from "next/router"
import LandingHeader from "./landing-header/LandingHeader"
import makeStyles from "@mui/styles/makeStyles"
import { useAuth } from "../../../HOCs/AuthProvider"
import { IconButton } from "@mui/material"

const useStyles = makeStyles((theme) => ({
   nextLink: {
      border: ({ isHighlighted }) =>
         isHighlighted ? "3px solid #00d2aa" : "none",
      borderRadius: ({ isHighlighted }) => (isHighlighted ? "5px" : "0"),
      padding: ({ isHighlighted }) => (isHighlighted ? "0.5rem 0.8rem" : 0),
   },
}))

function Header(props) {
   const {
      pathname,
      query: { careerCenterId },
   } = useRouter()
   const isHighlighted = Boolean(
      pathname === "/next-livestreams" && careerCenterId
   )
   const classes = useStyles({ isHighlighted })

   const [authenticated, setAuthenticated] = useState(false)
   const [sidebarState, setSidebarState] = useState("unopened")
   const { authenticatedUser, userData } = useAuth()

   useEffect(() => {
      if (authenticatedUser.isLoaded && !authenticatedUser.isEmpty) {
         setAuthenticated(true)
      } else {
         setAuthenticated(false)
      }
   }, [authenticatedUser])

   const handleLogout = () => {
      props.logout()
   }

   function toggleSideBar() {
      if (sidebarState === "unopened" || sidebarState === "closed") {
         setSidebarState("opened")
      } else {
         setSidebarState("closed")
      }
   }

   let TopHeader = null

   if (props.page === "landing") {
      TopHeader = (props) => {
         return (
            <LandingHeader
               {...props}
               toggleSideBar={toggleSideBar}
               authenticated={authenticated}
            />
         )
      }
   } else if (authenticated) {
      TopHeader = (props) => {
         return <AuthenticatedHeader {...props} toggleSideBar={toggleSideBar} />
      }
   } else {
      TopHeader = (props) => {
         return (
            <NonAuthenticatedHeader {...props} toggleSideBar={toggleSideBar} />
         )
      }
   }

   return (
      <Fragment>
         <div id="mainHeader" className={props.classElement}>
            <TopHeader {...props} />
         </div>
         <div
            className={
               sidebarState !== "opened"
                  ? "sidebar hidden"
                  : sidebarState === "opened"
                  ? "sidebar animated slideInLeft faster"
                  : "sidebar animated slideOutLeft faster"
            }
         >
            <IconButton
               aria-label="delete"
               onClick={toggleSideBar}
               size="large"
            >
               <HighlightOffIcon fontSize="large" style={{ color: "white" }} />
            </IconButton>
            <ul>
               <li>
                  <Link
                     className="next-livestream-link"
                     href="/next-livestreams"
                     legacyBehavior
                  >
                     <a onClick={toggleSideBar} className={classes.nextLink}>
                        Next Live Streams
                     </a>
                  </Link>
               </li>
               {authenticated && (
                  <li>
                     <a onClick={toggleSideBar} href="/groups">
                        Follow Groups
                     </a>
                  </li>
               )}
               <li>
                  <Link href="https://companies.careerfairy.io" legacyBehavior>
                     <a onClick={toggleSideBar}>Companies</a>
                  </Link>
               </li>
               <li>
                  <Link href="/wishlist" legacyBehavior>
                     <a onClick={toggleSideBar}>Wishlist</a>
                  </Link>
               </li>
               <li>
                  <Link
                     href={authenticated ? "/profile" : "/login"}
                     legacyBehavior
                  >
                     <a>{authenticated ? "My Profile" : "Log in"}</a>
                  </Link>
               </li>
               {authenticated && (
                  <li>
                     <a onClick={handleLogout}>Logout</a>
                  </li>
               )}
            </ul>
         </div>
         <style jsx>{`
            a {
               text-decoration: none;
            }

            #mainHeader header #signupLink:hover,
            #mainHeader header #wishlistLink:hover {
               background-color: rgb(0, 210, 170);
            }

            header {
               padding: 15px 20px;
               text-align: left;
               height: 80px;
            }

            i {
               cursor: pointer;
            }

            i:hover {
               color: rgba(220, 220, 220, 1);
            }

            .sidebar {
               position: absolute;
               left: 0;
               top: 0;
               bottom: 0;
               width: 300px;
               background-color: rgba(30, 30, 30, 0.95);
               z-index: 9999;
               color: white;
               padding: 20px;
               text-align: center;
            }

            .sidebar.hidden {
               display: none;
            }

            .sidebar ul {
               margin-top: 50px;
               list-style-type: none;
               padding: 0;
            }

            .sidebar ul li {
               font-size: 1.2em;
               margin-top: 30px;
            }

            .sidebar a,
            .sidebar div {
               font-weight: 600;
               color: white;
               text-transform: uppercase;
            }

            .sidebar a:hover,
            .sidebar div:hover {
               cursor: pointer;
               color: rgb(28, 184, 149);
            }

            @media screen and (max-width: 992px) {
               #sidebar-toggle {
                  display: inline-block;
               }
            }

            @media screen and (max-width: 600px) {
               .sidebar {
                  width: 100%;
               }
            }
         `}</style>
      </Fragment>
   )
}

const mapDispatchToProps = {
   logout: actions.signOut,
}

const enhance = compose(withFirebase, connect(null, mapDispatchToProps))

export default enhance(Header)

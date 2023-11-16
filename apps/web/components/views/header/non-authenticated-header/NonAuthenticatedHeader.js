import { Fragment } from "react"

import Link from "next/link"
import { useRouter } from "next/router"
import { Button, IconButton } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"

import makeStyles from "@mui/styles/makeStyles"

const useStyles = makeStyles((theme) => ({
   nextLink: {
      border: ({ isHighlighted }) =>
         isHighlighted ? "3px solid #00d2aa" : "none",
      borderRadius: ({ isHighlighted }) => (isHighlighted ? "5px" : "0"),
      padding: ({ isHighlighted }) => (isHighlighted ? "0.5rem 0.8rem" : 0),
   },
}))

const NonAuthenticatedHeader = (props) => {
   const {
      push,
      pathname,
      query: { careerCenterId },
   } = useRouter()
   const isHighlighted = Boolean(
      pathname === "/next-livestreams" && careerCenterId
   )
   const classes = useStyles({ isHighlighted })

   function goToRoute(route) {
      push(route)
   }

   return (
      <Fragment>
         <header id="main-header">
            <ul id="left-menu">
               <li>
                  <IconButton onClick={props.toggleSideBar} size="large">
                     <MenuIcon
                        id="sidebar-toggle"
                        fontSize="large"
                        style={{
                           color:
                              props.color === "white"
                                 ? "white"
                                 : "rgba(0, 210, 170)",
                        }}
                     />
                  </IconButton>
               </li>
               <li>
                  <Link href="/" legacyBehavior>
                     <a>
                        <img
                           src={
                              props.color === "white"
                                 ? "/logo_white.png"
                                 : "/logo_teal.png"
                           }
                           style={{
                              cursor: "pointer",
                              width: "150px",
                              display: "inline-block",
                              marginTop: "10px",
                              marginLeft: "10px",
                           }}
                        />
                     </a>
                  </Link>
               </li>
            </ul>
            <ul
               id="middle-menu"
               className={
                  "centered-menu " +
                  (props.color === "white" ? "white" : "dark")
               }
            >
               <li
                  className={`${
                     props.page === "next-livestreams" ? "active" : ""
                  }`}
               >
                  <Link href="/next-livestreams" legacyBehavior>
                     <a className={classes.nextLink}>Next Live Streams</a>
                  </Link>
               </li>
               <li className={props.page === "wishlist" ? "active" : ""}>
                  <Link href="/wishlist" legacyBehavior>
                     <a>Wishlist</a>
                  </Link>
               </li>
            </ul>
            <div
               id="right-menu"
               className={
                  "float-right " + (props.color === "white" ? "white" : "dark")
               }
            >
               <Button
                  color="primary"
                  variant="contained"
                  style={{
                     margin: "8px 10px 5px 10px",
                     position: "relative",
                     zIndex: "1000",
                     fontWeight: 600,
                  }}
                  onClick={() => goToRoute("/login")}
               >
                  Log in
               </Button>
            </div>
         </header>
         <style jsx>{`
            a {
               text-decoration: none;
            }

            #main-header {
               width: 100%;
               height: 80px;
            }

            #left-menu,
            #right-menu {
               text-transform: uppercase;
               z-index: 1000;
               color: white;
            }

            #left-menu {
               position: absolute;
               left: 0;
               top: 0;
               list-style: none;
               padding: 15px 20px;
               vertical-align: top;
               margin: 0;
               display: inline-block;
               vertical-align: middle;
            }

            #left-menu li {
               margin: 0;
               display: inline;
               vertical-align: middle;
            }

            #right-menu {
               float: right;
               padding: 15px;
               vertical-align: top;
            }

            #sidebar-toggle {
               display: inline-block;
            }

            #right-menu.dark button,
            #right-menu.dark a {
               background-color: rgb(0, 210, 170);
               color: white;
               font-weight: 600;
            }

            #right-menu.dark button:hover,
            #right-menu.dark a:hover {
               background-color: rgb(0, 172, 140);
               color: white;
               font-weight: 600;
            }

            #middle-menu.white li a,
            #middle-menu.white li div {
               color: white;
            }

            .centered-menu.white li a:active,
            .centered-menu.white li div:active {
               color: rgb(170, 170, 170);
            }

            #middle-menu li.blink a {
               color: rgb(0, 210, 170);
            }

            .centered-menu.dark li a,
            .centered-menu.dark li div {
               color: rgb(60, 60, 60);
            }

            .centered-menu.dark li a:hover,
            .centered-menu.dark li div:hover {
               color: rgb(28, 184, 149);
            }

            .centered-menu.dark li a:active,
            .centered-menu.dark li div:active {
               color: black;
            }

            #right-menu-small {
               display: none;
               color: white;
            }

            .centered-menu {
               position: absolute;
               top: 0;
               left: 0;
               right: 0;
               margin-top: 30px;
               text-align: center;
               font-size: 1.1em;
               display: inline-block;
               z-index: 999;
            }

            .centered-menu li {
               display: inline-block;
               text-transform: uppercase;
               font-weight: 600;
               margin: 0 30px;
               cursor: pointer;
            }

            #middle-menu.dark li a,
            #middle-menu.dark li div {
               color: rgb(140, 140, 140);
            }

            #middle-menu.dark li a:hover,
            #middle-menu.dark li div:hover {
               color: rgb(100, 100, 100);
            }

            #middle-menu.white li a,
            #middle-menu.white li div {
               color: white;
            }

            #middle-menu.white li a:hover,
            #middle-menu.white li div:hover {
               color: rgb(28, 184, 149);
            }

            #middle-menu li.active a {
               color: rgb(0, 210, 170);
            }

            #middle-menu li.active a:active,
            #middle-menu li.active a:hover {
               color: rgb(0, 210, 170);
            }

            .centered-menu.white li a:active,
            .centered-menu.white li div:active {
               color: rgb(170, 170, 170);
            }

            #middle-menu li.blink a {
               color: rgb(0, 210, 170);
            }

            .centered-menu.dark li a,
            .centered-menu.dark li div {
               color: rgb(60, 60, 60);
            }

            .centered-menu.dark li a:hover,
            .centered-menu.dark li div:hover {
               color: rgb(28, 184, 149);
            }

            .centered-menu.dark li a:active,
            .centered-menu.dark li div:active {
               color: black;
            }

            .hidden {
               display: none;
            }

            i {
               cursor: pointer;
            }

            i:hover {
               color: rgb(220, 220, 220);
            }

            @media screen and (max-width: 992px) {
               #sidebar-toggle {
                  display: inline-block;
               }

               #middle-menu,
               #right-menu {
                  display: none;
               }

               #right-menu-small {
                  display: block;
               }
            }

            @media screen and (max-width: 600px) {
               .sidebar {
                  width: 100%;
               }
            }

            .profileLink {
               color: white;
               font-weight: 400;
               margin-right: 10px;
               font-size: 1em;
               border: 1px solid white;
               border-radius: 5px;
               padding: 9px 20px;
               cursor: pointer;
            }

            .profileLink:hover {
               background-color: rgb(0, 210, 170);
               border: 1px solid rgb(0, 210, 170);
               transform: scale(1.1);
               -webkit-transform: scale(1.1);
            }
         `}</style>
      </Fragment>
   )
}

export default NonAuthenticatedHeader

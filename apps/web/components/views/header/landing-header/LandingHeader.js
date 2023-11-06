import React, { Fragment } from "react"
import MenuIcon from "@mui/icons-material/Menu"

import Link from "next/link"
import { useRouter } from "next/router"
import { Button, IconButton } from "@mui/material"

const LandingHeader = (props) => {
   const router = useRouter()

   function goToRoute(route) {
      router.push(route)
   }

   return (
      <Fragment>
         <header id="main-header">
            <ul id="left-menu" className="float-left">
               <li>
                  <IconButton onClick={props.toggleSideBar} size="large">
                     <MenuIcon
                        id="sidebar-toggle"
                        fontSize="large"
                        style={{ color: "white" }}
                     />
                  </IconButton>
               </li>
               <li>
                  <Link href="/" legacyBehavior>
                     <a>
                        <img
                           src="/logo_white.png"
                           style={{
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
            <ul id="middle-menu" className={"centered-menu white"}>
               <li className={props.page === "landing" ? "active" : ""}>
                  <Link href="/" legacyBehavior>
                     <a>For Students</a>
                  </Link>
               </li>
               <li>
                  <a href="https://companies.careerfairy.io/">For Companies</a>
               </li>
               <li>
                  <a href="https://corporate.careerfairy.io/career-center">
                     For Career Centers
                  </a>
               </li>
            </ul>
            <div id="right-menu" className={"float-right white"}>
               <Button
                  color="primary"
                  variant="contained"
                  style={{
                     position: "relative",
                     zIndex: "1000",
                     fontWeight: 600,
                  }}
                  onClick={() => {
                     goToRoute(props.authenticated ? "/profile" : "/login")
                  }}
               >
                  {props.authenticated ? "My Profile" : "Log in"}
               </Button>
            </div>
         </header>
         <style jsx>{`
            a {
               text-decoration: none;
            }

            #main-header {
               width: 100%;
               height: 60px;
            }

            #left-menu,
            #right-menu,
            #right-menu button {
               text-transform: uppercase;
               z-index: 1000;
               color: white;
            }

            #left-menu {
               position: absolute;
               left: 0;
               top: 0;
               list-style: none;
               padding: 10px 20px;
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
               margin: 15px;
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

            #middle-menu {
               z-index: 10;
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
               margin-top: 25px;
               text-align: center;
               padding-inline-start: 0;
               font-size: 1.1em;
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

export default LandingHeader

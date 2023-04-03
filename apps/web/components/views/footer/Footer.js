import LinkedInIcon from "@mui/icons-material/LinkedIn"
import FacebookIcon from "@mui/icons-material/Facebook"
import InstagramIcon from "@mui/icons-material/Instagram"

import Link from "next/link"
import makeStyles from "@mui/styles/makeStyles"
import { Container, Grid } from "@mui/material"

const useStyles = makeStyles((theme) => ({
   root: {
      backgroundColor: theme.palette.background.paper,
      color:
         theme.palette.mode === "dark"
            ? theme.palette.text.secondary
            : "rgb(44, 66, 81)",
      padding: "50px 0 50px 0",
      textAlign: "center",
      "& a": {
         color:
            theme.palette.mode === "dark"
               ? theme.palette.text.secondary
               : "rgb(44, 66, 81)",
         "&:hover": {
            color:
               theme.palette.mode === "dark"
                  ? theme.palette.text.primary
                  : "rgb(25, 37, 46)",
         },
      },
   },
   icon: {
      color:
         theme.palette.mode === "dark"
            ? theme.palette.text.secondary
            : "rgb(44, 66, 81)",
      fontSize: "1.8em",
   },
}))

function Footer(props) {
   const classes = useStyles()
   return (
      <div className={classes.root}>
         <Container>
            <Grid container justifyContent="center">
               <Grid item xs={2}>
                  <div className="social-icon-container">
                     <a
                        href="https://www.linkedin.com/company/careerfairy/"
                        target="_blank"
                        rel="noopener noreferrer"
                     >
                        <LinkedInIcon className={classes.icon} size="large" />
                     </a>
                  </div>
               </Grid>
               <Grid item xs={2}>
                  <div className="social-icon-container">
                     <a
                        href="https://www.facebook.com/careerfairy"
                        target="_blank"
                        rel="noopener noreferrer"
                     >
                        <FacebookIcon className={classes.icon} size="large" />
                     </a>
                  </div>
               </Grid>
               <Grid item xs={2}>
                  <div className="social-icon-container">
                     <a
                        href="https://www.instagram.com/careerfairy/"
                        target="_blank"
                        rel="noopener noreferrer"
                     >
                        <InstagramIcon className={classes.icon} size="large" />
                     </a>
                  </div>
               </Grid>
               <Grid item xs={12} style={{ margin: 30 }}>
                  <div className="name-container">
                     LIVE STREAMING CAREER INSPIRATION
                  </div>
               </Grid>
               <Grid item xs={12} sm={4}>
                  <div className="footerListContainer">
                     <div className="footerList">
                        <div>
                           <Link href="/">
                              <a>For Students</a>
                           </Link>
                        </div>
                        <div>
                           <a href="https://companies.careerfairy.io">
                              For Companies
                           </a>
                        </div>
                        <div>
                           <a href="/career-center">For Career Centers</a>
                        </div>
                     </div>
                  </div>
               </Grid>
               <Grid item xs={12} sm={4}>
                  <div className="footerListContainer">
                     <div className="footerList">
                        <div>
                           <Link href="/terms">
                              <a>Terms and Conditions</a>
                           </Link>
                        </div>
                        <div>
                           <Link href="/privacy">
                              <a>Privacy Policy</a>
                           </Link>
                        </div>
                     </div>
                  </div>
               </Grid>
               <Grid item xs={12} sm={4}>
                  <div className="footerListContainer">
                     <div className="footerList">
                        <div>
                           <Link href="/discover">
                              <a>Discover</a>
                           </Link>
                        </div>
                        <div>
                           <Link href="/companies">
                              <a>Companies</a>
                           </Link>
                        </div>
                        <div>
                           <Link href="/wishlist">
                              <a>Wishlist</a>
                           </Link>
                        </div>
                     </div>
                  </div>
               </Grid>
               <Grid item xs={12}>
                  <div className="icons-credit">
                     Icons made by{" "}
                     <a
                        href="https://www.flaticon.com/authors/wanicon"
                        target="_blank"
                        rel="noopener noreferrer"
                     >
                        wanicon
                     </a>{" "}
                     from{" "}
                     <a
                        href="https://www.flaticon.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                     >
                        flaticon.com
                     </a>
                  </div>
               </Grid>
               <Grid item xs={12}>
                  <div>
                     2020 - CareerFairy GmbH - All Rights Reserved - Made in
                     Zurich, Switzerland
                  </div>
               </Grid>
            </Grid>
         </Container>
         <style jsx>{`
            a {
               text-decoration: none;
            }

            .social-icon-container {
               width: 100%;
               text-align: center;
            }

            .social-icon-container div {
               display: inline-block;
               border-radius: 5px;
               padding: 5px;
               text-align: center;
            }

            .social-icon-container a i {
               //color: rgb(44, 66, 81);
               font-size: 1.2em;
            }

            .footerListContainer {
               width: 100%;
               text-align: center;
            }

            .footerList {
               margin: 0 auto;
               list-style-type: none;
               display: inline-block;
               text-align: center;
            }

            .footerList div a {
               cursor: pointer;
               margin: 5px;
               //color: rgb(44, 66, 81);
            }

            .footerList div a:hover {
               cursor: pointer;
               margin: 5px;
               //color: rgb(25, 37, 46);
            }

            .name-container {
               text-align: center;
               font-weight: 600;
               font-size: 1.2em;
               //color: rgb(44, 66, 81);
               letter-spacing: 3px;
               margin: 20px 0 20px 0;
            }

            .icons-credit {
               margin-top: 30px;
               font-size: 0.85em;
            }
         `}</style>
      </div>
   )
}

export default Footer

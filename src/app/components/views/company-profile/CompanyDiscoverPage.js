import React from "react";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ElementTagList from "../common/ElementTagList";
import CompanyLocationFlags from "../common/CompanyLocationFlags";

import JobDescriptions from "../job-descriptions/JobDescriptions";
import { withFirebase } from "context/firebase/FirebaseServiceContext";
import { Container, Grid, Typography } from "@mui/material";

function CompanyDiscoverPage(props) {
   return (
      <div className="discover-container">
         <Container>
            <Grid container spacing={4} alignItems="center">
               <Grid item xs={12} md={6}>
                  <img
                     style={{
                        display: "inline-block",
                        maxHeight: "150px",
                        maxWidth: "400px",
                        width: "auto",
                     }}
                     src={props.company.logoUrl}
                     size="medium"
                  />
               </Grid>
               <Grid item xs={12} md={6}>
                  <a
                     href={"http://www." + props.company.url}
                     target="_blank"
                     rel="noopener noreferrer"
                     id="visit-website-button"
                  >
                     Visit Website
                  </a>
               </Grid>
            </Grid>
            <Grid container spacing={4}>
               <Grid item xs={12}>
                  <div id="discover-company-description">
                     <span>{props.company.industry}</span>
                     {props.company.headquarters}
                  </div>
               </Grid>
               <Grid item xs={12} id="discover-products">
                  <Typography variant="h5" id="discover-inner-header">
                     What you should know about us
                  </Typography>
                  <p>{props.company.mainProducts}</p>
               </Grid>
               <Grid item xs={4} id="discover-hiring">
                  <Typography variant="h5" id="discover-inner-header">
                     Hiring from
                  </Typography>
                  <ElementTagList fields={props.company.fieldsHiring} />
               </Grid>
               <Grid item xs={4} id="discover-employee-count">
                  <Typography variant="h5" id="discover-inner-header-employees">
                     Employees
                  </Typography>
                  <p
                     style={{
                        fontSize: "3em",
                        fontWeight: "500",
                        marginBottom: "0",
                     }}
                  >
                     {props.company.employees}
                  </p>
                  <div className="discover-employee-gender-distribution">
                     <em style={{ fontWeight: "bold", marginRight: 2 }}>F</em>
                     {props.company.femaleRatio}%
                     <em
                        style={{
                           fontWeight: "bold",
                           marginLeft: 5,
                           marginRight: 2,
                        }}
                     >
                        M
                     </em>
                     {100 - props.company.femaleRatio}%
                  </div>
               </Grid>
               <Grid item xs={4} id="discover-locations">
                  <Typography variant="h5" id="discover-inner-header">
                     Locations
                  </Typography>
                  <CompanyLocationFlags countries={props.company.locations} />
               </Grid>
            </Grid>
            <Grid
               container
               spacing={4}
               id="discover-hiring-grid"
               style={{ marginBottom: "20px" }}
            >
               <Grid item xs={12}>
                  <JobDescriptions {...props} company={props.company} />
               </Grid>
            </Grid>
         </Container>
         <Container
            style={{ textAlign: "center" }}
            className="titleFooter dark"
            onClick={() => props.fullpageApi.moveSectionDown()}
         >
            <p id="footer">Watch {props.company.name}</p>
            <KeyboardArrowDownIcon size="large" id="footer_icon" />
         </Container>
         <style jsx>{`
            .discover-container {
               padding-top: 2%;
            }

            #discover-logo,
            #discover-company-name {
               display: inline-block;
               vertical-align: top;
            }

            #discover-company-name h2 {
               font-weight: 500;
            }

            #discover-company-industry {
               color: rgb(30, 30, 30);
               margin: 5px 0;
            }

            #discover-company-description {
               margin: 20px 0;
               text-transform: uppercase;
               font-size: 1.2em;
               color: rgb(180, 180, 180);
            }

            #discover-company-description span {
               text-transform: uppercase;
               color: rgb(80, 80, 80);
               font-size: 1.3em;
               margin-right: 5px;
            }

            #discover-inner-header {
               font-weight: 500;
               color: rgb(170, 170, 170);
               margin-bottom: 10px;
               font-size: 0.9em;
               text-transform: uppercase;
            }

            #discover-inner-header-hidden {
               font-weight: 500;
               color: rgb(100, 100, 100);
               margin-bottom: 10px;
               text-transform: uppercase;
               opacity: 0;
            }

            #discover-inner-header-employees {
               font-weight: 500;
               color: rgb(170, 170, 170);
               margin-bottom: 0;
               font-size: 0.9em;
               text-transform: uppercase;
            }

            #discover-products p {
               font-size: 1.1em;
            }

            #discover-employee-count p {
               font-size: 3em;
               font-weight: 500;
               margin-bottom: 0;
            }

            #discover-watch-link {
               margin-bottom: 60px;
            }

            #discover-hiring-grid {
               margin-top: 20px;
               margin-bottom: 60px;
            }

            #discover-hiring {
               margin-bottom: 0px;
            }

            #discover-hiring-header {
               font-size: 1.2em;
               margin-top: 0;
               text-transform: uppercase;
               color: rgb(40, 40, 40);
            }

            #discover-hiring-description {
               width: 80%;
            }

            #discover-hiring-link {
               margin-bottom: 20px;
            }

            #discover-watch-link {
               margin-bottom: 60px;
            }

            #discover-watch-link a {
               color: rgb(80, 80, 80);
            }

            #discover-watch-link a span {
               color: rgba(255, 0, 0, 0.6);
            }

            #discover-watch-link a i {
               margin-left: 10px;
            }

            #visit-website-button {
               background-color: rgb(0, 210, 170);
               padding: 20px 80px;
               border-radius: 10px;
               font-weight: 500;
               font-size: 1.1em;
               color: white;
               height: 40px;
            }

            #visit-website-button:hover {
               background-color: rgb(0, 190, 150);
            }

            .titleFooter.dark #footer,
            .titleFooter.dark #footer_icon {
               color: black;
            }
         `}</style>
      </div>
   );
}

export default withFirebase(CompanyDiscoverPage);

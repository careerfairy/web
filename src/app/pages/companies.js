import { useEffect, useState } from "react";

import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";
import { withFirebase } from "../context/firebase";
import ElementTagList from "../components/views/common/ElementTagList";

import Loader from "../components/views/loader/Loader";
import { useRouter } from "next/router";
import { Button, Container, Grid, Typography } from "@material-ui/core";
import GeneralLayout from "../layouts/GeneralLayout";

function CompaniesOverview(props) {
   const router = useRouter();

   const [companies, setCompanies] = useState([]);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      setLoading(true);
      props.firebase.getCompaniesWithProfile().then((querySnapshot) => {
         var companyList = [];
         querySnapshot.forEach((doc) => {
            let company = doc.data();
            company.id = doc.id;
            companyList.push(company);
         });
         setCompanies(companyList);
         setLoading(false);
      });
   }, []);

   function goToCompany(companyId) {
      router.push(`/company?id=${companyId}`, `/company/${companyId}`);
   }

   const companyElements = companies.map((company) => {
      return (
         <Grid key={company.companyId} item xs={12} sm={4}>
            <div className="companies-container-element">
               <div className="companies-container-image">
                  <img
                     id="companies-container-image-tag"
                     src={company.logoUrl}
                     style={{
                        margin: 0,
                        position: "absolute",
                        top: "50%",
                        maxHeight: "100%",
                        maxWidth: "60%",
                        height: "auto",
                        width: "auto",
                        transform: "translateY(-50%)",
                     }}
                  />
               </div>
               <Typography
                  id="companies-company-name"
                  variant="h3"
                  style={{ marginBottom: 20 }}
               >
                  {company.name}
               </Typography>
               <p>{company.industry}</p>
               <p className="hiring-label">hiring from</p>
               <ElementTagList fields={company.fieldsHiring} />
               <Button
                  style={{
                     position: "absolute",
                     bottom: "10px",
                     left: "0",
                     right: "0",
                     width: "94%",
                     margin: "0 auto",
                  }}
                  variant="contained"
                  onClick={() => goToCompany(company.id)}
                  color="primary"
               >
                  Discover {company.name}
               </Button>
            </div>
            <style jsx>{`
               .companies-container-element {
                  position: relative;
                  margin-bottom: 0;
                  padding: 20px 40px 60px 40px;
                  height: 100%;
                  border-radius: 5px;
                  cursor: pointer;
                  background-color: white;
                  transition: all 0.2s ease-in-out;
                  -webkit-transition: all 0.2s ease-in-out;
                  box-shadow: 0 0 10px rgb(220, 220, 220);
               }

               .companies-container-element p {
                  color: grey;
               }

               .companies-container-image {
                  height: 100px;
                  position: relative;
                  margin: 20px 0;
               }

               .hiring-label {
                  font-size: 1em;
                  text-transform: uppercase;
                  color: rgb(150, 150, 150);
               }

               #discover-company {
                  position: absolute;
                  bottom: 10px;
                  left: 0;
                  right: 0;
                  width: 94%;
                  margin: 0 auto;
               }
            `}</style>
         </Grid>
      );
   });

   if (loading === false) {
      return (
         <>
            <GeneralLayout>
               <div className="companies-container">
                  <Container>
                     <Grid container spacing={3}>
                        {companyElements}
                     </Grid>
                  </Container>
               </div>
               <style jsx>{`
                  .companies-background {
                     background-color: rgb(248, 248, 248);
                  }

                  .companies-container {
                     margin: 3% auto;
                  }

                  #companies-company-name {
                     margin-top: 5px;
                  }
               `}</style>
            </GeneralLayout>
         </>
      );
   } else {
      return <Loader />;
   }
}

export default withFirebase(CompaniesOverview);

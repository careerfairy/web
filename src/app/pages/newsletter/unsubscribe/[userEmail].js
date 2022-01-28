import { Fragment, useEffect, useState } from "react";
import { withFirebasePage } from "context/firebase/FirebaseServiceContext";
import Loader from "components/views/loader/Loader";
import { useRouter } from "next/router";
import { Container } from "@material-ui/core";
import { useAuth } from "HOCs/AuthProvider";

function Unsubscribe(props) {
   const router = useRouter();
   const [loading, setLoading] = useState(true);
   const [invalidUser, setInvalidUser] = useState(false);
   const { userEmail } = router.query;
   const { authenticatedUser } = useAuth();

   useEffect(() => {
      if (
         authenticatedUser &&
         authenticatedUser.isLoaded &&
         authenticatedUser.email === userEmail
      ) {
         props.firebase.setUserUnsubscribed(userEmail).then(() => {
            setLoading(false);
         });
      } else if (authenticatedUser.isLoaded) {
         setLoading(false);
         setInvalidUser(true);
      }
   }, [userEmail, authenticatedUser]);

   if (loading === false) {
      return (
         <Fragment>
            {invalidUser ? (
               <Fragment>
                  <div className="companies-container">
                     <Container justify="center" style={{ padding: "100px" }}>
                        <h1 style={{ color: "#00d2aa" }}>CareerFairy</h1>
                        <div>
                           The user {userEmail} which you are trying to
                           unsubscribe is not logged in. Try logging in and
                           unsubscribe again
                        </div>
                     </Container>
                  </div>
                  <style jsx>{`
                     #companies-company-name {
                        margin-top: 5px;
                     }
                  `}</style>
               </Fragment>
            ) : (
               <Fragment>
                  <div className="companies-container">
                     <Container justify="center" style={{ padding: "100px" }}>
                        <h1 style={{ color: "#00d2aa" }}>CareerFairy</h1>
                        <div>
                           You successfully unsubscribed from our newsletter!
                        </div>
                     </Container>
                  </div>
                  <style jsx>{`
                     #companies-company-name {
                        margin-top: 5px;
                     }
                  `}</style>
               </Fragment>
            )}
         </Fragment>
      );
   } else {
      return <Loader />;
   }
}

export default withFirebasePage(Unsubscribe);

import PropTypes from "prop-types";
import React from "react";
import { Button } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useRouter } from "next/router";
import Avatar from "@mui/material/Avatar";
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   root: {
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "column",
   },
}));

const LogoElement = ({
   careerCenter,
   userData,
   userFollows,
   livestreamId,
   hideFollow,
   className,
   sx,
   handleOpenJoinModal,
}) => {
   const classes = useStyles();
   const router = useRouter();

   const linkToStream = `/next-livestreams?careerCenterId=${careerCenter.groupId}&livestreamId=${livestreamId}`;

   const handleJoin = () => {
      if (userData) {
         handleOpenJoinModal({ groups: [careerCenter] });
      } else {
         return router.push({
            pathname: "/login",
            query: { absolutePath: linkToStream },
         });
      }
   };

   return (
      <div className={classes.root}>
         <Avatar
            variant="rounded"
            key={careerCenter.id}
            className={className}
            sx={sx}
            src={getResizedUrl(careerCenter.logoUrl)}
            alt={careerCenter.universityName}
         />
         {!userFollows && !hideFollow && (
            <Button
               size="small"
               onClick={handleJoin}
               className={classes.followButton}
               variant="outlined"
               color="primary"
            >
               {" "}
               Follow{" "}
            </Button>
         )}
      </div>
   );
};

LogoElement.propTypes = {
   careerCenter: PropTypes.object,
   className: PropTypes.string,
   hideFollow: PropTypes.bool,
   livestreamId: PropTypes.string,
   userData: PropTypes.object,
   userFollows: PropTypes.bool,
};

export default LogoElement;

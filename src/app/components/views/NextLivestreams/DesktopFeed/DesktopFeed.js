import React from "react";
import { Container, Grid, Grow } from "@mui/material";
import GroupCategories from "../GroupCategories/GroupCategories";
import GroupStreams from "../GroupStreams/GroupStreams";
import { useTheme } from "@mui/material/styles";

// FIXME checkout https://mui.com/components/use-media-query/#migrating-from-withwidth
const withWidth = () => (WrappedComponent) => (props) =>
   <WrappedComponent {...props} width="xs" />;

const DesktopFeed = ({
   groupData,
   hasCategories,
   handleToggleActive,
   mobile,
   livestreams,
   searching,
   livestreamId,
   careerCenterId,
   listenToUpcoming,
   selectedOptions,
   isPastLivestreams,
}) => {
   return (
      <Grow in>
         <Container
            maxWidth="lg"
            disableGutters
            sx={{ flex: 1, display: "flex" }}
         >
            <Grid
               container
               spacing={4}
               ju
               sx={{ margin: (theme) => theme.spacing(1) }}
            >
               <GroupCategories
                  mobile={mobile}
                  hasCategories={hasCategories}
                  handleToggleActive={handleToggleActive}
                  groupData={groupData}
               />
               <GroupStreams
                  mobile={false}
                  isPastLivestreams={isPastLivestreams}
                  livestreamId={livestreamId}
                  listenToUpcoming={listenToUpcoming}
                  careerCenterId={careerCenterId}
                  selectedOptions={selectedOptions}
                  searching={searching}
                  livestreams={livestreams}
                  groupData={groupData}
               />
            </Grid>
         </Container>
      </Grow>
   );
};

export default withWidth()(DesktopFeed);

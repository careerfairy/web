import React from "react"
import { Container, Grid, Grow } from "@mui/material"
import GroupStreams from "../GroupStreams/GroupStreams"

// FIXME checkout https://mui.com/components/use-media-query/#migrating-from-withwidth
// eslint-disable-next-line react/display-name
const withWidth = () => (WrappedComponent) => (props) =>
   <WrappedComponent {...props} width="xs" />

const DesktopFeed = ({
   groupData,
   livestreams,
   searching,
   careerCenterId,
   listenToUpcoming,
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
               sx={{ margin: (theme) => theme.spacing(1) }}
            >
               <GroupStreams
                  mobile={false}
                  isPastLivestreams={isPastLivestreams}
                  listenToUpcoming={listenToUpcoming}
                  careerCenterId={careerCenterId}
                  searching={searching}
                  livestreams={livestreams}
                  groupData={groupData}
               />
            </Grid>
         </Container>
      </Grow>
   )
}

export default withWidth()(DesktopFeed)

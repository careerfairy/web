import React from "react";
import GeneralLayout from "layouts/GeneralLayout";
import HighlightsCarousel from "../components/views/portal/HighlightsCarousel";
import Container from "@mui/material/Container";
import FeaturedAndNextEvents from "../components/views/portal/FeaturedAndNextEvents";
import RecommendedEvents from "../components/views/portal/events-prview/RecommendedEvents";
import ComingUpNextEvents from "../components/views/portal/events-prview/ComingUpNextEvents";
import MyNextEvents from "../components/views/portal/events-prview/MyNextEvents";
import WidgetsWrapper from "../components/views/portal/WidgetsWrapper";

const PortalPage = () => {
   return (
      <GeneralLayout backgroundColor={"#FFF"} hideNavOnScroll fullScreen>
         <Container
            disableGutters
            sx={{
               px: {
                  xs: 0.5,
                  sm: 1,
                  md: 2,
               },
            }}
         >
            <WidgetsWrapper>
               {/*<HighlightsCarousel />*/}
               <FeaturedAndNextEvents />
               <RecommendedEvents maxLimitIncreaseTimes={5} limit={30} />
               <ComingUpNextEvents limit={20} />
               <MyNextEvents limit={20} />
            </WidgetsWrapper>
         </Container>
      </GeneralLayout>
   );
};

export default PortalPage;

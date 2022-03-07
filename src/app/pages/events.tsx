import React from "react";
import GeneralLayout from "layouts/GeneralLayout";
import HighlightsCarousel from "../components/views/events/HighlightsCarousel";
import Container from "@mui/material/Container";
import FeaturedAndNextEvents from "../components/views/events/FeaturedAndNextEvents";
import Stack from "@mui/material/Stack";
import RecommendedEvents from "../components/views/events/events-prview/RecommendedEvents";
import ComingUpNextEvents from "../components/views/events/events-prview/ComingUpNextEvents";
import MyNextEvents from "../components/views/events/events-prview/MyNextEvents";

const EventsPage = () => {
   return (
      <GeneralLayout hideNavOnScroll fullScreen>
         <Container>
            <Stack spacing={{ xs: 1, sm: 3 }}>
               <HighlightsCarousel />
               <FeaturedAndNextEvents />
               <RecommendedEvents limit={20} />
               <ComingUpNextEvents limit={12} />
               <MyNextEvents limit={12} />
            </Stack>
         </Container>
      </GeneralLayout>
   );
};

export default EventsPage;

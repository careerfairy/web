import React from "react";
import GeneralLayout from "layouts/GeneralLayout";
import HighlightsCarousel from "../components/views/events/Highlights/HighlightsCarousel";
import { Container } from "@mui/material";
import FeaturedAndNextEvents from "../components/views/events/FeaturedAndNextEvents/FeaturedAndNextEvents";

const EventsPage = () => {
   return (
      <GeneralLayout fullScreen>
         <Container>
            <HighlightsCarousel />
            <FeaturedAndNextEvents />
         </Container>
      </GeneralLayout>
   );
};

export default EventsPage;

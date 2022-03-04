import React from "react";
import GeneralLayout from "layouts/GeneralLayout";
import HighlightsCarousel from "../components/views/events/HighlightsCarousel";
import { Container } from "@mui/material";
import FeaturedAndNextEvents from "../components/views/events/FeaturedAndNextEvents";
import EventsPreview, {
   EventsTypes,
} from "../components/views/events/events-prview/EventsPreview";

const EventsPage = () => {
   return (
      <GeneralLayout hideNavOnScroll fullScreen>
         <Container>
            <HighlightsCarousel />
            <FeaturedAndNextEvents />
            <EventsPreview typeOfEvents={EventsTypes.recommended} />
            <EventsPreview typeOfEvents={EventsTypes.comingUp} />
            <EventsPreview typeOfEvents={EventsTypes.myNext} />
         </Container>
      </GeneralLayout>
   );
};

export default EventsPage;

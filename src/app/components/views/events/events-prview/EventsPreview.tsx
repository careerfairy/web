import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { LiveStreamEvent } from "../../../../types/event";
import EventPreviewCard from "../../common/stream-cards/EventPreviewCard";
import Link from "next/link";
import RegistrationModal from "components/views/common/registration-modal";
import { useRouter } from "next/router";
import useRegistrationModal from "../../../custom-hook/useRegistrationModal";

const styles = {
   eventsGrid: {
      display: "grid",
      gap: (theme) => theme.spacing(2),
      gridAutoFlow: "column",
      gridAutoColumns: (theme) => theme.spacing(40),
      scrollSnapType: "x",
      transition: "transform 0.5s ease-out 0s",
      willChange: "transform",
      overflowX: "scroll",
      padding: (theme) => theme.spacing(0, 0, 2),
   },
   eventsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   seeMoreText: {
      color: "text.secondary",
      fontSize: "1.2rem",
      fontWeight: 600,
   },
} as const;

const EventsPreview = ({
   title,
   seeMoreLink,
   loading,
   limit,
   events,
}: EventsProps) => {
   const {
      query: { groupId },
   } = useRouter();
   const { joinGroupModalData, handleCloseJoinModal, handleClickRegister } =
      useRegistrationModal();

   return (
      <>
         <Box>
            <Box sx={styles.eventsHeader}>
               <Typography fontWeight={500} variant="h5">
                  {title}
               </Typography>

               {events?.length >= limit && (
                  <Link href={seeMoreLink}>
                     <a>
                        <Typography sx={styles.seeMoreText} color="grey">
                           See more
                        </Typography>
                     </a>
                  </Link>
               )}
            </Box>
            <Box sx={styles.eventsGrid}>
               {events === undefined || loading ? (
                  <CircularProgress />
               ) : events === null ? (
                  <Typography>No Events</Typography>
               ) : (
                  <>
                     {events.map((event) => (
                        <EventPreviewCard
                           onRegisterClick={handleClickRegister}
                           key={event.id}
                           event={event}
                        />
                     ))}
                  </>
               )}
            </Box>
         </Box>
         {joinGroupModalData && (
            <RegistrationModal
               open={Boolean(joinGroupModalData)}
               onFinish={handleCloseJoinModal}
               promptOtherEventsOnFinal={!groupId}
               livestream={joinGroupModalData?.livestream}
               groups={joinGroupModalData?.groups}
               targetGroupId={joinGroupModalData?.targetGroupId}
               handleClose={handleCloseJoinModal}
            />
         )}
      </>
   );
};

export enum EventsTypes {
   /**
    * Top Picks for User based on the interests they selected at signup
    */
   recommended = "recommended",
   /**
    * Non specific upcoming events on careerfairy ordered closest start date
    */
   comingUp = "comingUp",
   /**
    * upcoming events on that user has registered to ordered closest start date
    */
   myNext = "myNext",
}

export interface EventsProps {
   events: LiveStreamEvent[];
   seeMoreLink?: string;
   title?: string;
   loading: boolean;
   limit: number;
}

export default EventsPreview;

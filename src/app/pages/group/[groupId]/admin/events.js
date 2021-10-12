import React from "react";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead";
import { withFirebase } from "../../../../context/firebase";
import EventsOverview from "../../../../components/views/group/admin/events";

const EventsPage = ({ firebase }) => {
   return (
      <GroupDashboardLayout>
         <DashboardHead title="CareerFairy | Admin Upcoming Streams of" />
         <EventsOverview
            query={firebase.listenToUpcomingLiveStreamsByGroupId}
            typeOfStream="upcoming"
            isDraft={false}
         />
      </GroupDashboardLayout>
   );
};

export default withFirebase(EventsPage);

import React from "react";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import StreamsOverview from "../../../../components/views/group/admin/events";
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead";
import { withFirebase } from "../../../../context/firebase";

const DraftStreamsPage = ({ firebase }) => {
   return (
      <GroupDashboardLayout>
         <DashboardHead title="CareerFairy | Admin Manage Drafts of" />
         <StreamsOverview
            query={firebase.listenToDraftLiveStreamsByGroupId}
            typeOfStream="draft"
            isDraft
         />
      </GroupDashboardLayout>
   );
};

export default withFirebase(DraftStreamsPage);

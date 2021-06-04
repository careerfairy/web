import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Tooltip } from "@material-ui/core";
import CategoryBreakdownDemo from "./CategoryBreakdownDemo";
import TotalUniqueParticipatingStudentsDemo from "./TotalUniqueParticipatingStudentsDemo";
import LatestEventsDemo from "./LatestEventsDemo";
import UserCountDemo from "./UserCountDemo";
import AverageRegistrationsDemo from "./AverageRegistrationsDemo";
import TotalUniqueRegistrationsDemo from "./TotalUniqueRegistrationsDemo";
import TotalRegistrationsDemo from "./TotalRegistrationsDemo";
import useTimeFrames from "../../../../custom-hook/useTimeFrames";

const useStyles = makeStyles((theme) => ({}));

const DashboardDemo = ({}) => {
   const { globalTimeFrames } = useTimeFrames();
   const [globalTimeFrame] = useState(globalTimeFrames[2]);

   const [totalRegistrationsProps, setTotalRegistrationsProps] = useState({
      totalRegistrations: 1459,
      registrationsStatus: {
         dataToCompare: true,
         percentage: "12%",
         positive: true,
      },
   });
   const [totalUniqueRegistrationsProps, setTotalUniqueRegistrationsProps] = useState({
      totalRegistrations: 789,
      registrationsStatus: {
         dataToCompare: true,
         percentage: "23%",
         positive: true,
      },
   });
   const getCategoryProps = () => ({
      item: true,
      xs: 12,
      sm: 12,
      lg: 6,
      xl: 6,
   });
   const totalUsers = 972;
   const mediumScreen = false;
   const group = {};

   const totalUniqueParticipatingStudents = 343;
   const uniqueParticipationStatus = {};

   const isUni = true;

   return (
      <Grid container spacing={3}>
         <Grid xs={12} sm={12} md={7} lg={8} item>
            <Grid container spacing={3}>
               <Grid {...getCategoryProps()}>
                  <TotalRegistrationsDemo
                     registrationsStatus={
                        totalRegistrationsProps.registrationsStatus
                     }
                     totalRegistrations={
                        totalRegistrationsProps.totalRegistrations
                     }
                     timeFrames={globalTimeFrame.timeFrames}
                     globalTimeFrame={globalTimeFrame}
                     group={group}
                  />
               </Grid>
               <Grid {...getCategoryProps()}>
                  <TotalUniqueRegistrationsDemo
                     uniqueRegistrationsStatus={totalUniqueRegistrationsProps.registrationsStatus}
                     totalUniqueRegistrations={totalUniqueRegistrationsProps.totalRegistrations}
                     timeFrames={globalTimeFrame.timeFrames}
                     globalTimeFrame={globalTimeFrame}
                     group={group}
                  />
               </Grid>
               <Grid {...getCategoryProps()}>
                  {/*<AverageRegistrationsDemo*/}
                  {/*   averageRegistrations={averageRegistrations}*/}
                  {/*   timeFrames={globalTimeFrame.timeFrames}*/}
                  {/*   group={group}*/}
                  {/*/>*/}
               </Grid>
               <Grid {...getCategoryProps()}>
                  {/*<UserCountDemo*/}
                  {/*   fetching={loading}*/}
                  {/*   totalUsers={totalUsers}*/}
                  {/*   timeFrames={globalTimeFrame.timeFrames}*/}
                  {/*   currentUserDataSet={currentUserDataSet}*/}
                  {/*   group={group}*/}
                  {/*/>*/}
               </Grid>
               {mediumScreen && !group.universityCode && (
                  <Grid item xs={12} md={12} sm={12}>
                     <TotalUniqueParticipatingStudentsDemo
                        totalUniqueParticipatingStudents={
                           totalUniqueParticipatingStudents
                        }
                        uniqueParticipationStatus={uniqueParticipationStatus}
                        timeFrames={globalTimeFrame.timeFrames}
                        globalTimeFrame={globalTimeFrame}
                        group={group}
                     />
                  </Grid>
               )}

               <Grid item xs={12}>
                  {/*<LatestEventsDemo*/}
                  {/*   timeFrames={globalTimeFrame.timeFrames}*/}
                  {/*   setCurrentStream={setCurrentStream}*/}
                  {/*   currentStream={currentStream}*/}
                  {/*   futureStreams={futureStreams}*/}
                  {/*   streamsFromTimeFrame={streamsFromTimeFrame}*/}
                  {/*   userType={userType}*/}
                  {/*   userTypes={userTypes}*/}
                  {/*   handleScrollToBreakdown={handleScrollToBreakdown}*/}
                  {/*   handleToggleBar={handleToggleBar}*/}
                  {/*   showBar={showBar}*/}
                  {/*   setUserType={setUserType}*/}
                  {/*   group={group}*/}
                  {/*/>*/}
               </Grid>
            </Grid>
         </Grid>
         <Grid xs={12} sm={12} md={5} lg={4} item>
            <Grid container spacing={3}>
               {!mediumScreen && !group.universityCode && (
                  <Grid xs={12} item>
                     <TotalUniqueParticipatingStudentsDemo
                        totalUniqueParticipatingStudents={
                           totalUniqueParticipatingStudents
                        }
                        uniqueParticipationStatus={uniqueParticipationStatus}
                        timeFrames={globalTimeFrame.timeFrames}
                        globalTimeFrame={globalTimeFrame}
                        group={group}
                     />
                  </Grid>
               )}
               <Grid item xs={12}>
                  {/*<CategoryBreakdownDemo*/}
                  {/*   currentStream={currentStream}*/}
                  {/*   breakdownRef={breakdownRef}*/}
                  {/*   localUserType={localUserType}*/}
                  {/*   currentUserDataSet={currentUserDataSet}*/}
                  {/*   setLocalUserType={setLocalUserType}*/}
                  {/*   userTypes={userTypes}*/}
                  {/*   streamsFromTimeFrameAndFuture={*/}
                  {/*      streamsFromTimeFrameAndFuture*/}
                  {/*   }*/}
                  {/*   groups={groups}*/}
                  {/*   isUni={isUni}*/}
                  {/*   handleReset={handleReset}*/}
                  {/*   setUserType={setUserType}*/}
                  {/*   setCurrentStream={setCurrentStream}*/}
                  {/*   group={group}*/}
                  {/*/>*/}
               </Grid>
            </Grid>
         </Grid>
      </Grid>
   );
};

export default DashboardDemo;

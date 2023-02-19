import {
   deserializeLiveStreamStats,
   LiveStreamStats,
   serializeLiveStreamStats,
} from "@careerfairy/shared-lib/livestreams/stats"
import MainPageContent from "components/views/group/admin/main"
import { MainPageProvider } from "components/views/group/admin/main/MainPageProvider"
import { livestreamRepo } from "data/RepositoryInstances"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { useMemo } from "react"

const MainPage = ({
   groupId,
   livestreamStats,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
   const stats = useMemo(() => {
      return livestreamStats?.map(deserializeLiveStreamStats) ?? []
   }, [livestreamStats])

   return (
      <GroupDashboardLayout pageDisplayName={"Main Page"} groupId={groupId}>
         <DashboardHead title="CareerFairy | Main Page of" />

         <MainPageProvider livestreamStats={stats}>
            <MainPageContent />
         </MainPageProvider>
      </GroupDashboardLayout>
   )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
   const { groupId } = context.params

   let stats: LiveStreamStats[]
   try {
      stats = await livestreamRepo.getLivestreamStatsForGroup(groupId as string)
   } catch (error) {
      console.error(error)
   }

   return {
      props: {
         groupId,
         livestreamStats: stats?.map(serializeLiveStreamStats),
      },
   }
}

export default MainPage

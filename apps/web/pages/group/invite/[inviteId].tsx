import { useAuth } from "../../../HOCs/AuthProvider"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../../../components/custom-hook/utils/useFunctionsSWRFetcher"
import useSWR from "swr"
import CircularProgress from "@mui/material/CircularProgress"
import Box from "@mui/material/Box"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"

type GroupInvitePageProps = InferGetServerSidePropsType<
   typeof getServerSideProps
>
const GroupInvitePage = ({ inviteId }: GroupInvitePageProps) => {
   const { isLoggedIn } = useAuth()
   const fetcher = useFunctionsSWR<{
      groupId: string
   }>() //

   const { data, error, isValidating } = useSWR(
      isLoggedIn // only fetch if logged in
         ? [
              "validateGroupAdminDashboardInvite",
              {
                 inviteId,
              },
           ]
         : null,
      fetcher,
      {
         ...reducedRemoteCallsOptions,
         onSuccess: ({ groupId }) => {
            // TODO: redirect to group admin dashboard and show success toast
         },
      }
   )

   if (error) {
      return <div>error: {error.message}</div>
   }

   if (isValidating) {
      return (
         <Box>
            <CircularProgress />
         </Box>
      )
   }

   return (
      <div>
         <h1>Group Invite Page</h1>
      </div>
   )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
   const { inviteId } = context.params

   return {
      props: {
         inviteId: inviteId as string,
      },
   }
}

export default GroupInvitePage

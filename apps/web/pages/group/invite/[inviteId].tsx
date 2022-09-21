import { useAuth } from "../../../HOCs/AuthProvider"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../../../components/custom-hook/utils/useFunctionsSWRFetcher"
import useSWR from "swr"
import CircularProgress from "@mui/material/CircularProgress"
import Box from "@mui/material/Box"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import useSnackbarNotifications from "../../../components/custom-hook/useSnackbarNotifications"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import GeneralLayout from "../../../layouts/GeneralLayout"
import { useMemo } from "react"
import Container from "@mui/material/Container"
import { Typography } from "@mui/material"

type GroupInvitePageProps = InferGetServerSidePropsType<
   typeof getServerSideProps
>
const GroupInvitePage = ({ inviteId }: GroupInvitePageProps) => {
   const { isLoggedIn } = useAuth()
   const { successNotification } = useSnackbarNotifications()
   const fetcher = useFunctionsSWR<Group>() //
   const { data, error, isValidating } = useSWR(
      isLoggedIn // only fetch if logged in
         ? [
              "joinGroupDashboard",
              {
                 inviteId,
              },
           ]
         : null,
      fetcher,
      {
         ...reducedRemoteCallsOptions,
         onSuccess: ({ id, universityName }) => {
            successNotification(
               `You have successfully joined the ${universityName} group`
            )
            // TODO: redirect to group admin dashboard
         },
         suspense: false,
      }
   )

   const renderView = useMemo(() => {
      if (isValidating) {
         return (
            <Box
               sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
               }}
            >
               <CircularProgress />
            </Box>
         )
      }
      if (error) {
         return (
            <Typography align={"center"} variant={"h6"}>
               {error.message}
            </Typography>
         )
      }
      if (data) {
         return <div>Success!</div>
      }

      return <h1>Invalid invite</h1>
   }, [isValidating, error, data])

   return (
      <GeneralLayout fullScreen>
         <Container
            sx={{
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
               flex: 1,
            }}
         >
            {renderView}
         </Container>
      </GeneralLayout>
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

import { useAuth } from "../../../HOCs/AuthProvider"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../../../components/custom-hook/utils/useFunctionsSWRFetcher"
import useSWR from "swr"
import CircularProgress from "@mui/material/CircularProgress"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import useSnackbarNotifications from "../../../components/custom-hook/useSnackbarNotifications"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import GeneralLayout from "../../../layouts/GeneralLayout"
import { useEffect, useMemo } from "react"
import Container from "@mui/material/Container"
import { Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import { MainLogo } from "../../../components/logos"
import { useRouter } from "next/router"

type GroupInvitePageProps = InferGetServerSidePropsType<
   typeof getServerSideProps
>
const GroupInvitePage = ({ inviteId }: GroupInvitePageProps) => {
   const { isLoggedIn, isLoggedOut, refetchClaims } = useAuth()
   const {
      replace,
      asPath,
      pathname,
      query: { flow },
   } = useRouter()
   const { successNotification } = useSnackbarNotifications()
   const fetcher = useFunctionsSWR<Group>() //
   const { error } = useSWR(
      isLoggedIn // only fetch if logged in
         ? [
              "joinGroupDashboard_v2",
              {
                 inviteId,
              },
           ]
         : null,
      fetcher,
      {
         ...reducedRemoteCallsOptions,
         onSuccess: ({ id, universityName }) => {
            return refetchClaims().then(() =>
               replace(`/group/${id}/admin/analytics`).then(() => {
                  successNotification(
                     `You have successfully joined the ${universityName} group`
                  )
               })
            ) // redirect to group dashboard
         },
         suspense: false,
      }
   )

   useEffect(() => {
      // Check that initial route is OK
      const flowPaths = {
         signup: "/signup-admin",
         login: "/login-admin",
      }
      if (isLoggedOut) {
         void replace({
            pathname: flowPaths[flow as string] || "/login-admin",
            query: { absolutePath: asPath },
         })
      }
   }, [asPath, isLoggedOut, pathname, replace, flow])

   const renderView = useMemo(() => {
      // check if error is bad request
      if (error) {
         return (
            <Stack spacing={2} direction="column" alignItems="center">
               <MainLogo />
               <Typography align={"center"} variant={"h6"}>
                  {error.message?.replace("Error: ", "")}
               </Typography>
            </Stack>
         )
      }

      return <CircularProgress />
   }, [error])

   return (
      <GeneralLayout fullScreen>
         <Container
            maxWidth={"sm"}
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

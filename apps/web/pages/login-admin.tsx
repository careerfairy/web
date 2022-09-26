import React from "react"
import LogInForm from "../components/views/login/LoginForm"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import { groupRepo } from "../data/RepositoryInstances"
import LoginLayout from "../layouts/LoginLayout"
import InvalidInviteDisplay from "../components/views/common/auth/InvalidInviteDisplay"

type Props = InferGetServerSidePropsType<typeof getServerSideProps>
const LogInPage = ({ validInvite }: Props) => (
   <LoginLayout>
      {validInvite ? (
         <LogInForm groupAdmin />
      ) : (
         <InvalidInviteDisplay type={"login"} />
      )}
   </LoginLayout>
)

export async function getServerSideProps(context: GetServerSidePropsContext) {
   const { groupDashboardInviteId } = context.query

   const validInvite = await groupRepo.getGroupDashboardInviteById(
      groupDashboardInviteId as string
   )
   return {
      props: {
         validInvite: !!validInvite,
      },
   }
}

export default LogInPage

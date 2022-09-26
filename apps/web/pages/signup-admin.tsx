import React from "react"
import SignupForm from "../components/views/signup/SignupForm"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import { groupRepo } from "../data/RepositoryInstances"
import SignupLayout from "../layouts/SignupLayout"
import InvalidInviteDisplay from "../components/views/common/auth/InvalidInviteDisplay"

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const SignUp = ({ validInvite }: Props) => {
   return (
      <SignupLayout>
         {validInvite ? (
            <SignupForm groupAdmin />
         ) : (
            <InvalidInviteDisplay type={"signup"} />
         )}
      </SignupLayout>
   )
}

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

export default SignUp

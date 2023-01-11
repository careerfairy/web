import { GetServerSidePropsContext } from "next"
const AdminPage = () => {
   return null // legacy page
}

export const getServerSideProps = async (
   context: GetServerSidePropsContext
) => {
   const groupId = context.params.groupId as string

   // redirect to analytics page
   return {
      redirect: {
         destination: `/group/${groupId}/admin/analytics`,
      },
   }
}

export default AdminPage

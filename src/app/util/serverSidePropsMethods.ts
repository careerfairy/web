import { GetServerSidePropsContext } from "next/types";
import {
   getServerSideStream,
   getServerSideStreamAdminPreferences,
} from "./serverUtil";
import { shouldWeRedirectNextGen } from "./StreamUtil";

export const handleRedirectToNextGen = async (
   context: GetServerSidePropsContext
) => {
   const serverSideStream = await getServerSideStream(
      context.params.livestreamId
   );
   const adminPreferences = await getServerSideStreamAdminPreferences(
      context.params.livestreamId
   );

   if (!serverSideStream) {
      return {
         props: {},
         redirect: {
            destination: "/streaming/error",
         },
      };
   }
   const currentEnv = process.env.NODE_ENV;

   const props = { serverSideStream };
   const urlToRedirect = shouldWeRedirectNextGen(
      context.req.headers.host,
      currentEnv,
      adminPreferences?.isNextGen,
      context.req.url
   );

   if (urlToRedirect) {
      return {
         redirect: {
            destination: urlToRedirect,
         },
      };
   }

   return {
      props, // will be passed to the page component as props
   };
};

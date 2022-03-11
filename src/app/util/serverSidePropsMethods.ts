import { GetServerSidePropsContext } from "next/types";
import {
   getServerSideStream,
   getServerSideStreamAdminPreferences,
} from "./serverUtil";
import { shouldWeRedirectNextGen } from "./streamUtil";

export const handleRedirectToNextGen = async (
   context: GetServerSidePropsContext
) => {
   const [serverSideStream, adminPreferences] = await Promise.all([
      getServerSideStream(context.params.livestreamId),
      getServerSideStreamAdminPreferences(context.params.livestreamId),
   ]);

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
   const isNextGen = adminPreferences?.isNextGen
      ? adminPreferences?.isNextGen
      : null;
   const urlToRedirect = shouldWeRedirectNextGen(
      context.req.headers.host,
      currentEnv,
      isNextGen,
      context.resolvedUrl
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

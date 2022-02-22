import { GetServerSidePropsContext } from "next/types";
import { getServerSideStream } from "./serverUtil";

export const handleRedirectToNextGen = async (
   context: GetServerSidePropsContext
) => {
   const serverSideStream = await getServerSideStream(
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
   const isInProdEnvironment = process.env.NODE_ENV === "production";

   const isInBetaDomain = context.req.headers.host === "nextgen.careerfairy.io";
   const isBeta = serverSideStream.isBeta;
   const props = { serverSideStream };
   if (!isInProdEnvironment || typeof isBeta !== "boolean") {
      return {
         props, // will be passed to the page component as props
      };
   }
   if (isBeta) {
      if (!isInBetaDomain) {
         return {
            redirect: {
               destination: `https://nextgen.careerfairy.io${context.req.url}`,
            },
         };
      }
   } else {
      if (isInBetaDomain) {
         return {
            redirect: {
               destination: `https://careerfairy.io${context.req.url}`,
            },
         };
      }
   }

   return {
      props, // will be passed to the page component as props
   };
};

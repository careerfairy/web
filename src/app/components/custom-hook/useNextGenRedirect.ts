import { useEffect } from "react";
import { shouldWeRedirectNextGen } from "../../util/streamUtil";

const useNextGenRedirect = (isBeta: boolean) => {
   useEffect(() => {
      const { host, pathname, search: query } = window.location;
      const currentEnv = process.env.NODE_ENV;
      const requestOptions = `${pathname}${query}`;
      const urlToRedirect = shouldWeRedirectNextGen(
         host,
         currentEnv,
         isBeta,
         requestOptions
      );
      if (urlToRedirect) {
         window.location.href = urlToRedirect;
      }
   }, [isBeta]);

   return null;
};

export default useNextGenRedirect;

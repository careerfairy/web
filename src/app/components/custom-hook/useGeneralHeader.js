import React, { useMemo } from "react";
import GeneralHeader from "../views/header/GeneralHeader";
import { useTheme } from "@mui/material/styles";

const useGeneralHeader = (options = { dark: false }) => {
   const theme = useTheme();

   const headerColors = useMemo(() => {
      if (options.dark) {
         return {
            backgroundColor: theme.palette.common.black,
            navLinksActiveColor: theme.palette.common.white,
         };
      }
      return {
         backgroundColor: theme.palette.common.white,
         navLinksActiveColor: theme.palette.grey["800"],
      };
   }, [options.dark, theme]);

   return {
      GeneralHeader,
      headerColors,
   };
};

export default useGeneralHeader;

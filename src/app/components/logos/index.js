import React from "react";
import Link from "next/link";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const LogoImage = styled("img")({
   cursor: "pointer",
   width: "150px",
   display: "inline-block",
});
export const MainLogo = ({ white, className }) => {
   return (
      <Link href="/">
         <Box
            component="a"
            sx={{
               display: "flex",
            }}
         >
            <LogoImage
               alt="CareerFairy Logo"
               src={white ? "/logo_white.svg" : "/logo_teal.svg"}
               className={className}
            />
         </Box>
      </Link>
   );
};
export const MiniLogo = ({ size = 30 }) => {
   return (
      <Link href="/">
         <a>
            <img
               alt="CareerFairy Logo"
               width={size}
               height={size}
               src={"/apple-touch-icon-57x57.png"}
            />
         </a>
      </Link>
   );
};

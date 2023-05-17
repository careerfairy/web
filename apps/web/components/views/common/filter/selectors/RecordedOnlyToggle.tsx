import { FormControl, Switch } from "@mui/material"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import React, { useCallback, useMemo } from "react"
import { styled } from "@mui/material/styles"
import { useRouter } from "next/router"

const RecordedOnlyToggle = () => {
   const { pathname, push, query } = useRouter()

   const isRecordedCheck = useMemo(
      () => query?.recordedOnly === "true",
      [query.recordedOnly]
   )

   const handleRecordedCheckChange = useCallback(
      (event, checked) => {
         const newQuery = {
            ...query,
            ["recordedOnly"]: checked,
            page: 0,
         }

         void push(
            {
               pathname: pathname,
               query: newQuery,
            },
            undefined,
            { shallow: true }
         )
      },
      [pathname, push, query]
   )

   return (
      <FormControl key="recorded-only" variant={"outlined"} fullWidth>
         <Typography
            htmlFor="recorded-only"
            component={"label"}
            variant={"h5"}
            fontWeight={600}
            id={"recorded-only-label"}
         >
            Recorded only
         </Typography>
         <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
         >
            <Typography mt={1} variant={"body1"} fontWeight={300}>
               Display only recorded past live streams on your results.
            </Typography>
            <AntSwitch
               checked={isRecordedCheck}
               onChange={handleRecordedCheckChange}
            />
         </Box>
      </FormControl>
   )
}

const AntSwitch = styled(Switch)(({ theme }) => ({
   width: 35,
   height: 21,
   padding: 0,
   display: "flex",
   "&:active": {
      "& .MuiSwitch-switchBase.Mui-checked": {
         transform: "translateX(10px)",
      },
   },
   "& .MuiSwitch-switchBase": {
      padding: 3,
      "&.Mui-checked": {
         transform: "translateX(13px)",
         color: "#fff",
         "& + .MuiSwitch-track": {
            opacity: 1,
            backgroundColor: "primary",
         },
      },
   },
   "& .MuiSwitch-thumb": {
      boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
      width: 15,
      height: 15,
      borderRadius: "50%",
   },
   "& .MuiSwitch-track": {
      borderRadius: 12,
      opacity: 1,
      backgroundColor:
         theme.palette.mode === "dark"
            ? "rgba(255,255,255,.35)"
            : "rgba(0,0,0,.25)",
      boxSizing: "border-box",
   },
}))

export default RecordedOnlyToggle

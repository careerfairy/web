import { FormControl, Switch } from "@mui/material"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import React, { useMemo } from "react"
import { styled } from "@mui/material/styles"
import { useRouter } from "next/router"

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

type Props = {
   filterId: string
   handleApplyFilter: ({ pathName, query }) => void
   label?: string
   description?: string
}

const ToggleSelector = ({
   filterId,
   handleApplyFilter,
   label,
   description,
}: Props) => {
   const { pathname, query } = useRouter()

   const isFilterEnabled = useMemo(
      () => query[filterId] === "true",
      [query, filterId]
   )

   const handleFilterCheckChange = (_, checked) => {
      const newQuery = {
         ...query,
         [filterId]: checked,
         page: 0,
      }
      handleApplyFilter({ pathName: pathname, query: newQuery })
   }

   return (
      <FormControl key={"toggle-selector"} variant={"outlined"} fullWidth>
         <Typography
            htmlFor="recorded-only"
            component={"label"}
            variant={"h5"}
            fontWeight={600}
            id="toggle-selector-typography-label"
         >
            {label}
         </Typography>
         <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
         >
            <Typography mt={1} variant={"body1"} fontWeight={300}>
               {description}
            </Typography>
            <AntSwitch
               checked={isFilterEnabled}
               onChange={handleFilterCheckChange}
            />
         </Box>
      </FormControl>
   )
}

export default ToggleSelector

import useGroupATSJobsAllIntegrations from "../../../../../custom-hook/useGroupATSJobsAllIntegrations"
import { useATSAccount } from "../ATSAccountContextProvider"
import { useCallback, useMemo, useState } from "react"
import Typography from "@mui/material/Typography"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import Autocomplete from "@mui/material/Autocomplete"
import TextField from "@mui/material/TextField"
import { OnChangeHandler } from "./RequiredFields"

type Props = {
   disabled?: boolean
   onChange: OnChangeHandler<Job>
}

const JobList = ({ onChange, disabled = false }: Props) => {
   const { atsAccount } = useATSAccount()
   const accounts = useMemo(() => [atsAccount], [atsAccount])
   const jobs = useGroupATSJobsAllIntegrations(accounts)
   const [selected, setSelected] = useState<Job["id"]>(null)

   const data = useMemo(
      () => jobs.map((j) => ({ id: j.id, name: j.name })),
      [jobs]
   )

   const handleChange = useCallback(
      (event, value) => {
         setSelected(value)
         onChange(jobs.find((j) => j.id === value?.id))
      },
      [jobs, onChange]
   )

   return (
      <>
         <Typography>
            Choose a Job to be used in the sample Application:
         </Typography>

         <Autocomplete
            disabled={disabled}
            value={selected}
            onChange={handleChange}
            options={data}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
               <TextField
                  {...params}
                  label="Select Job"
                  variant="outlined"
                  fullWidth
               />
            )}
         />
      </>
   )
}

export default JobList

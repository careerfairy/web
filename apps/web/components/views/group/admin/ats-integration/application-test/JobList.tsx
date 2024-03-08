import useGroupATSJobsAllIntegrations from "../../../../../custom-hook/useGroupATSJobsAllIntegrations"
import { useATSAccount } from "../ATSAccountContextProvider"
import { useCallback, useMemo, useState } from "react"
import Typography from "@mui/material/Typography"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import Autocomplete from "@mui/material/Autocomplete"
import TextField from "@mui/material/TextField"
import { OnChangeHandler } from "./RequiredFields"
import BrandedAutocomplete from "components/views/common/inputs/BrandedAutocomplete"

type Props = {
   disabled?: boolean
   onChange: OnChangeHandler<Job>
   isBrandedVersion?: boolean
}

const JobList = ({ onChange, disabled = false, isBrandedVersion }: Props) => {
   const { atsAccount } = useATSAccount()
   const accounts = useMemo(() => [atsAccount], [atsAccount])
   const jobs = useGroupATSJobsAllIntegrations(accounts)
   const [selected, setSelected] = useState<Job["id"]>(null)

   const data = useMemo(
      () => jobs.map((j) => ({ id: j.id, name: j.name, key: j.id })),
      [jobs]
   )

   const handleChange = useCallback(
      (_, value) => {
         setSelected(value)
         onChange(jobs.find((j) => j.id === value?.id))
      },
      [jobs, onChange]
   )

   const isLoading = data.length === 0

   return isBrandedVersion ? (
      <BrandedAutocomplete
         id={"atsJob"}
         options={data}
         getOptionLabel={(option) => option.name}
         isOptionEqualToValue={(option, value) => option.id === value.id}
         value={selected}
         textFieldProps={{
            label: isLoading ? "Loading Jobs.." : "Select Job",
            placeholder: "Select a job",
         }}
         onChange={handleChange}
      />
   ) : (
      <>
         <Typography>
            Choose a Job to be used in the sample Application:
         </Typography>

         <Autocomplete
            disabled={disabled}
            value={selected}
            loading={isLoading}
            onChange={handleChange}
            options={data}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
               <TextField
                  {...params}
                  label={isLoading ? "Loading Jobs.." : "Select Job"}
                  variant="outlined"
                  fullWidth
                  name="application-test-jobs"
               />
            )}
         />
      </>
   )
}

export default JobList

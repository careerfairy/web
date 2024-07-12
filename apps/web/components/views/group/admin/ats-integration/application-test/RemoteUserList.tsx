import { RecruitersFunctionCallOptions } from "@careerfairy/shared-lib/ats/Functions"
import { getIntegrationSpecifics } from "@careerfairy/shared-lib/ats/IntegrationSpecifics"
import { Recruiter } from "@careerfairy/shared-lib/ats/Recruiter"
import Autocomplete from "@mui/material/Autocomplete"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useCallback, useMemo, useState } from "react"
import useGroupATSRecruiters from "../../../../../custom-hook/ats/useGroupATSRecruiters"
import { useATSAccount } from "../ATSAccountContextProvider"
import { OnChangeHandler } from "./RequiredFields"

const options: RecruitersFunctionCallOptions = {
   all: true,
}

type Props = {
   onChange: OnChangeHandler<Recruiter["id"]>
   disabled?: boolean
}

const RemoteUserList = ({ onChange, disabled = false }: Props) => {
   const { atsAccount } = useATSAccount()
   // current ats account integration specifics
   const specifics = getIntegrationSpecifics(atsAccount)
   const recruiters = useGroupATSRecruiters(
      atsAccount.groupId,
      atsAccount.id,
      options
   )

   const filteredRecruiters = useMemo(
      () => specifics.filterRecruiters(recruiters.results),
      [recruiters, specifics]
   )

   const data = useMemo(
      () => filteredRecruiters.map((r) => ({ id: r.id, name: r.getName() })),
      [filteredRecruiters]
   )

   const [selected, setSelected] = useState<Recruiter["id"]>(null)

   const handleChange = useCallback(
      (event, value) => {
         setSelected(value)
         onChange(filteredRecruiters.find((r) => r.id === value?.id)?.id)
      },
      [filteredRecruiters, onChange]
   )

   return (
      <>
         <Typography>
            Choose the User that will be responsible for this Integration:
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
                  label="Select User"
                  variant="outlined"
                  fullWidth
               />
            )}
         />
      </>
   )
}

export default RemoteUserList

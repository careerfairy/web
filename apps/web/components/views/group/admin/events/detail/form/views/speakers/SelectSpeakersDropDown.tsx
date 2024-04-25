import AddRoundedIcon from "@mui/icons-material/AddRounded"
import {
   Avatar,
   Divider,
   ListItemIcon,
   ListItemText,
   MenuItem,
   Stack,
   Typography,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import BaseStyles from "components/views/admin/company-information/BaseStyles"
import {
   BrandedAutocompleteProps,
   FormBrandedAutocomplete,
} from "components/views/common/inputs/BrandedAutocomplete"
import CreatorAvatar from "components/views/sparks/components/CreatorAvatar"
import { SyntheticEvent, useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import { Creator } from "@careerfairy/shared-lib/groups/creators"

const styles = sxStyles({
   menuItem: {
      p: 2,
   },
   listIcon: {
      mr: 1,
   },
   addNewAvatar: {
      bgcolor: "#EFEFEF",
      color: "#9E9E9E",
      "& svg": {
         width: 24,
         height: 24,
      },
   },
   avatar: {
      width: 40,
      height: 40,
   },
   input: {
      ".MuiInputBase-root": {
         paddingX: "12px",
      },
      input: {
         padding: "0 !important",
      },
   },
   optionElementContainer: {
      width: { xs: "85%", md: "100%" },
      padding: "16px",
   },
   optionTitle: {
      fontSize: { xs: "14px", md: "16px" },
      width: "600",
      fontWeight: "bold",
      marginBottom: 1,
   },
   optionInfo: {
      fontSize: { xs: "12px", md: "14px" },
   },
   ellipsis: {
      overflow: "hidden",
      textOverflow: "ellipsis",
   },
   speakerInfo: {
      fontWeight: 300,
      fontSize: "14px",
      lineHeight: "24px",
   },
})

type Props = {
   label: string
   placeholder: string
   handleCreateNew: () => void
   options: Creator[]
   values?: Creator[]
} & BrandedAutocompleteProps

const SelectSpeakersDropDown = ({
   label,
   placeholder,
   options,
   handleCreateNew,
   values,
   ...props
}: Props) => {
   const isMobile = useIsMobile()
   const { setFieldValue, isSubmitting } = useLivestreamFormValues()

   const renderCreateNewCreatorOption = useMemo(
      () => (
         <>
            <MenuItem sx={styles.menuItem} onMouseDown={handleCreateNew}>
               <ListItemIcon sx={styles.listIcon}>
                  <Avatar sx={styles.addNewAvatar}>
                     <AddRoundedIcon />
                  </Avatar>
               </ListItemIcon>
               <ListItemText primary={"Create a new contributor"} />
            </MenuItem>
            {options?.length ? <Divider /> : null}
         </>
      ),
      [handleCreateNew, options?.length]
   )

   const onChangeHandler = async (
      event: SyntheticEvent,
      selectedOptions: Creator[]
   ) => {
      await setFieldValue(props.id, selectedOptions)
   }

   return (
      <FormBrandedAutocomplete
         name={props.id}
         value={values}
         options={options}
         isOptionEqualToValue={isOptionEqualToValue}
         getOptionLabel={getLabelFn}
         sx={BaseStyles.chipInput}
         textFieldProps={{
            name: props.id,
            label: label,
            fullWidth: true,
            placeholder: placeholder,
            sx: styles.input,
         }}
         onChange={onChangeHandler}
         multiple
         disableCloseOnSelect
         initialOptionSection={renderCreateNewCreatorOption}
         getOptionElement={(speaker) =>
            getOptionElement(speaker as Creator, isMobile)
         }
         disabled={isSubmitting}
         {...props}
      />
   )
}

const getOptionElement = (speaker: Creator, isMobile: boolean) => (
   <Stack direction="row" padding="16px" gap="8px" width="100%">
      <CreatorAvatar
         creator={{
            firstName: speaker.firstName,
            lastName: speaker.lastName,
            avatarUrl: speaker.avatarUrl,
         }}
         size={48}
      />
      <Stack direction="column" alignContent="center" width="40dvw">
         <Typography fontSize="16px" lineHeight="24px" sx={styles.ellipsis}>
            {`${speaker.firstName} ${speaker.lastName}`}
         </Typography>
         {Boolean(speaker.position || speaker.email) && (
            <Stack spacing={2} direction={"row"}>
               {Boolean(speaker.position && !isMobile) && (
                  <Typography sx={styles.speakerInfo}>
                     {speaker.position}
                  </Typography>
               )}

               {Boolean(speaker.position && speaker.email && !isMobile) && (
                  <Divider orientation="vertical" flexItem />
               )}

               {Boolean(speaker.email) && (
                  <Typography
                     sx={[
                        styles.optionInfo,
                        styles.ellipsis,
                        styles.speakerInfo,
                     ]}
                  >
                     {speaker.email}
                  </Typography>
               )}
            </Stack>
         )}
      </Stack>
   </Stack>
)

const getLabelFn = (value: Creator) => {
   return `${value.firstName} ${value.lastName}`
}

const isOptionEqualToValue = (option: Creator, value: Creator): boolean =>
   option.id === value.id

export default SelectSpeakersDropDown

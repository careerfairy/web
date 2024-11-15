import {
   BusinessFunctionsTagValues,
   ContentTopicsTagValues,
} from "@careerfairy/shared-lib/constants/tags"
import { ProfileInterest } from "@careerfairy/shared-lib/users"
import { ButtonBase, Stack, Typography } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { StyledCheckbox } from "components/views/group/admin/common/inputs"
import { ReactNode, useMemo } from "react"
import {
   FormProvider,
   UseFormReturn,
   useFormContext,
   useWatch,
} from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import {
   CreateInterestSchema,
   CreateInterestSchemaType,
   getInitialInterestValues,
} from "./schemas"

const styles = sxStyles({
   formRoot: {
      minWidth: {
         xs: "313px",
         sm: "343px",
         md: "500px",
      },
   },
   tagTitle: {
      color: (theme) => theme.palette.neutral[800],
      fontWeight: 600,
      py: 1,
   },
   tagName: {
      color: (theme) => theme.palette.neutral[800],
      fontWeight: 400,
   },
   checkBoxWrapper: {
      alignItems: "center",
      width: "100%",
      justifyContent: "space-between",
      p: "16px 24px",
   },
   checkBoxBtnBase: {
      height: "56px",
      mx: "-24px !important",
      "&:hover": {
         backgroundColor: (theme) => theme.brand.black[100],
         "& .MuiBox-root": {
            backgroundColor: (theme) => theme.palette.neutral[100],
         },
      },
   },
   checkedCheckboxBtnBase: {
      backgroundColor: (theme) => theme.brand.white[300],
      ":hover": {
         backgroundColor: (theme) => theme.brand.white[400],
         "& .MuiBox-root": {
            backgroundColor: (theme) => theme.brand.purple[50],
         },
      },
   },
})

type InterestFormProviderProps = {
   interest?: ProfileInterest
   children:
      | ((methods: UseFormReturn<CreateInterestSchemaType>) => ReactNode)
      | ReactNode
}

export const InterestFormProvider = ({
   children,
   interest,
}: InterestFormProviderProps) => {
   const defaultValues = getInitialInterestValues(interest)

   const methods = useYupForm({
      schema: CreateInterestSchema,
      defaultValues: defaultValues,
      mode: "onChange",
      reValidateMode: "onChange",
   })

   return (
      <FormProvider {...methods}>
         {typeof children === "function" ? children(methods) : children}
      </FormProvider>
   )
}

export const InterestFormFields = () => {
   const { setValue } = useFormContext()

   const formBusinessFunctionTagIds: string[] = useWatch({
      name: "businessFunctionsTagIds",
   })

   const formContentTopicTagIds: string[] = useWatch({
      name: "contentTopicsTagIds",
   })

   const checkedBusinessFunctionsMap: Record<string, boolean> = useMemo(() => {
      return BusinessFunctionsTagValues.reduce<Record<string, boolean>>(
         (map, tag) => {
            map[tag.id] = formBusinessFunctionTagIds.includes(tag.id)
            return map
         },
         {}
      )
   }, [formBusinessFunctionTagIds])

   const checkedContentTopicsMap: Record<string, boolean> = useMemo(() => {
      return ContentTopicsTagValues.reduce<Record<string, boolean>>(
         (map, tag) => {
            map[tag.id] = formContentTopicTagIds.includes(tag.id)
            return map
         },
         {}
      )
   }, [formContentTopicTagIds])

   const onClickTag = (
      checkMap: Record<string, boolean>,
      tagId: string,
      currentValues: string[],
      fieldName: string
   ) => {
      const isChecked = checkMap[tagId]

      if (isChecked)
         setValue(
            fieldName,
            currentValues.filter((id) => id !== tagId)
         )
      else setValue(fieldName, [...currentValues, tagId])
   }

   const onClickBusinessFunction = (tagId: string) =>
      onClickTag(
         checkedBusinessFunctionsMap,
         tagId,
         formBusinessFunctionTagIds,
         "businessFunctionsTagIds"
      )

   const onClickContentTopic = (tagId: string) =>
      onClickTag(
         checkedContentTopicsMap,
         tagId,
         formContentTopicTagIds,
         "contentTopicsTagIds"
      )

   return (
      <Stack spacing={2} sx={styles.formRoot}>
         <Stack>
            <Typography variant="medium" sx={styles.tagTitle}>
               Job areas
            </Typography>
            {BusinessFunctionsTagValues.map((tag) => (
               <TagCheckbox
                  key={tag.id}
                  value={tag}
                  checked={checkedBusinessFunctionsMap[tag.id]}
                  handleClick={onClickBusinessFunction}
               />
            ))}
         </Stack>
         <Stack>
            <Typography variant="medium" sx={styles.tagTitle}>
               Content topics
            </Typography>
            {ContentTopicsTagValues.map((tag) => (
               <TagCheckbox
                  key={tag.id}
                  value={tag}
                  checked={checkedContentTopicsMap[tag.id]}
                  handleClick={onClickContentTopic}
               />
            ))}
         </Stack>
      </Stack>
   )
}

type TagCheckboxProps = {
   value: { id: string; name: string }
   checked: boolean
   handleClick: (id: string) => void
}

const TagCheckbox = ({ value, checked, handleClick }: TagCheckboxProps) => {
   return (
      <ButtonBase
         onClick={() => handleClick(value.id)}
         sx={[
            styles.checkBoxBtnBase,
            checked ? styles.checkedCheckboxBtnBase : null,
         ]}
      >
         <Stack direction={"row"} sx={styles.checkBoxWrapper}>
            <Typography variant="medium" sx={styles.tagName}>
               {value.name}
            </Typography>
            <StyledCheckbox checked={checked} />
         </Stack>
      </ButtonBase>
   )
}

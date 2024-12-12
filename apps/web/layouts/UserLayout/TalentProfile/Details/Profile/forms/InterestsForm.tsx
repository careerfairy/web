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
import { useEffectOnce } from "react-use"
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
      pl: {
         xs: "7px",
         sm: "7px",
         md: 0,
      },
   },
   checkBoxWrapper: {
      alignItems: "center",
      width: "100%",
      justifyContent: "space-between",
      p: "16px 24px",
   },
   checkBoxBtnBase: {
      height: "56px",
      mx: {
         xs: "-23px !important",
         sm: "-23px !important",
         md: "-24px !important",
      },
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
   const businessFunctionsFieldName = "businessFunctionsTagIds"
   const contentTopicsFieldName = "contentTopicsTagIds"

   const { setValue, getFieldState, trigger } =
      useFormContext<CreateInterestSchemaType>()

   const businessFunctionsState = getFieldState(businessFunctionsFieldName)
   const contentTopicsState = getFieldState(contentTopicsFieldName)

   const formBusinessFunctionTagIds: string[] = useWatch({
      name: businessFunctionsFieldName,
   })

   const formContentTopicTagIds: string[] = useWatch({
      name: contentTopicsFieldName,
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
      fieldName: "businessFunctionsTagIds" | "contentTopicsTagIds"
   ) => {
      const isChecked = checkMap[tagId]
      const newValue = isChecked
         ? currentValues.filter((id) => id !== tagId)
         : [...currentValues, tagId]

      setValue(fieldName, newValue, { shouldValidate: true })
   }

   const onClickBusinessFunction = (tagId: string) =>
      onClickTag(
         checkedBusinessFunctionsMap,
         tagId,
         formBusinessFunctionTagIds,
         businessFunctionsFieldName
      )

   const onClickContentTopic = (tagId: string) =>
      onClickTag(
         checkedContentTopicsMap,
         tagId,
         formContentTopicTagIds,
         contentTopicsFieldName
      )

   useEffectOnce(() => {
      trigger()
   })

   return (
      <Stack spacing={0} sx={styles.formRoot}>
         <Stack>
            <Typography variant="medium" sx={styles.tagTitle}>
               Job areas
            </Typography>
            {businessFunctionsState.invalid ? (
               <Typography variant="xsmall" color={"error.500"}>
                  {businessFunctionsState.error.message}
               </Typography>
            ) : null}
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
            {contentTopicsState.invalid ? (
               <Typography variant="xsmall" color={"error.500"}>
                  {contentTopicsState.error.message}
               </Typography>
            ) : null}
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
         disableRipple
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

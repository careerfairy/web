import { Creator, PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { CreateCreatorSchemaType } from "@careerfairy/shared-lib/groups/schemas"
import useGroupCreator from "components/custom-hook/creator/useGroupCreator"
import useIsDesktop from "components/custom-hook/useIsDesktop"
import {
   CreatorFormFields,
   CreatorFormProvider,
} from "components/views/creator/CreatorForm"
import useCreatorFormSubmit from "components/views/sparks/forms/hooks/useCreatorFormSubmit"
import { useFormContext } from "react-hook-form"
import { CreatorFormLayout } from "./CreatorFormLayout"

type ActionsProps = {
   creator: Creator
   handleSubmitCallback?: (values: CreateCreatorSchemaType) => void
   handleClose: () => void
}

const Actions = ({
   creator,
   handleSubmitCallback,
   handleClose,
}: ActionsProps) => {
   const { handleSubmit: handleCreatorSubmit } = useCreatorFormSubmit(
      creator?.groupId
   )

   const {
      handleSubmit: handleFormSubmit,
      formState: { isSubmitting, isValid, isDirty },
      setError,
   } = useFormContext<CreateCreatorSchemaType>()

   const onSubmit = async (values: CreateCreatorSchemaType) => {
      await handleCreatorSubmit(values, setError as any)
      handleSubmitCallback?.(values)
      handleClose()
   }

   return (
      <>
         <CreatorFormLayout.Button
            variant="outlined"
            color="grey"
            onClick={handleClose}
         >
            Cancel
         </CreatorFormLayout.Button>

         <CreatorFormLayout.Button
            variant="contained"
            color={"secondary"}
            disabled={isSubmitting || !isValid || !isDirty}
            type="submit"
            onClick={handleFormSubmit?.(onSubmit)}
            loading={isSubmitting}
         >
            Save
         </CreatorFormLayout.Button>
      </>
   )
}

type MentorFormProps = {
   mentor: PublicCreator
   handleSubmitCallback?: (values: CreateCreatorSchemaType) => void
   handleClose: () => void
}

export const MentorForm = ({
   mentor,
   handleSubmitCallback,
   handleClose,
}: MentorFormProps) => {
   const isDesktop = useIsDesktop()

   const { data: creator } = useGroupCreator(
      mentor?.groupId || "",
      mentor?.id || "",
      {
         suspense: true,
         initialData: mentor,
      }
   )

   if (!creator?.id) return null

   return (
      <CreatorFormProvider creator={creator}>
         <CreatorFormLayout handleClose={handleClose}>
            <CreatorFormLayout.Container>
               <CreatorFormLayout.Header>
                  <CreatorFormLayout.Title>
                     Edit {Boolean(isDesktop) && "your"}{" "}
                     <CreatorFormLayout.HighlightedTitleText>
                        contributor
                     </CreatorFormLayout.HighlightedTitleText>
                  </CreatorFormLayout.Title>
                  <CreatorFormLayout.Subtitle>
                     Check and change your contributor details
                  </CreatorFormLayout.Subtitle>
               </CreatorFormLayout.Header>
               <CreatorFormLayout.Fields>
                  <CreatorFormFields />
               </CreatorFormLayout.Fields>
            </CreatorFormLayout.Container>
            <CreatorFormLayout.Actions>
               <Actions
                  creator={creator}
                  handleSubmitCallback={handleSubmitCallback}
                  handleClose={handleClose}
               />
            </CreatorFormLayout.Actions>
         </CreatorFormLayout>
      </CreatorFormProvider>
   )
}

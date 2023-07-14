import { Box } from "@mui/material"
import SelectCreatorDropDown, {
   addNewCreatorId,
} from "components/views/common/creator/SelectCreatorDropDown"
import React, { useCallback } from "react"
import { sxStyles } from "types/commonTypes"
import SparksDialog, { SparkDialogStep } from "../SparksDialog"
import { dummyCreators } from "@careerfairy/shared-lib/groups/creators"
import * as yup from "yup"
import { Field, Form, Formik } from "formik"
import { useStepper } from "components/views/stepped-dialog/SteppedDialog"

const styles = sxStyles({
   root: {
      m: "auto",
      width: "100%",
   },
})

type Props = {}

type FormValues = {
   creatorId: string
}
const initialValues: FormValues = {
   creatorId: "",
} as const

const CreateCreatorView = (props: Props) => {
   const { goToStep } = useStepper<SparkDialogStep>()

   return (
      <SparksDialog.Container sx={styles.root}>
         <SparksDialog.Title>
            Create a new{" "}
            <Box component="span" color="secondary.main">
               profile
            </Box>
         </SparksDialog.Title>
         <SparksDialog.Subtitle>
            Insert your new creator details!
         </SparksDialog.Subtitle>
         <Box mt={5} />
         <Formik
            initialValues={initialValues}
            validationSchema={CreateCreatorSchema}
            onSubmit={(values, { setSubmitting }) => {}}
         >
            {({ submitForm, isSubmitting, touched, errors }) => <Form></Form>}
         </Formik>
      </SparksDialog.Container>
   )
}

const CreateCreatorSchema = yup.object().shape({})

export default CreateCreatorView

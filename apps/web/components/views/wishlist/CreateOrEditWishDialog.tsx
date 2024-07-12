import { Interest } from "@careerfairy/shared-lib/interests"
import { Wish } from "@careerfairy/shared-lib/wishes"
import { CreateWishFormValues } from "@careerfairy/shared-lib/wishes/wishes"
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"
import {
   Button,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   TextField,
} from "@mui/material"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { Formik } from "formik"
import { useMemo } from "react"
import { useDispatch } from "react-redux"
import * as yup from "yup"
import { useAuth } from "../../../HOCs/AuthProvider"
import { wishlistRepo } from "../../../data/RepositoryInstances"
import { HandleAddNewWishToHits } from "../../../pages/wishlist"
import * as actions from "../../../store/actions"
import { StylesProps } from "../../../types/commonTypes"
import { useInterests } from "../../custom-hook/useCollection"
import UserAvatar from "../common/UserAvatar"
import InterestSelect from "./InterestSelect"

interface CreateWishDialogProps {
   open: boolean
   onClose: () => void
   wishToEdit?: Wish
   onUpdateWish?: (newInterests: Interest[], newDescription: string) => void
   handleAddNewWishToHits?: HandleAddNewWishToHits
}

const maxInterests = 5

const schema = yup.object().shape({
   description: yup
      .string()
      .required("The description is required")
      .max(350, "The description is too long")
      .min(10, "The description is too short"),
   isPublic: yup.boolean(),
   interests: yup
      .array()
      .of(
         yup.object().shape({
            id: yup.string().required("An interest is required"),
            name: yup.string().required("An interest is required"),
         })
      )
      .required("A valid interest must be selected")
      .max(maxInterests, "You can only add up to 5 interests"),
   // companyNames: yup
   //    .array()
   //    .of(yup.string().required("The company name is required"))
   //    .max(5, "You can only add 5 companies")
   //    .when("category", {
   //       is: "company",
   //       then: yup.array().min(1, "You must add at least one company"),
   //    }),
})

const styles: StylesProps = {
   title: {
      textAlign: "center",
      fontWeight: 600,
   },
   content: {
      borderBottom: "none",
      display: "flex",
      flexDirection: {
         xs: "column",
         sm: "row",
      },
      alignItems: {
         xs: "center",
         sm: "flex-start",
      },
   },
   avatar: {
      mr: 2,
      mb: 2,
   },
   fields: {
      flex: 1,
   },
   label: {
      fontWeight: 600,
   },
   actions: {
      p: {
         sm: 2,
      },
   },
}

interface LabelProps {
   title: string
   // Specifies the id of the form element the label should be bound to
   htmlFor: string
}

const Label = ({ title, htmlFor }: LabelProps) => {
   return (
      <Typography
         component={"label"}
         variant="h6"
         htmlFor={htmlFor}
         sx={styles.label}
      >
         {title}
      </Typography>
   )
}
const CreateOrEditWishDialog = ({
   open,
   onClose,
   wishToEdit,
   onUpdateWish,
   handleAddNewWishToHits,
}: CreateWishDialogProps) => {
   // Material dialog
   const { userData, authenticatedUser } = useAuth()
   const dispatch = useDispatch()
   const { data: allInterests } = useInterests()
   const initialValues = useMemo<CreateWishFormValues>(
      () => ({
         description: wishToEdit?.description || "",
         interests: wishToEdit?.interestIds?.length
            ? allInterests.filter((int) =>
                 wishToEdit.interestIds.includes(int.id)
              )
            : [],
         companyNames: wishToEdit?.companyNames || [],
      }),
      [
         wishToEdit?.description,
         wishToEdit?.interestIds,
         wishToEdit?.companyNames,
         allInterests,
      ]
   )

   const handleClose = () => {
      onClose()
   }

   const onSubmit = async (values: CreateWishFormValues) => {
      try {
         if (wishToEdit?.id) {
            await wishlistRepo.updateWish(values, wishToEdit.id)
            if (onUpdateWish) {
               onUpdateWish(values.interests, values.description)
            }
         } else {
            // create wish
            const newWish = await wishlistRepo.createWish(
               authenticatedUser.uid,
               values
            )
            handleAddNewWishToHits(newWish)
         }
         dispatch(
            actions.sendSuccessMessage(
               wishToEdit?.id
                  ? "Your wish has been updated"
                  : "Thanks for your wish!"
            )
         )
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
      // close dialog
      handleClose()
   }

   const submitLabel = wishToEdit ? "Update Wish" : "Make Your Wish"
   const submitLoadingLabel = wishToEdit ? "Updating..." : "Creating..."
   return (
      <Formik
         initialValues={initialValues}
         validationSchema={schema}
         enableReinitialize={!!wishToEdit?.id}
         onSubmit={onSubmit}
      >
         {({
            isSubmitting,
            values,
            touched,
            handleBlur,
            setFieldValue,
            handleChange,
            errors,
            handleSubmit,
         }) => (
            <form id={"creat-wish-form"}>
               <Dialog
                  maxWidth={"sm"}
                  fullWidth
                  onClose={handleClose}
                  open={open}
               >
                  <DialogTitle sx={styles.title}>Create Wish</DialogTitle>
                  <DialogContent sx={styles.content} dividers>
                     <UserAvatar
                        data={userData}
                        sx={styles.avatar}
                        size={"large"}
                     />
                     <Stack sx={styles.fields} spacing={2}>
                        <Box>
                           <Label
                              title={`${userData?.firstName || ""} ${
                                 userData?.lastName || ""
                              }`}
                              htmlFor={"description"}
                           />
                           <TextField
                              autoFocus
                              margin="dense"
                              id="description"
                              name="description"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.description}
                              helperText={
                                 Boolean(touched.description) &&
                                 errors.description
                              }
                              maxRows={6}
                              minRows={4}
                              error={Boolean(
                                 errors.description && touched.description
                              )}
                              disabled={isSubmitting}
                              label="Description"
                              type="text"
                              multiline
                              fullWidth
                           />
                        </Box>
                        <Box>
                           <Label
                              title={`Select tags (${
                                 maxInterests - values.interests.length
                              } left)`}
                              htmlFor={"interests"}
                           />
                           <InterestSelect
                              id={"interests"}
                              setFieldValue={setFieldValue}
                              disabled={isSubmitting}
                              touched={Boolean(touched.interests)}
                              error={errors.interests as string}
                              handleBlur={handleBlur}
                              selectedInterests={values.interests}
                              totalInterests={allInterests}
                           />
                        </Box>
                        {/*<Collapse in={values.category === "company"}>*/}
                        {/*   <CompanyNamesSelect*/}
                        {/*      setFieldValue={setFieldValue}*/}
                        {/*      disabled={isSubmitting}*/}
                        {/*      touched={touched.companyNames}*/}
                        {/*      error={errors.companyNames as string}*/}
                        {/*      handleBlur={handleBlur}*/}
                        {/*      selectedCompanyNames={values.companyNames}*/}
                        {/*   />*/}
                        {/*</Collapse>*/}
                     </Stack>
                  </DialogContent>
                  <DialogActions sx={styles.actions}>
                     <Button color={"grey"} onClick={handleClose}>
                        Cancel
                     </Button>
                     <Button
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        color={"secondary"}
                        startIcon={
                           isSubmitting ? (
                              <CircularProgress size={20} color={"inherit"} />
                           ) : (
                              <AutoFixHighIcon />
                           )
                        }
                        variant={"contained"}
                     >
                        {isSubmitting ? submitLoadingLabel : submitLabel}
                     </Button>
                  </DialogActions>
               </Dialog>
            </form>
         )}
      </Formik>
   )
}

export default CreateOrEditWishDialog

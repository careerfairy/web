import * as yup from "yup"

const CreateCreatorSchema = yup.object().shape({
   firstName: yup
      .string()
      .max(50, "First Name must be less than 50 characters")
      .required("First Name is required"),
   lastName: yup
      .string()
      .max(50, "Last Name must be less than 50 characters")
      .required("Last Name is required"),
   position: yup
      .string()
      .max(50, "Position must be less than 50 characters")
      .required("Position is required"),
   email: yup.string().email("Invalid email").required("Email is required"),
   linkedInUrl: yup
      .string()
      .url()
      .matches(/linkedin.com/),
   story: yup.string().max(500, "Story must be less than 500 characters"),

   avatarUrl: yup.string(),
   avatarFile: yup.mixed<File>().when("avatarUrl", {
      is: (avatarUrl: string) => !avatarUrl, // if avatarUrl is empty
      then: yup // then avatarFile is required
         .mixed<File>()
         .test("avatarFile", "Avatar is required", function (value) {
            return Boolean(value)
         }),
   }),
})

export default CreateCreatorSchema

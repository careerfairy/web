import * as yup from "yup"
import { CreatorRole, CreatorRoles } from "./creators"

export const baseCreatorShape = {
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
      .url("Must be a valid URL (e.g.,: https://linkedin.com/in/user)")
      .matches(/(^$|linkedin.com)/, "Invalid LinkedIn URL"),
   story: yup.string().max(500, "Story must be less than 500 characters"),

   avatarUrl: yup.string(),
   avatarFile: yup.mixed<File>().when("avatarUrl", {
      is: (avatarUrl: string) => !avatarUrl, // if avatarUrl is empty
      then: yup // then avatarFile is required
         .mixed<File>()
         .test("avatarFile", "Avatar file is required", function (value) {
            return Boolean(value)
         }),
   }),
   roles: yup
      .array()
      .of(yup.mixed<CreatorRole>().oneOf(Object.values(CreatorRoles))),
   id: yup.string(),
   groupId: yup.string(),
}

export const CreateCreatorSchema = yup.object(baseCreatorShape)

export type CreateCreatorSchemaType = yup.InferType<typeof CreateCreatorSchema>

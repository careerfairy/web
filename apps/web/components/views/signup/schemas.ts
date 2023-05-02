import { URL_REGEX } from "components/util/constants"
import * as yup from "yup"
import { possibleGenders } from "../../../constants/forms"

export const signupSchema = {
   email: yup
      .string()
      .trim()
      .required("Your email is required")
      .email("Please enter a valid email address"),
   firstName: yup
      .string()
      .required("Your first name is required")
      .max(50, "Cannot be longer than 50 characters")
      .matches(/^\D+$/i, "Please enter a valid first name"),
   lastName: yup
      .string()
      .required("Your last name is required")
      .max(50, "Cannot be longer than 50 characters")
      .matches(/^\D+$/i, "Please enter a valid last name"),
   universityCountryCode: yup.string().required("Please chose a country code"),
   password: yup
      .string()
      .required("A password is required")
      .matches(
         /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/,
         "Your password needs to be at least 6 characters long and contain at least one uppercase character, one lowercase character and one number"
      ),
   confirmPassword: yup
      .string()
      .required("You need to confirm your password")
      .oneOf(
         [yup.ref("password")],
         "Your password was not confirmed correctly"
      ),
   agreeTerm: yup
      .boolean()
      .oneOf([true], "Please agree to our T&C and our Privacy Policy"),
   subscribed: yup.boolean(),
   gender: yup.string().oneOf(
      possibleGenders.map((g) => g.value),
      "Please select a valid gender"
   ),
   university: yup
      .object()
      .shape({
         code: yup.string(),
         name: yup.string(),
      })
      .required("Please select a university"),
   fieldOfStudy: yup
      .object()
      .nullable()
      .shape({
         id: yup.string(),
         name: yup.string(),
      })
      .required("Please select a field of study"),
   fieldOfStudyNotMandatory: yup.object().nullable().shape({
      id: yup.string(),
      name: yup.string(),
   }),
   levelOfStudy: yup
      .object()
      .nullable()
      .shape({
         id: yup.string(),
         name: yup.string(),
      })
      .required("Please select a level of study"),
   linkedinUrl: yup.string().matches(URL_REGEX, "Please enter a valid URL"),
   position: yup.string().max(50, "Cannot be longer than 50 characters"),
   avatar: yup.string(),
}

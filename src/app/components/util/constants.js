import {MenuItem, Select} from "@material-ui/core";
import React from "react";

export const speakerPlaceholder = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2Fplaceholder.png?alt=media"
export const GENERAL_ERROR = "Something went wrong."
// increased max domain name length from 5 to 9 since
// propulsion academy has a long domain name for their privacy policy.
// Maybe other websites do to?
export const URL_REGEX = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,9}(:[0-9]{1,5})?(\/.*)?$/gm;

// Stream form Constants
export const SAVE_WITH_NO_VALIDATION = "SAVE_WITH_NO_VALIDATION"
export const SUBMIT_FOR_APPROVAL = "SUBMIT_FOR_APPROVAL"

export const LONG_NUMBER = 9999999

const universityCountries = [
    {code: "CH", name: "Switzerland"},
    {code: "AT", name: "Austria"},
    {code: "US", name: "United States"},
    {code: "DE", name: "Germany"},
    {code: "ES", name: "Spain"},
    {code: "FI", name: "Finland"},
    {code: "FR", name: "France"},
    {code: "GB", name: "United Kingdom"},
    {code: "IT", name: "Italy"},
    {code: "NL", name: "Netherlands"},
    {code: "NO", name: "Norway"},
    {code: "SE", name: "Sweden"},
]
export const universityCountriesMap = {
    CH: "Switzerland",
    AT: "Austria",
    US: "United States",
    DE: "Germany",
    ES: "Spain",
    FI: "Finland",
    FR: "France",
    GB: "United Kingdom",
    IT: "Italy",
    NL: "Netherlands",
    NO: "Norway",
    SE: "Sweden",
    OTHER: "",
    other: ""
}


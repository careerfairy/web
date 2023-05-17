import { DropdownItem } from "../components/views/common/GenericDropdown"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"

export const maxQuestionLength = 170
export const minQuestionLength = 10
export const maxCountriesOfInterestToShow = 10
export const linkedInRegex = new RegExp(
   "^(http(s)?:\\/\\/)?([\\w]+\\.)?linkedin\\.com\\/(pub|in|profile)\\/[\\w]"
)

export const videoUrlRegex: RegExp =
   /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|twitch\.tv|firebasestorage\.googleapis\.com|localhost)(:\d{1,5})?\/.*$/

export const possibleGenders = [
   {
      id: "male-gender-selector",
      value: "male",
      label: "Male",
   },
   {
      id: "female-gender-selector",
      value: "female",
      label: "Female",
   },
   {
      id: "other-gender-selector",
      value: "other",
      label: "Other",
   },
   {
      id: "no-reveal-gender-selector",
      value: "noReveal",
      label: "Would rather not say",
   },
] as DropdownItem[]

export const regionGroupId = "Regions"
export const countryGroupId = "Country"

export const countriesOptionCodes = [
   {
      id: "AF",
      name: "Afghanistan",
      groupId: countryGroupId,
   },
   {
      id: "AL",
      name: "Albania",
      groupId: countryGroupId,
   },
   {
      id: "DZ",
      name: "Algeria",
      groupId: countryGroupId,
   },
   {
      id: "AS",
      name: "American Samoa",
      groupId: countryGroupId,
   },
   {
      id: "AD",
      name: "Andorra",
      groupId: countryGroupId,
   },
   {
      id: "AO",
      name: "Angola",
      groupId: countryGroupId,
   },
   {
      id: "AI",
      name: "Anguilla",
      groupId: countryGroupId,
   },
   {
      id: "AQ",
      name: "Antarctica",
      groupId: countryGroupId,
   },
   {
      id: "AG",
      name: "Antigua and Barbuda",
      groupId: countryGroupId,
   },
   {
      id: "AR",
      name: "Argentina",
      groupId: countryGroupId,
   },
   {
      id: "AM",
      name: "Armenia",
      groupId: countryGroupId,
   },
   {
      id: "AW",
      name: "Aruba",
      groupId: countryGroupId,
   },
   {
      id: "AU",
      name: "Australia",
      groupId: countryGroupId,
   },
   {
      id: "AT",
      name: "Austria",
      groupId: countryGroupId,
   },
   {
      id: "AZ",
      name: "Azerbaijan",
      groupId: countryGroupId,
   },
   {
      id: "BS",
      name: "Bahamas",
      groupId: countryGroupId,
   },
   {
      id: "BH",
      name: "Bahrain",
      groupId: countryGroupId,
   },
   {
      id: "BD",
      name: "Bangladesh",
      groupId: countryGroupId,
   },
   {
      id: "BB",
      name: "Barbados",
      groupId: countryGroupId,
   },
   {
      id: "BY",
      name: "Belarus",
      groupId: countryGroupId,
   },
   {
      id: "BE",
      name: "Belgium",
      groupId: countryGroupId,
   },
   {
      id: "BZ",
      name: "Belize",
      groupId: countryGroupId,
   },
   {
      id: "BJ",
      name: "Benin",
      groupId: countryGroupId,
   },
   {
      id: "BM",
      name: "Bermuda",
      groupId: countryGroupId,
   },
   {
      id: "BT",
      name: "Bhutan",
      groupId: countryGroupId,
   },
   {
      id: "BO",
      name: "Bolivia",
      groupId: countryGroupId,
   },
   {
      id: "BQ",
      name: "Bonaire, Sint Eustatius and Saba",
      groupId: countryGroupId,
   },
   {
      id: "BA",
      name: "Bosnia and Herzegovina",
      groupId: countryGroupId,
   },
   {
      id: "BW",
      name: "Botswana",
      groupId: countryGroupId,
   },
   {
      id: "BV",
      name: "Bouvet Island",
      groupId: countryGroupId,
   },
   {
      id: "BR",
      name: "Brazil",
      groupId: countryGroupId,
   },
   {
      id: "IO",
      name: "British Indian Ocean Territory",
      groupId: countryGroupId,
   },
   {
      id: "BN",
      name: "Brunei Darussalam",
      groupId: countryGroupId,
   },
   {
      id: "BG",
      name: "Bulgaria",
      groupId: countryGroupId,
   },
   {
      id: "BF",
      name: "Burkina Faso",
      groupId: countryGroupId,
   },
   {
      id: "BI",
      name: "Burundi",
      groupId: countryGroupId,
   },
   {
      id: "CV",
      name: "Cabo Verde",
      groupId: countryGroupId,
   },
   {
      id: "KH",
      name: "Cambodia",
      groupId: countryGroupId,
   },
   {
      id: "CM",
      name: "Cameroon",
      groupId: countryGroupId,
   },
   {
      id: "CA",
      name: "Canada",
      groupId: countryGroupId,
   },
   {
      id: "KY",
      name: "Cayman Islands",
      groupId: countryGroupId,
   },
   {
      id: "CF",
      name: "Central African Republic",
      groupId: countryGroupId,
   },
   {
      id: "TD",
      name: "Chad",
      groupId: countryGroupId,
   },
   {
      id: "CL",
      name: "Chile",
      groupId: countryGroupId,
   },
   {
      id: "CN",
      name: "China",
      groupId: countryGroupId,
   },
   {
      id: "CX",
      name: "Christmas Island",
      groupId: countryGroupId,
   },
   {
      id: "CC",
      name: "Cocos Islands",
      groupId: countryGroupId,
   },
   {
      id: "CO",
      name: "Colombia",
      groupId: countryGroupId,
   },
   {
      id: "KM",
      name: "Comoros",
      groupId: countryGroupId,
   },
   {
      id: "CD",
      name: "Congo",
      groupId: countryGroupId,
   },
   {
      id: "CG",
      name: "Congo",
      groupId: countryGroupId,
   },
   {
      id: "CK",
      name: "Cook Islands",
      groupId: countryGroupId,
   },
   {
      id: "CR",
      name: "Costa Rica",
      groupId: countryGroupId,
   },
   {
      id: "HR",
      name: "Croatia",
      groupId: countryGroupId,
   },
   {
      id: "CU",
      name: "Cuba",
      groupId: countryGroupId,
   },
   {
      id: "CW",
      name: "Curaçao",
      groupId: countryGroupId,
   },
   {
      id: "CY",
      name: "Cyprus",
      groupId: countryGroupId,
   },
   {
      id: "CZ",
      name: "Czechia",
      groupId: countryGroupId,
   },
   {
      id: "CI",
      name: "Côte d'Ivoire",
      groupId: countryGroupId,
   },
   {
      id: "DK",
      name: "Denmark",
      groupId: countryGroupId,
   },
   {
      id: "DJ",
      name: "Djibouti",
      groupId: countryGroupId,
   },
   {
      id: "DM",
      name: "Dominica",
      groupId: countryGroupId,
   },
   {
      id: "DO",
      name: "Dominican Republic",
      groupId: countryGroupId,
   },
   {
      id: "EC",
      name: "Ecuador",
      groupId: countryGroupId,
   },
   {
      id: "EG",
      name: "Egypt",
      groupId: countryGroupId,
   },
   {
      id: "SV",
      name: "El Salvador",
      groupId: countryGroupId,
   },
   {
      id: "GQ",
      name: "Equatorial Guinea",
      groupId: countryGroupId,
   },
   {
      id: "ER",
      name: "Eritrea",
      groupId: countryGroupId,
   },
   {
      id: "EE",
      name: "Estonia",
      groupId: countryGroupId,
   },
   {
      id: "SZ",
      name: "Eswatini",
      groupId: countryGroupId,
   },
   {
      id: "ET",
      name: "Ethiopia",
      groupId: countryGroupId,
   },
   {
      id: "FK",
      name: "Falkland Islands [Malvinas]",
      groupId: countryGroupId,
   },
   {
      id: "FO",
      name: "Faroe Islands",
      groupId: countryGroupId,
   },
   {
      id: "FJ",
      name: "Fiji",
      groupId: countryGroupId,
   },
   {
      id: "FI",
      name: "Finland",
      groupId: countryGroupId,
   },
   {
      id: "FR",
      name: "France",
      groupId: countryGroupId,
   },
   {
      id: "GF",
      name: "French Guiana",
      groupId: countryGroupId,
   },
   {
      id: "PF",
      name: "French Polynesia",
      groupId: countryGroupId,
   },
   {
      id: "TF",
      name: "French Southern Territories",
      groupId: countryGroupId,
   },
   {
      id: "GA",
      name: "Gabon",
      groupId: countryGroupId,
   },
   {
      id: "GM",
      name: "Gambia",
      groupId: countryGroupId,
   },
   {
      id: "GE",
      name: "Georgia",
      groupId: countryGroupId,
   },
   {
      id: "DE",
      name: "Germany",
      groupId: countryGroupId,
   },
   {
      id: "GH",
      name: "Ghana",
      groupId: countryGroupId,
   },
   {
      id: "GI",
      name: "Gibraltar",
      groupId: countryGroupId,
   },
   {
      id: "GR",
      name: "Greece",
      groupId: countryGroupId,
   },
   {
      id: "GL",
      name: "Greenland",
      groupId: countryGroupId,
   },
   {
      id: "GD",
      name: "Grenada",
      groupId: countryGroupId,
   },
   {
      id: "GP",
      name: "Guadeloupe",
      groupId: countryGroupId,
   },
   {
      id: "GU",
      name: "Guam",
      groupId: countryGroupId,
   },
   {
      id: "GT",
      name: "Guatemala",
      groupId: countryGroupId,
   },
   {
      id: "GG",
      name: "Guernsey",
      groupId: countryGroupId,
   },
   {
      id: "GN",
      name: "Guinea",
      groupId: countryGroupId,
   },
   {
      id: "GW",
      name: "Guinea-Bissau",
      groupId: countryGroupId,
   },
   {
      id: "GY",
      name: "Guyana",
      groupId: countryGroupId,
   },
   {
      id: "HT",
      name: "Haiti",
      groupId: countryGroupId,
   },
   {
      id: "HM",
      name: "Heard Island and McDonald Islands",
      groupId: countryGroupId,
   },
   {
      id: "VA",
      name: "Holy See",
      groupId: countryGroupId,
   },
   {
      id: "HN",
      name: "Honduras",
      groupId: countryGroupId,
   },
   {
      id: "HK",
      name: "Hong Kong",
      groupId: countryGroupId,
   },
   {
      id: "HU",
      name: "Hungary",
      groupId: countryGroupId,
   },
   {
      id: "IS",
      name: "Iceland",
      groupId: countryGroupId,
   },
   {
      id: "IN",
      name: "India",
      groupId: countryGroupId,
   },
   {
      id: "ID",
      name: "Indonesia",
      groupId: countryGroupId,
   },
   {
      id: "IR",
      name: "Iran",
      groupId: countryGroupId,
   },
   {
      id: "IQ",
      name: "Iraq",
      groupId: countryGroupId,
   },
   {
      id: "IE",
      name: "Ireland",
      groupId: countryGroupId,
   },
   {
      id: "IM",
      name: "Isle of Man",
      groupId: countryGroupId,
   },
   {
      id: "IL",
      name: "Israel",
      groupId: countryGroupId,
   },
   {
      id: "IT",
      name: "Italy",
      groupId: countryGroupId,
   },
   {
      id: "JM",
      name: "Jamaica",
      groupId: countryGroupId,
   },
   {
      id: "JP",
      name: "Japan",
      groupId: countryGroupId,
   },
   {
      id: "JE",
      name: "Jersey",
      groupId: countryGroupId,
   },
   {
      id: "JO",
      name: "Jordan",
      groupId: countryGroupId,
   },
   {
      id: "KZ",
      name: "Kazakhstan",
      groupId: countryGroupId,
   },
   {
      id: "KE",
      name: "Kenya",
      groupId: countryGroupId,
   },
   {
      id: "KI",
      name: "Kiribati",
      groupId: countryGroupId,
   },
   {
      id: "KP",
      name: "Korea (the Democratic People's Republic of)",
      groupId: countryGroupId,
   },
   {
      id: "KR",
      name: "Korea (the Republic of)",
      groupId: countryGroupId,
   },
   {
      id: "KW",
      name: "Kuwait",
      groupId: countryGroupId,
   },
   {
      id: "KG",
      name: "Kyrgyzstan",
      groupId: countryGroupId,
   },
   {
      id: "LA",
      name: "Lao People's Democratic Republic",
      groupId: countryGroupId,
   },
   {
      id: "LV",
      name: "Latvia",
      groupId: countryGroupId,
   },
   {
      id: "LB",
      name: "Lebanon",
      groupId: countryGroupId,
   },
   {
      id: "LS",
      name: "Lesotho",
      groupId: countryGroupId,
   },
   {
      id: "LR",
      name: "Liberia",
      groupId: countryGroupId,
   },
   {
      id: "LY",
      name: "Libya",
      groupId: countryGroupId,
   },
   {
      id: "LI",
      name: "Liechtenstein",
      groupId: countryGroupId,
   },
   {
      id: "LT",
      name: "Lithuania",
      groupId: countryGroupId,
   },
   {
      id: "LU",
      name: "Luxembourg",
      groupId: countryGroupId,
   },
   {
      id: "MO",
      name: "Macao",
      groupId: countryGroupId,
   },
   {
      id: "MG",
      name: "Madagascar",
      groupId: countryGroupId,
   },
   {
      id: "MW",
      name: "Malawi",
      groupId: countryGroupId,
   },
   {
      id: "MY",
      name: "Malaysia",
      groupId: countryGroupId,
   },
   {
      id: "MV",
      name: "Maldives",
      groupId: countryGroupId,
   },
   {
      id: "ML",
      name: "Mali",
      groupId: countryGroupId,
   },
   {
      id: "MT",
      name: "Malta",
      groupId: countryGroupId,
   },
   {
      id: "MH",
      name: "Marshall Islands",
      groupId: countryGroupId,
   },
   {
      id: "MQ",
      name: "Martinique",
      groupId: countryGroupId,
   },
   {
      id: "MR",
      name: "Mauritania",
      groupId: countryGroupId,
   },
   {
      id: "MU",
      name: "Mauritius",
      groupId: countryGroupId,
   },
   {
      id: "YT",
      name: "Mayotte",
      groupId: countryGroupId,
   },
   {
      id: "MX",
      name: "Mexico",
      groupId: countryGroupId,
   },
   {
      id: "FM",
      name: "Micronesia ",
      groupId: countryGroupId,
   },
   {
      id: "MD",
      name: "Moldova",
      groupId: countryGroupId,
   },
   {
      id: "MC",
      name: "Monaco",
      groupId: countryGroupId,
   },
   {
      id: "MN",
      name: "Mongolia",
      groupId: countryGroupId,
   },
   {
      id: "ME",
      name: "Montenegro",
      groupId: countryGroupId,
   },
   {
      id: "MS",
      name: "Montserrat",
      groupId: countryGroupId,
   },
   {
      id: "MA",
      name: "Morocco",
      groupId: countryGroupId,
   },
   {
      id: "MZ",
      name: "Mozambique",
      groupId: countryGroupId,
   },
   {
      id: "MM",
      name: "Myanmar",
      groupId: countryGroupId,
   },
   {
      id: "NA",
      name: "Namibia",
      groupId: countryGroupId,
   },
   {
      id: "NR",
      name: "Nauru",
      groupId: countryGroupId,
   },
   {
      id: "NP",
      name: "Nepal",
      groupId: countryGroupId,
   },
   {
      id: "NL",
      name: "Netherlands",
      groupId: countryGroupId,
   },
   {
      id: "NC",
      name: "New Caledonia",
      groupId: countryGroupId,
   },
   {
      id: "NZ",
      name: "New Zealand",
      groupId: countryGroupId,
   },
   {
      id: "NI",
      name: "Nicaragua",
      groupId: countryGroupId,
   },
   {
      id: "NE",
      name: "Niger",
      groupId: countryGroupId,
   },
   {
      id: "NG",
      name: "Nigeria",
      groupId: countryGroupId,
   },
   {
      id: "NU",
      name: "Niue",
      groupId: countryGroupId,
   },
   {
      id: "NF",
      name: "Norfolk Island",
      groupId: countryGroupId,
   },
   {
      id: "MP",
      name: "Northern Mariana Islands",
      groupId: countryGroupId,
   },
   {
      id: "NO",
      name: "Norway",
      groupId: countryGroupId,
   },
   {
      id: "OM",
      name: "Oman",
      groupId: countryGroupId,
   },
   {
      id: "PK",
      name: "Pakistan",
      groupId: countryGroupId,
   },
   {
      id: "PW",
      name: "Palau",
      groupId: countryGroupId,
   },
   {
      id: "PS",
      name: "Palestine, State of",
      groupId: countryGroupId,
   },
   {
      id: "PA",
      name: "Panama",
      groupId: countryGroupId,
   },
   {
      id: "PG",
      name: "Papua New Guinea",
      groupId: countryGroupId,
   },
   {
      id: "PY",
      name: "Paraguay",
      groupId: countryGroupId,
   },
   {
      id: "PE",
      name: "Peru",
      groupId: countryGroupId,
   },
   {
      id: "PH",
      name: "Philippines",
      groupId: countryGroupId,
   },
   {
      id: "PN",
      name: "Pitcairn",
      groupId: countryGroupId,
   },
   {
      id: "PL",
      name: "Poland",
      groupId: countryGroupId,
   },
   {
      id: "PT",
      name: "Portugal",
      groupId: countryGroupId,
   },
   {
      id: "PR",
      name: "Puerto Rico",
      groupId: countryGroupId,
   },
   {
      id: "QA",
      name: "Qatar",
      groupId: countryGroupId,
   },
   {
      id: "MK",
      name: "Republic of North Macedonia",
      groupId: countryGroupId,
   },
   {
      id: "RO",
      name: "Romania",
      groupId: countryGroupId,
   },
   {
      id: "RU",
      name: "Russian Federation",
      groupId: countryGroupId,
   },
   {
      id: "RW",
      name: "Rwanda",
      groupId: countryGroupId,
   },
   {
      id: "RE",
      name: "Réunion",
      groupId: countryGroupId,
   },
   {
      id: "BL",
      name: "Saint Barthélemy",
      groupId: countryGroupId,
   },
   {
      id: "SH",
      name: "Saint Helena",
      groupId: countryGroupId,
   },
   {
      id: "KN",
      name: "Saint Kitts and Nevis",
      groupId: countryGroupId,
   },
   {
      id: "LC",
      name: "Saint Lucia",
      groupId: countryGroupId,
   },
   {
      id: "MF",
      name: "Saint Martin (French part)",
      groupId: countryGroupId,
   },
   {
      id: "PM",
      name: "Saint Pierre and Miquelon",
      groupId: countryGroupId,
   },
   {
      id: "VC",
      name: "Saint Vincent and the Grenadines",
      groupId: countryGroupId,
   },
   {
      id: "WS",
      name: "Samoa",
      groupId: countryGroupId,
   },
   {
      id: "SM",
      name: "San Marino",
      groupId: countryGroupId,
   },
   {
      id: "ST",
      name: "Sao Tome and Principe",
      groupId: countryGroupId,
   },
   {
      id: "SA",
      name: "Saudi Arabia",
      groupId: countryGroupId,
   },
   {
      id: "SN",
      name: "Senegal",
      groupId: countryGroupId,
   },
   {
      id: "RS",
      name: "Serbia",
      groupId: countryGroupId,
   },
   {
      id: "SC",
      name: "Seychelles",
      groupId: countryGroupId,
   },
   {
      id: "SL",
      name: "Sierra Leone",
      groupId: countryGroupId,
   },
   {
      id: "SG",
      name: "Singapore",
      groupId: countryGroupId,
   },
   {
      id: "SX",
      name: "Sint Maarten",
      groupId: countryGroupId,
   },
   {
      id: "SK",
      name: "Slovakia",
      groupId: countryGroupId,
   },
   {
      id: "SI",
      name: "Slovenia",
      groupId: countryGroupId,
   },
   {
      id: "SB",
      name: "Solomon Islands",
      groupId: countryGroupId,
   },
   {
      id: "SO",
      name: "Somalia",
      groupId: countryGroupId,
   },
   {
      id: "ZA",
      name: "South Africa",
      groupId: countryGroupId,
   },
   {
      id: "GS",
      name: "South Georgia and the South Sandwich Islands",
      groupId: countryGroupId,
   },
   {
      id: "SS",
      name: "South Sudan",
      groupId: countryGroupId,
   },
   {
      id: "ES",
      name: "Spain",
      groupId: countryGroupId,
   },
   {
      id: "LK",
      name: "Sri Lanka",
      groupId: countryGroupId,
   },
   {
      id: "SD",
      name: "Sudan",
      groupId: countryGroupId,
   },
   {
      id: "SR",
      name: "Suriname",
      groupId: countryGroupId,
   },
   {
      id: "SJ",
      name: "Svalbard and Jan Mayen",
      groupId: countryGroupId,
   },
   {
      id: "SE",
      name: "Sweden",
      groupId: countryGroupId,
   },
   {
      id: "CH",
      name: "Switzerland",
      groupId: countryGroupId,
   },
   {
      id: "SY",
      name: "Syrian Arab Republic",
      groupId: countryGroupId,
   },
   {
      id: "TW",
      name: "Taiwan",
      groupId: countryGroupId,
   },
   {
      id: "TJ",
      name: "Tajikistan",
      groupId: countryGroupId,
   },
   {
      id: "TZ",
      name: "Tanzania, United Republic of",
      groupId: countryGroupId,
   },
   {
      id: "TH",
      name: "Thailand",
      groupId: countryGroupId,
   },
   {
      id: "TL",
      name: "Timor-Leste",
      groupId: countryGroupId,
   },
   {
      id: "TG",
      name: "Togo",
      groupId: countryGroupId,
   },
   {
      id: "TK",
      name: "Tokelau",
      groupId: countryGroupId,
   },
   {
      id: "TO",
      name: "Tonga",
      groupId: countryGroupId,
   },
   {
      id: "TT",
      name: "Trinidad and Tobago",
      groupId: countryGroupId,
   },
   {
      id: "TN",
      name: "Tunisia",
      groupId: countryGroupId,
   },
   {
      id: "TR",
      name: "Turkey",
      groupId: countryGroupId,
   },
   {
      id: "TM",
      name: "Turkmenistan",
      groupId: countryGroupId,
   },
   {
      id: "TC",
      name: "Turks and Caicos Islands",
      groupId: countryGroupId,
   },
   {
      id: "TV",
      name: "Tuvalu",
      groupId: countryGroupId,
   },
   {
      id: "UG",
      name: "Uganda",
      groupId: countryGroupId,
   },
   {
      id: "UA",
      name: "Ukraine",
      groupId: countryGroupId,
   },
   {
      id: "AE",
      name: "United Arab Emirates",
      groupId: countryGroupId,
   },
   {
      id: "GB",
      name: "United Kingdom",
      groupId: countryGroupId,
   },
   {
      id: "US",
      name: "United States of America",
      groupId: countryGroupId,
   },
   {
      id: "UY",
      name: "Uruguay",
      groupId: countryGroupId,
   },
   {
      id: "UZ",
      name: "Uzbekistan",
      groupId: countryGroupId,
   },
   {
      id: "VU",
      name: "Vanuatu",
      groupId: countryGroupId,
   },
   {
      id: "VE",
      name: "Venezuela",
      groupId: countryGroupId,
   },
   {
      id: "VN",
      name: "Viet Nam",
      groupId: countryGroupId,
   },
   {
      id: "VG",
      name: "Virgin Islands (British)",
      groupId: countryGroupId,
   },
   {
      id: "VI",
      name: "Virgin Islands (U.S.)",
      groupId: countryGroupId,
   },
   {
      id: "WF",
      name: "Wallis and Futuna",
      groupId: countryGroupId,
   },
   {
      id: "EH",
      name: "Western Sahara",
      groupId: countryGroupId,
   },
   {
      id: "YE",
      name: "Yemen",
      groupId: countryGroupId,
   },
   {
      id: "ZM",
      name: "Zambia",
      groupId: countryGroupId,
   },
   {
      id: "ZW",
      name: "Zimbabwe",
      groupId: countryGroupId,
   },
   {
      id: "AX",
      name: "Åland Islands",
      groupId: countryGroupId,
   },
]

export const countriesAndRegionsOptionCodes: OptionGroup[] = [
   {
      id: "africa",
      name: "Africa",
      groupId: regionGroupId,
   },
   {
      id: "asia",
      name: "Asia",
      groupId: regionGroupId,
   },
   {
      id: "caribbean",
      name: "Caribbean",
      groupId: regionGroupId,
   },
   {
      id: "centralAmerica",
      name: "Central America",
      groupId: regionGroupId,
   },
   {
      id: "europe",
      name: "Europe",
      groupId: regionGroupId,
   },
   {
      id: "northAmerica",
      name: "North America",
      groupId: regionGroupId,
   },
   {
      id: "oceania",
      name: "Oceania",
      groupId: regionGroupId,
   },
   {
      id: "southAmerica",
      name: "South America",
      groupId: regionGroupId,
   },
   ...countriesOptionCodes,
]

export const languageOptionCodes: OptionGroup[] = [
   {
      id: "nl",
      name: "Dutch",
   },
   {
      id: "en",
      name: "English",
   },
   {
      id: "fr",
      name: "French",
   },
   {
      id: "de",
      name: "German",
   },
   {
      id: "it",
      name: "Italian",
   },
   {
      id: "es",
      name: "Spanish",
   },
]

export const channelOptionCodes: OptionGroup[] = [
   {
      id: "facebook",
      name: "Facebook",
   },
   {
      id: "instagram",
      name: "Instagram",
   },
   {
      id: "tikTok",
      name: "Tik Tok",
   },
]

export const CompanySizesCodes: DropdownItem[] = [
   {
      id: "1-20",
      value: "1-20",
      label: "1-20 employees",
   },
   {
      id: "21-100",
      value: "21-100",
      label: "21-100 employees",
   },
   {
      id: "101-1000",
      value: "101-1000",
      label: "101-1000 employees",
   },
   {
      id: "1001+",
      value: "1001+",
      label: "1001+ employees",
   },
]

export const CompanyIndustryValues: OptionGroup[] = [
   {
      id: "Accounting",
      name: "Accounting",
   },
   {
      id: "Aerospace&Defence",
      name: "Aerospace & Defence",
   },
   {
      id: "Agriculture",
      name: "Agriculture",
   },
   {
      id: "Architecture&Planning",
      name: "Architecture & Planning",
   },
   {
      id: "Arts&Culture",
      name: "Arts & Culture",
   },
   {
      id: "Automotive",
      name: "Automotive",
   },
   {
      id: "Chemical",
      name: "Chemical",
   },
   {
      id: "Construction",
      name: "Construction",
   },
   {
      id: "Design",
      name: "Design",
   },
   {
      id: "Education",
      name: "Education",
   },
   {
      id: "Energy",
      name: "Energy",
   },
   {
      id: "Engineering",
      name: "Engineering",
   },
   {
      id: "Entertainment",
      name: "Entertainment",
   },
   {
      id: "Finance&Banking",
      name: "Finance & Banking",
   },
   {
      id: "FMCG",
      name: "FMCG",
   },
   {
      id: "Healthcare",
      name: "Healthcare",
   },
   {
      id: "Hospitality",
      name: "Hospitality",
   },
   {
      id: "Insurance",
      name: "Insurance",
   },
   {
      id: "Legal",
      name: "Legal",
   },
   {
      id: "Leisure,Travel&Tourism",
      name: "Leisure, Travel & Tourism",
   },
   {
      id: "Logistics",
      name: "Logistics",
   },
   {
      id: "ManagementConsulting",
      name: "Management Consulting",
   },
   {
      id: "Manufacturing",
      name: "Manufacturing",
   },
   {
      id: "Marketing&Communication",
      name: "Marketing & Communication",
   },
   {
      id: "Media",
      name: "Media",
   },
   {
      id: "Non-profit&Charity",
      name: "Non-profit & Charity",
   },
   {
      id: "Other",
      name: "Other",
   },
   {
      id: "Pharmaceutical",
      name: "Pharmaceutical",
   },
   {
      id: "PublicSector",
      name: "Public Sector",
   },
   {
      id: "RealEstate",
      name: "Real Estate",
   },
   {
      id: "Retail",
      name: "Retail",
   },
   {
      id: "Technology&IT",
      name: "Technology & IT",
   },
   {
      id: "Telecommunications",
      name: "Telecommunications",
   },
   {
      id: "VentureCapital&PrivateEquity",
      name: "Venture Capital & Private Equity",
   },
]

export const RelevantCompanyIndustryValues: OptionGroup[] = [
   {
      id: "Automotive",
      name: "Automotive",
   },
   {
      id: "Chemical",
      name: "Chemical",
   },
   {
      id: "Energy",
      name: "Energy",
   },
   {
      id: "Engineering",
      name: "Engineering",
   },
   {
      id: "Finance&Banking",
      name: "Finance & Banking",
   },
   {
      id: "FMCG",
      name: "FMCG",
   },
   {
      id: "Insurance",
      name: "Insurance",
   },
   {
      id: "ManagementConsulting",
      name: "Management Consulting",
   },
   {
      id: "Pharmaceutical",
      name: "Pharmaceutical",
   },
   {
      id: "PublicSector",
      name: "Public Sector",
   },
   {
      id: "Retail",
      name: "Retail",
   },
   {
      id: "Technology&IT",
      name: "Technology & IT",
   },
]

export const RelevantCompanyCountryValues: OptionGroup[] = [
   {
      id: "AT",
      name: "Austria",
   },
   {
      id: "FR",
      name: "France",
   },
   {
      id: "DE",
      name: "Germany",
   },
   {
      id: "NL",
      name: "Netherlands",
   },
   {
      id: "ES",
      name: "Spain",
   },
   {
      id: "CH",
      name: "Switzerland",
   },
   {
      id: "GB",
      name: "United Kingdom",
   },
   {
      id: "US",
      name: "United States of America",
   },
]

export const CompanyCountryValues: OptionGroup[] = countriesOptionCodes.map(
   (country) => ({
      id: country.id,
      name: country.name,
   })
)

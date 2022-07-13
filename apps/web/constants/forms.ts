export const maxQuestionLength = 170
export const minQuestionLength = 10
export const linkedInRegex = new RegExp(
   "^(http(s)?:\\/\\/)?([\\w]+\\.)?linkedin\\.com\\/(pub|in|profile)\\/[\\w]"
)

export type Option = {
   id: string
   name: string
   groupId?: string
}

export const countriesAndRegionsOptionCodes = [
   {
      id: "africa",
      name: "Africa",
      groupId: "Regions",
   },
   {
      id: "asia",
      name: "Asia",
      groupId: "Regions",
   },
   {
      id: "caribbean",
      name: "Caribbean",
      groupId: "Regions",
   },
   {
      id: "centralAmerica",
      name: "Central America",
      groupId: "Regions",
   },
   {
      id: "europe",
      name: "Europe",
      groupId: "Regions",
   },
   {
      id: "northAmerica",
      name: "North America",
      groupId: "Regions",
   },
   {
      id: "oceania",
      name: "Oceania",
      groupId: "Regions",
   },
   {
      id: "southAmerica",
      name: "South America",
      groupId: "Regions",
   },
   {
      id: "AF",
      name: "Afghanistan",
      groupId: "Countries",
   },
   {
      id: "AL",
      name: "Albania",
      groupId: "Countries",
   },
   {
      id: "DZ",
      name: "Algeria",
      groupId: "Countries",
   },
   {
      id: "AS",
      name: "American Samoa",
      groupId: "Countries",
   },
   {
      id: "AD",
      name: "Andorra",
      groupId: "Countries",
   },
   {
      id: "AO",
      name: "Angola",
      groupId: "Countries",
   },
   {
      id: "AI",
      name: "Anguilla",
      groupId: "Countries",
   },
   {
      id: "AQ",
      name: "Antarctica",
      groupId: "Countries",
   },
   {
      id: "AG",
      name: "Antigua and Barbuda",
      groupId: "Countries",
   },
   {
      id: "AR",
      name: "Argentina",
      groupId: "Countries",
   },
   {
      id: "AM",
      name: "Armenia",
      groupId: "Countries",
   },
   {
      id: "AW",
      name: "Aruba",
      groupId: "Countries",
   },
   {
      id: "AU",
      name: "Australia",
      groupId: "Countries",
   },
   {
      id: "AT",
      name: "Austria",
      groupId: "Countries",
   },
   {
      id: "AZ",
      name: "Azerbaijan",
      groupId: "Countries",
   },
   {
      id: "BS",
      name: "Bahamas",
      groupId: "Countries",
   },
   {
      id: "BH",
      name: "Bahrain",
      groupId: "Countries",
   },
   {
      id: "BD",
      name: "Bangladesh",
      groupId: "Countries",
   },
   {
      id: "BB",
      name: "Barbados",
      groupId: "Countries",
   },
   {
      id: "BY",
      name: "Belarus",
      groupId: "Countries",
   },
   {
      id: "BE",
      name: "Belgium",
      groupId: "Countries",
   },
   {
      id: "BZ",
      name: "Belize",
      groupId: "Countries",
   },
   {
      id: "BJ",
      name: "Benin",
      groupId: "Countries",
   },
   {
      id: "BM",
      name: "Bermuda",
      groupId: "Countries",
   },
   {
      id: "BT",
      name: "Bhutan",
      groupId: "Countries",
   },
   {
      id: "BO",
      name: "Bolivia",
      groupId: "Countries",
   },
   {
      id: "BQ",
      name: "Bonaire, Sint Eustatius and Saba",
      groupId: "Countries",
   },
   {
      id: "BA",
      name: "Bosnia and Herzegovina",
      groupId: "Countries",
   },
   {
      id: "BW",
      name: "Botswana",
      groupId: "Countries",
   },
   {
      id: "BV",
      name: "Bouvet Island",
      groupId: "Countries",
   },
   {
      id: "BR",
      name: "Brazil",
      groupId: "Countries",
   },
   {
      id: "IO",
      name: "British Indian Ocean Territory",
      groupId: "Countries",
   },
   {
      id: "BN",
      name: "Brunei Darussalam",
      groupId: "Countries",
   },
   {
      id: "BG",
      name: "Bulgaria",
      groupId: "Countries",
   },
   {
      id: "BF",
      name: "Burkina Faso",
      groupId: "Countries",
   },
   {
      id: "BI",
      name: "Burundi",
      groupId: "Countries",
   },
   {
      id: "CV",
      name: "Cabo Verde",
      groupId: "Countries",
   },
   {
      id: "KH",
      name: "Cambodia",
      groupId: "Countries",
   },
   {
      id: "CM",
      name: "Cameroon",
      groupId: "Countries",
   },
   {
      id: "CA",
      name: "Canada",
      groupId: "Countries",
   },
   {
      id: "KY",
      name: "Cayman Islands",
      groupId: "Countries",
   },
   {
      id: "CF",
      name: "Central African Republic",
      groupId: "Countries",
   },
   {
      id: "TD",
      name: "Chad",
      groupId: "Countries",
   },
   {
      id: "CL",
      name: "Chile",
      groupId: "Countries",
   },
   {
      id: "CN",
      name: "China",
      groupId: "Countries",
   },
   {
      id: "CX",
      name: "Christmas Island",
      groupId: "Countries",
   },
   {
      id: "CC",
      name: "Cocos Islands",
      groupId: "Countries",
   },
   {
      id: "CO",
      name: "Colombia",
      groupId: "Countries",
   },
   {
      id: "KM",
      name: "Comoros",
      groupId: "Countries",
   },
   {
      id: "CD",
      name: "Congo",
      groupId: "Countries",
   },
   {
      id: "CG",
      name: "Congo",
      groupId: "Countries",
   },
   {
      id: "CK",
      name: "Cook Islands",
      groupId: "Countries",
   },
   {
      id: "CR",
      name: "Costa Rica",
      groupId: "Countries",
   },
   {
      id: "HR",
      name: "Croatia",
      groupId: "Countries",
   },
   {
      id: "CU",
      name: "Cuba",
      groupId: "Countries",
   },
   {
      id: "CW",
      name: "Curaçao",
      groupId: "Countries",
   },
   {
      id: "CY",
      name: "Cyprus",
      groupId: "Countries",
   },
   {
      id: "CZ",
      name: "Czechia",
      groupId: "Countries",
   },
   {
      id: "CI",
      name: "Côte d'Ivoire",
      groupId: "Countries",
   },
   {
      id: "DK",
      name: "Denmark",
      groupId: "Countries",
   },
   {
      id: "DJ",
      name: "Djibouti",
      groupId: "Countries",
   },
   {
      id: "DM",
      name: "Dominica",
      groupId: "Countries",
   },
   {
      id: "DO",
      name: "Dominican Republic",
      groupId: "Countries",
   },
   {
      id: "EC",
      name: "Ecuador",
      groupId: "Countries",
   },
   {
      id: "EG",
      name: "Egypt",
      groupId: "Countries",
   },
   {
      id: "SV",
      name: "El Salvador",
      groupId: "Countries",
   },
   {
      id: "GQ",
      name: "Equatorial Guinea",
      groupId: "Countries",
   },
   {
      id: "ER",
      name: "Eritrea",
      groupId: "Countries",
   },
   {
      id: "EE",
      name: "Estonia",
      groupId: "Countries",
   },
   {
      id: "SZ",
      name: "Eswatini",
      groupId: "Countries",
   },
   {
      id: "ET",
      name: "Ethiopia",
      groupId: "Countries",
   },
   {
      id: "FK",
      name: "Falkland Islands [Malvinas]",
      groupId: "Countries",
   },
   {
      id: "FO",
      name: "Faroe Islands",
      groupId: "Countries",
   },
   {
      id: "FJ",
      name: "Fiji",
      groupId: "Countries",
   },
   {
      id: "FI",
      name: "Finland",
      groupId: "Countries",
   },
   {
      id: "FR",
      name: "France",
      groupId: "Countries",
   },
   {
      id: "GF",
      name: "French Guiana",
      groupId: "Countries",
   },
   {
      id: "PF",
      name: "French Polynesia",
      groupId: "Countries",
   },
   {
      id: "TF",
      name: "French Southern Territories",
      groupId: "Countries",
   },
   {
      id: "GA",
      name: "Gabon",
      groupId: "Countries",
   },
   {
      id: "GM",
      name: "Gambia",
      groupId: "Countries",
   },
   {
      id: "GE",
      name: "Georgia",
      groupId: "Countries",
   },
   {
      id: "DE",
      name: "Germany",
      groupId: "Countries",
   },
   {
      id: "GH",
      name: "Ghana",
      groupId: "Countries",
   },
   {
      id: "GI",
      name: "Gibraltar",
      groupId: "Countries",
   },
   {
      id: "GR",
      name: "Greece",
      groupId: "Countries",
   },
   {
      id: "GL",
      name: "Greenland",
      groupId: "Countries",
   },
   {
      id: "GD",
      name: "Grenada",
      groupId: "Countries",
   },
   {
      id: "GP",
      name: "Guadeloupe",
      groupId: "Countries",
   },
   {
      id: "GU",
      name: "Guam",
      groupId: "Countries",
   },
   {
      id: "GT",
      name: "Guatemala",
      groupId: "Countries",
   },
   {
      id: "GG",
      name: "Guernsey",
      groupId: "Countries",
   },
   {
      id: "GN",
      name: "Guinea",
      groupId: "Countries",
   },
   {
      id: "GW",
      name: "Guinea-Bissau",
      groupId: "Countries",
   },
   {
      id: "GY",
      name: "Guyana",
      groupId: "Countries",
   },
   {
      id: "HT",
      name: "Haiti",
      groupId: "Countries",
   },
   {
      id: "HM",
      name: "Heard Island and McDonald Islands",
      groupId: "Countries",
   },
   {
      id: "VA",
      name: "Holy See",
      groupId: "Countries",
   },
   {
      id: "HN",
      name: "Honduras",
      groupId: "Countries",
   },
   {
      id: "HK",
      name: "Hong Kong",
      groupId: "Countries",
   },
   {
      id: "HU",
      name: "Hungary",
      groupId: "Countries",
   },
   {
      id: "IS",
      name: "Iceland",
      groupId: "Countries",
   },
   {
      id: "IN",
      name: "India",
      groupId: "Countries",
   },
   {
      id: "ID",
      name: "Indonesia",
      groupId: "Countries",
   },
   {
      id: "IR",
      name: "Iran",
      groupId: "Countries",
   },
   {
      id: "IQ",
      name: "Iraq",
      groupId: "Countries",
   },
   {
      id: "IE",
      name: "Ireland",
      groupId: "Countries",
   },
   {
      id: "IM",
      name: "Isle of Man",
      groupId: "Countries",
   },
   {
      id: "IL",
      name: "Israel",
      groupId: "Countries",
   },
   {
      id: "IT",
      name: "Italy",
      groupId: "Countries",
   },
   {
      id: "JM",
      name: "Jamaica",
      groupId: "Countries",
   },
   {
      id: "JP",
      name: "Japan",
      groupId: "Countries",
   },
   {
      id: "JE",
      name: "Jersey",
      groupId: "Countries",
   },
   {
      id: "JO",
      name: "Jordan",
      groupId: "Countries",
   },
   {
      id: "KZ",
      name: "Kazakhstan",
      groupId: "Countries",
   },
   {
      id: "KE",
      name: "Kenya",
      groupId: "Countries",
   },
   {
      id: "KI",
      name: "Kiribati",
      groupId: "Countries",
   },
   {
      id: "KP",
      name: "Korea (the Democratic People's Republic of)",
      groupId: "Countries",
   },
   {
      id: "KR",
      name: "Korea (the Republic of)",
      groupId: "Countries",
   },
   {
      id: "KW",
      name: "Kuwait",
      groupId: "Countries",
   },
   {
      id: "KG",
      name: "Kyrgyzstan",
      groupId: "Countries",
   },
   {
      id: "LA",
      name: "Lao People's Democratic Republic",
      groupId: "Countries",
   },
   {
      id: "LV",
      name: "Latvia",
      groupId: "Countries",
   },
   {
      id: "LB",
      name: "Lebanon",
      groupId: "Countries",
   },
   {
      id: "LS",
      name: "Lesotho",
      groupId: "Countries",
   },
   {
      id: "LR",
      name: "Liberia",
      groupId: "Countries",
   },
   {
      id: "LY",
      name: "Libya",
      groupId: "Countries",
   },
   {
      id: "LI",
      name: "Liechtenstein",
      groupId: "Countries",
   },
   {
      id: "LT",
      name: "Lithuania",
      groupId: "Countries",
   },
   {
      id: "LU",
      name: "Luxembourg",
      groupId: "Countries",
   },
   {
      id: "MO",
      name: "Macao",
      groupId: "Countries",
   },
   {
      id: "MG",
      name: "Madagascar",
      groupId: "Countries",
   },
   {
      id: "MW",
      name: "Malawi",
      groupId: "Countries",
   },
   {
      id: "MY",
      name: "Malaysia",
      groupId: "Countries",
   },
   {
      id: "MV",
      name: "Maldives",
      groupId: "Countries",
   },
   {
      id: "ML",
      name: "Mali",
      groupId: "Countries",
   },
   {
      id: "MT",
      name: "Malta",
      groupId: "Countries",
   },
   {
      id: "MH",
      name: "Marshall Islands",
      groupId: "Countries",
   },
   {
      id: "MQ",
      name: "Martinique",
      groupId: "Countries",
   },
   {
      id: "MR",
      name: "Mauritania",
      groupId: "Countries",
   },
   {
      id: "MU",
      name: "Mauritius",
      groupId: "Countries",
   },
   {
      id: "YT",
      name: "Mayotte",
      groupId: "Countries",
   },
   {
      id: "MX",
      name: "Mexico",
      groupId: "Countries",
   },
   {
      id: "FM",
      name: "Micronesia ",
      groupId: "Countries",
   },
   {
      id: "MD",
      name: "Moldova",
      groupId: "Countries",
   },
   {
      id: "MC",
      name: "Monaco",
      groupId: "Countries",
   },
   {
      id: "MN",
      name: "Mongolia",
      groupId: "Countries",
   },
   {
      id: "ME",
      name: "Montenegro",
      groupId: "Countries",
   },
   {
      id: "MS",
      name: "Montserrat",
      groupId: "Countries",
   },
   {
      id: "MA",
      name: "Morocco",
      groupId: "Countries",
   },
   {
      id: "MZ",
      name: "Mozambique",
      groupId: "Countries",
   },
   {
      id: "MM",
      name: "Myanmar",
      groupId: "Countries",
   },
   {
      id: "NA",
      name: "Namibia",
      groupId: "Countries",
   },
   {
      id: "NR",
      name: "Nauru",
      groupId: "Countries",
   },
   {
      id: "NP",
      name: "Nepal",
      groupId: "Countries",
   },
   {
      id: "NL",
      name: "Netherlands",
      groupId: "Countries",
   },
   {
      id: "NC",
      name: "New Caledonia",
      groupId: "Countries",
   },
   {
      id: "NZ",
      name: "New Zealand",
      groupId: "Countries",
   },
   {
      id: "NI",
      name: "Nicaragua",
      groupId: "Countries",
   },
   {
      id: "NE",
      name: "Niger",
      groupId: "Countries",
   },
   {
      id: "NG",
      name: "Nigeria",
      groupId: "Countries",
   },
   {
      id: "NU",
      name: "Niue",
      groupId: "Countries",
   },
   {
      id: "NF",
      name: "Norfolk Island",
      groupId: "Countries",
   },
   {
      id: "MP",
      name: "Northern Mariana Islands",
      groupId: "Countries",
   },
   {
      id: "NO",
      name: "Norway",
      groupId: "Countries",
   },
   {
      id: "OM",
      name: "Oman",
      groupId: "Countries",
   },
   {
      id: "PK",
      name: "Pakistan",
      groupId: "Countries",
   },
   {
      id: "PW",
      name: "Palau",
      groupId: "Countries",
   },
   {
      id: "PS",
      name: "Palestine, State of",
      groupId: "Countries",
   },
   {
      id: "PA",
      name: "Panama",
      groupId: "Countries",
   },
   {
      id: "PG",
      name: "Papua New Guinea",
      groupId: "Countries",
   },
   {
      id: "PY",
      name: "Paraguay",
      groupId: "Countries",
   },
   {
      id: "PE",
      name: "Peru",
      groupId: "Countries",
   },
   {
      id: "PH",
      name: "Philippines",
      groupId: "Countries",
   },
   {
      id: "PN",
      name: "Pitcairn",
      groupId: "Countries",
   },
   {
      id: "PL",
      name: "Poland",
      groupId: "Countries",
   },
   {
      id: "PT",
      name: "Portugal",
      groupId: "Countries",
   },
   {
      id: "PR",
      name: "Puerto Rico",
      groupId: "Countries",
   },
   {
      id: "QA",
      name: "Qatar",
      groupId: "Countries",
   },
   {
      id: "MK",
      name: "Republic of North Macedonia",
      groupId: "Countries",
   },
   {
      id: "RO",
      name: "Romania",
      groupId: "Countries",
   },
   {
      id: "RU",
      name: "Russian Federation",
      groupId: "Countries",
   },
   {
      id: "RW",
      name: "Rwanda",
      groupId: "Countries",
   },
   {
      id: "RE",
      name: "Réunion",
      groupId: "Countries",
   },
   {
      id: "BL",
      name: "Saint Barthélemy",
      groupId: "Countries",
   },
   {
      id: "SH",
      name: "Saint Helena",
      groupId: "Countries",
   },
   {
      id: "KN",
      name: "Saint Kitts and Nevis",
      groupId: "Countries",
   },
   {
      id: "LC",
      name: "Saint Lucia",
      groupId: "Countries",
   },
   {
      id: "MF",
      name: "Saint Martin (French part)",
      groupId: "Countries",
   },
   {
      id: "PM",
      name: "Saint Pierre and Miquelon",
      groupId: "Countries",
   },
   {
      id: "VC",
      name: "Saint Vincent and the Grenadines",
      groupId: "Countries",
   },
   {
      id: "WS",
      name: "Samoa",
      groupId: "Countries",
   },
   {
      id: "SM",
      name: "San Marino",
      groupId: "Countries",
   },
   {
      id: "ST",
      name: "Sao Tome and Principe",
      groupId: "Countries",
   },
   {
      id: "SA",
      name: "Saudi Arabia",
      groupId: "Countries",
   },
   {
      id: "SN",
      name: "Senegal",
      groupId: "Countries",
   },
   {
      id: "RS",
      name: "Serbia",
      groupId: "Countries",
   },
   {
      id: "SC",
      name: "Seychelles",
      groupId: "Countries",
   },
   {
      id: "SL",
      name: "Sierra Leone",
      groupId: "Countries",
   },
   {
      id: "SG",
      name: "Singapore",
      groupId: "Countries",
   },
   {
      id: "SX",
      name: "Sint Maarten",
      groupId: "Countries",
   },
   {
      id: "SK",
      name: "Slovakia",
      groupId: "Countries",
   },
   {
      id: "SI",
      name: "Slovenia",
      groupId: "Countries",
   },
   {
      id: "SB",
      name: "Solomon Islands",
      groupId: "Countries",
   },
   {
      id: "SO",
      name: "Somalia",
      groupId: "Countries",
   },
   {
      id: "ZA",
      name: "South Africa",
      groupId: "Countries",
   },
   {
      id: "GS",
      name: "South Georgia and the South Sandwich Islands",
      groupId: "Countries",
   },
   {
      id: "SS",
      name: "South Sudan",
      groupId: "Countries",
   },
   {
      id: "ES",
      name: "Spain",
      groupId: "Countries",
   },
   {
      id: "LK",
      name: "Sri Lanka",
      groupId: "Countries",
   },
   {
      id: "SD",
      name: "Sudan",
      groupId: "Countries",
   },
   {
      id: "SR",
      name: "Suriname",
      groupId: "Countries",
   },
   {
      id: "SJ",
      name: "Svalbard and Jan Mayen",
      groupId: "Countries",
   },
   {
      id: "SE",
      name: "Sweden",
      groupId: "Countries",
   },
   {
      id: "CH",
      name: "Switzerland",
      groupId: "Countries",
   },
   {
      id: "SY",
      name: "Syrian Arab Republic",
      groupId: "Countries",
   },
   {
      id: "TW",
      name: "Taiwan",
      groupId: "Countries",
   },
   {
      id: "TJ",
      name: "Tajikistan",
      groupId: "Countries",
   },
   {
      id: "TZ",
      name: "Tanzania, United Republic of",
      groupId: "Countries",
   },
   {
      id: "TH",
      name: "Thailand",
      groupId: "Countries",
   },
   {
      id: "TL",
      name: "Timor-Leste",
      groupId: "Countries",
   },
   {
      id: "TG",
      name: "Togo",
      groupId: "Countries",
   },
   {
      id: "TK",
      name: "Tokelau",
      groupId: "Countries",
   },
   {
      id: "TO",
      name: "Tonga",
      groupId: "Countries",
   },
   {
      id: "TT",
      name: "Trinidad and Tobago",
      groupId: "Countries",
   },
   {
      id: "TN",
      name: "Tunisia",
      groupId: "Countries",
   },
   {
      id: "TR",
      name: "Turkey",
      groupId: "Countries",
   },
   {
      id: "TM",
      name: "Turkmenistan",
      groupId: "Countries",
   },
   {
      id: "TC",
      name: "Turks and Caicos Islands",
      groupId: "Countries",
   },
   {
      id: "TV",
      name: "Tuvalu",
      groupId: "Countries",
   },
   {
      id: "UG",
      name: "Uganda",
      groupId: "Countries",
   },
   {
      id: "UA",
      name: "Ukraine",
      groupId: "Countries",
   },
   {
      id: "AE",
      name: "United Arab Emirates",
      groupId: "Countries",
   },
   {
      id: "GB",
      name: "United Kingdom",
      groupId: "Countries",
   },
   {
      id: "US",
      name: "United States of America",
      groupId: "Countries",
   },
   {
      id: "UY",
      name: "Uruguay",
      groupId: "Countries",
   },
   {
      id: "UZ",
      name: "Uzbekistan",
      groupId: "Countries",
   },
   {
      id: "VU",
      name: "Vanuatu",
      groupId: "Countries",
   },
   {
      id: "VE",
      name: "Venezuela",
      groupId: "Countries",
   },
   {
      id: "VN",
      name: "Viet Nam",
      groupId: "Countries",
   },
   {
      id: "VG",
      name: "Virgin Islands (British)",
      groupId: "Countries",
   },
   {
      id: "VI",
      name: "Virgin Islands (U.S.)",
      groupId: "Countries",
   },
   {
      id: "WF",
      name: "Wallis and Futuna",
      groupId: "Countries",
   },
   {
      id: "EH",
      name: "Western Sahara",
      groupId: "Countries",
   },
   {
      id: "YE",
      name: "Yemen",
      groupId: "Countries",
   },
   {
      id: "ZM",
      name: "Zambia",
      groupId: "Countries",
   },
   {
      id: "ZW",
      name: "Zimbabwe",
      groupId: "Countries",
   },
   {
      id: "AX",
      name: "Åland Islands",
      groupId: "Countries",
   },
] as Option[]

export const languageOptionCodes = [
   {
      id: "en",
      name: "English",
   },
   {
      id: "de",
      name: "German",
   },
   {
      id: "fr",
      name: "French",
   },
   {
      id: "it",
      name: "Italian",
   },
   {
      id: "es",
      name: "Spanish",
   },
   {
      id: "nl",
      name: "Dutch",
   },
   {
      id: "pt",
      name: "Portuguese",
   },
]

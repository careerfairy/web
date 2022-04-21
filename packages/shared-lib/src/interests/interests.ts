import { Identifiable } from "../commonTypes"

export interface Interest extends Identifiable {
   name: string
}

export const dummyInterests = {
   Startups: { id: "Le9yVcgRtkReAdwyh6tq", name: "Startups" },
   "Research & Development": {
      id: "MPY3KTjYH1GiePa4I0kZ",
      name: "Research & Development",
   },
   Business: { id: "OjIkyLu7oxICHqweTT04", name: "Business" },
   "Resume & Cover Letter": {
      id: "ZXvJo51KI8HHXbUiC7Jl",
      name: "Resume & Cover Letter",
   },
   Marketing: { id: "bcs4xerUoed6G28AVjSZ", name: "Marketing" },
   "Large Companies": { id: "njgCUBkijDTSlKtAkAYx", name: "Large Companies" },
   "Career Development": {
      id: "pyfkBYzhJ3ewnmGAoz1l",
      name: "Career Development",
   },
   "Interview Preparation": {
      id: "wMn0IAckmeK7bNSads0V",
      name: "Interview Preparation",
   },
   "Public Sector": { id: "yl0wwi5wQ6oHEt8ovoRb", name: "Public Sector" },
   "Product Management": {
      id: "zzBbeQvTajFdx10kz6X0",
      name: "Product Management",
   },
}

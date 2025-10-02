import TestimonialsSection from "../landing/TestimonialsSection"
import { Testimonial } from "types/cmsTypes"

const defaultTestimonials: Testimonial[] = [
   {
      id: "1",
      content: "CareerFairy connected me with industry leaders who provided invaluable insights. The mentorship I received was instrumental in landing my dream role.",
      rating: 5,
      person: {
         name: "Sarah Johnson",
         role: "Product Manager at Google",
         photo: {
            url: "/testimonials/sarah.jpg",
            alt: "Sarah Johnson"
         },
         company: {
            name: "Google",
            logo: {
               url: "/companies/google.png",
               alt: "Google"
            }
         }
      }
   },
   {
      id: "2",
      content: "The finance professionals on CareerFairy gave me the insider knowledge I needed to break into investment banking. Their guidance was game-changing.",
      rating: 5,
      person: {
         name: "Michael Chen",
         role: "Investment Banking Analyst",
         photo: {
            url: "/testimonials/michael.jpg",
            alt: "Michael Chen"
         },
         company: {
            name: "Goldman Sachs",
            logo: {
               url: "/companies/goldman-sachs.png",
               alt: "Goldman Sachs"
            }
         }
      }
   },
   {
      id: "3",
      content: "Through CareerFairy, I connected with FMCG experts who helped me understand the industry and navigate my career transition successfully.",
      rating: 5,
      person: {
         name: "Emma Rodriguez",
         role: "Brand Manager",
         photo: {
            url: "/testimonials/emma.jpg",
            alt: "Emma Rodriguez"
         },
         company: {
            name: "Unilever",
            logo: {
               url: "/companies/unilever.png",
               alt: "Unilever"
            }
         }
      }
   }
]

interface TestimonialsWrapperProps {
   title?: string
   subtitle?: string
   testimonials?: Testimonial[]
}

export function TestimonialsWrapper({ 
   title = "What Our Community Says",
   subtitle = "Hear from professionals who have accelerated their careers through CareerFairy",
   testimonials = defaultTestimonials
}: TestimonialsWrapperProps) {
   return (
      <TestimonialsSection
         title={title}
         subtitle={subtitle}
         testimonials={testimonials}
         backgroundColor="background.paper"
      />
   )
}
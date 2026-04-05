import type { Testimonial } from "./types";

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Working Professional",
    location: "Anna Nagar",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    rating: 5,
    content:
      "Mullai has been a lifesaver! After long work days, I don't have to worry about cooking. The food tastes just like home - fresh, flavorful, and perfectly spiced.",
    ordered: "Daily Meals - Monthly Plan",
    verified: true,
    type: "text",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    role: "Business Owner",
    location: "T. Nagar",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    rating: 5,
    content:
      "The quality and consistency are amazing. I've been subscribing for 6 months now and have never been disappointed. The biryani is outstanding and the thali options are perfect for family dinners.",
    ordered: "Executive Plus - Family Plan",
    verified: true,
    type: "text",
  },
  {
    id: 3,
    name: "Anita Patel",
    role: "Homemaker",
    location: "Adyar",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    rating: 5,
    content:
      "Even though I cook, sometimes I need a break. Mullai's meals are so authentic and delicious. My family loves the variety and the portions are generous. Highly recommend!",
    ordered: "Basic Tiffin - Weekly Plan",
    verified: true,
    type: "text",
  },
  {
    id: 4,
    name: "Venkatesh Iyer",
    role: "IT Professional",
    location: "Velachery",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    rating: 5,
    content:
      "As someone who stays alone, this service has made my life so much easier. The app is intuitive, delivery is always on time, and the food quality never drops. Worth every rupee!",
    ordered: "Daily Meals - Monthly Plan",
    verified: true,
    type: "text",
  },
  {
    id: 5,
    name: "Deepa Ramachandran",
    role: "Doctor",
    location: "Nungambakkam",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
    rating: 5,
    content:
      "With my erratic hospital schedule, cooking was impossible. Mullai's meal plans fit perfectly into my routine. The South Indian breakfast options are absolutely divine!",
    ordered: "Daily Meals - Quarterly Plan",
    verified: true,
    type: "text",
  },
  {
    id: 6,
    name: "Karthik Subramanian",
    role: "Software Engineer",
    location: "OMR",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    rating: 5,
    content:
      "The variety of dishes is incredible - from Chettinad chicken to authentic Sambar rice. Every meal feels like it's freshly prepared at home. The delivery tracking is a great bonus!",
    ordered: "Executive Plus - Monthly Plan",
    verified: true,
    type: "video",
    video: {
      src: "/videos/testimonial-1.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=450&fit=crop",
      duration: "2:34",
      provider: "native",
    },
    featured: true,
  },
  {
    id: 7,
    name: "Meera Krishnan",
    role: "College Student",
    location: "Chromepet",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    rating: 5,
    content:
      "As a hostel student, I missed home food badly. Mullai brought that taste back! The meals are affordable, portion sizes are perfect, and the menu changes keep things exciting.",
    ordered: "Basic Tiffin - Monthly Plan",
    verified: true,
    type: "video",
    video: {
      src: "/videos/testimonial-2.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=450&fit=crop",
      duration: "1:48",
      provider: "native",
    },
  },
  {
    id: 8,
    name: "Suresh Menon",
    role: "Retired Professor",
    location: "Besant Nagar",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    rating: 5,
    content:
      "At my age, cooking every day is tough. Mullai's meals remind me of my wife's cooking - that's the highest compliment I can give. The traditional Kerala meals are my absolute favorite.",
    ordered: "Daily Meals - Monthly Plan",
    verified: true,
    type: "video",
    video: {
      src: "/videos/testimonial-3.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=450&fit=crop",
      duration: "3:12",
      provider: "native",
    },
  },
];

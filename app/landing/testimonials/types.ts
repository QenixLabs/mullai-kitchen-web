type TestimonialBase = {
  id: number;
  name: string;
  role: string;
  location: string;
  image: string;
  rating: number;
  content: string;
  ordered: string;
  verified: boolean;
  featured?: boolean;
};

type TextTestimonial = TestimonialBase & { type: "text" };

type VideoTestimonial = TestimonialBase & {
  type: "video";
  video: {
    src: string;
    thumbnail: string;
    duration: string;
    provider: "native" | "youtube";
  };
};

type Testimonial = TextTestimonial | VideoTestimonial;
type TestimonialFilter = "all" | "video" | "text";

export type { TestimonialBase, TextTestimonial, VideoTestimonial, Testimonial, TestimonialFilter };

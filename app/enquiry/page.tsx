"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, ArrowLeft } from "lucide-react";

const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type EnquiryFormData = z.infer<typeof enquirySchema>;

export default function EnquiryPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
  });

  const onSubmit = async (data: EnquiryFormData) => {
    console.log("Enquiry submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    reset();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="bg-[linear-gradient(96deg,#5d101d_0%,#7a1127_56%,#5d101d_100%)]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[600px] px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Get a Quote
          </h1>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg">
            Tell us about your requirements and we will get back to you within 24 hours.
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-border/50 bg-white p-8 sm:p-12 text-center shadow-sm"
          >
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">
              Thank You!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your enquiry has been submitted successfully. Our team will reach out to you soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/">Back to Home</Link>
              </Button>
              <Button
                onClick={() => setSubmitted(false)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
              >
                Send Another Enquiry
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-3xl border border-border/50 bg-white p-6 sm:p-10 shadow-sm space-y-5"
          >
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
                className="mt-1.5 h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
                Company Name <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="companyName"
                placeholder="Acme Technologies Pvt Ltd"
                {...register("companyName")}
                className="mt-1.5 h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  {...register("email")}
                  className="mt-1.5 h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  {...register("phone")}
                  className="mt-1.5 h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium text-foreground">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Tell us about your meal requirements, number of employees, preferred meal timings, etc."
                rows={5}
                {...register("message")}
                className="mt-1.5 rounded-xl border-gray-200 bg-gray-50 focus:bg-white resize-none"
              />
              {errors.message && (
                <p className="mt-1 text-sm text-destructive">{errors.message.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full h-12 text-base"
            >
              {isSubmitting ? "Submitting..." : "Submit Enquiry"}
            </Button>
          </motion.form>
        )}
      </main>
    </div>
  );
}

import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  serviceId: z.string().optional(),
  procedureId: z.string().optional(),
  hospitalId: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  consent: z.literal(true, {
    error: "You must agree to the privacy policy",
  }),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

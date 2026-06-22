"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
}

export function FAQSection({ faqs, title }: FAQSectionProps) {
  if (faqs.length === 0) return null;

  return (
    <section>
      {title && (
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
      )}
      <Accordion>
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={index}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

// Answers from lotteindia.com/faq.html (lightly edited for readability, meaning unchanged).

export interface FaqItem {
  id: string;
  q: string;
  a: string;
  link?: { href: string; label: string };
}

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
  {
    id: "products",
    title: "Products",
    items: [
      {
        id: "what-is-choco-pie",
        q: "What is Lotte Choco Pie?",
        a: "Fluffy marshmallow-filled soft biscuits, dipped in rich choco.",
        link: { href: "/brands#pies", label: "See the Choco Pie family" },
      },
      { id: "choco-pie-veg", q: "Is Lotte Choco Pie vegetarian?", a: "Yes — Lotte Choco Pie is vegetarian." },
      {
        id: "complaint",
        q: "Where should I go in case of a product or quality complaint?",
        a: "Please contact Customer Care. Their phone number and email address are printed on every Lotte India Corporation Private Limited product pack. You can also use the enquiry form to share product feedback.",
        link: { href: "#contact", label: "Send an enquiry" },
      },
    ],
  },
  {
    id: "packaging",
    title: "Packaging marks",
    items: [
      {
        id: "veg-mark",
        q: "How can I tell whether a Lotte product is vegetarian or non-vegetarian?",
        a: "Under the Food Safety and Standards Regulations, 2011, any product containing a raw material derived from animal sources must carry a red or brown circle within a square; these are non-vegetarian foods. All other foods are vegetarian and carry a green circle within a square on the pack.",
      },
      {
        id: "fssai",
        q: "What does the FSSAI logo mean?",
        a: "Under the Food Safety and Standards Regulations, 2011, the FSSAI logo on food packaging shows that the manufacturer is licensed by the Food Safety and Standards Authority of India to make that product to the norms for its food category.",
      },
      {
        id: "mrp",
        q: "Why is the MRP missing from mono wrappers?",
        a: "MRP is required by the Legal Metrology (Packaged Commodities) Rules, 2011 — but packaged commodities with a declared net weight below 10 grams are exempt from declaring MRP.",
      },
    ],
  },
  {
    id: "careers",
    title: "Careers",
    items: [
      {
        id: "apply",
        q: "How do I apply for a position at Lotte India?",
        a: "Visit our careers page. Opportunities to grow with Lotte India are also posted on our LinkedIn page.",
        link: { href: "/careers", label: "Grow With Lotte" },
      },
    ],
  },
];

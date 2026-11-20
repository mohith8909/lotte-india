// TODO: Connect to Lotte India's ATS / careers feed. Roles below are illustrative placeholders.

export type DepartmentId = "sales" | "manufacturing" | "marketing" | "rnd" | "supply" | "corporate";

export interface Department {
  id: DepartmentId;
  name: string;
  blurb: string;
  focus: string[];
}

export interface Role {
  title: string;
  department: DepartmentId;
  location: string;
  type: "Full-time" | "Internship" | "Graduate Programme";
}

export const departments: Department[] = [
  {
    id: "sales",
    name: "Sales & Distribution",
    blurb: "Build the routes that carry our brands to a million counters.",
    focus: ["Route-to-market", "Distributor partnerships", "Modern trade"],
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Quality",
    blurb: "Run world-class lines where precision meets a century of craft.",
    focus: ["Process excellence", "Food safety", "Automation"],
  },
  {
    id: "marketing",
    name: "Marketing & Brand",
    blurb: "Shape how India remembers its favourite sweet moments.",
    focus: ["Brand strategy", "Digital & social", "Consumer insight"],
  },
  {
    id: "rnd",
    name: "R&D & Innovation",
    blurb: "Create the flavours and formats of the next decade.",
    focus: ["Product development", "Packaging", "Sensory science"],
  },
  {
    id: "supply",
    name: "Supply Chain",
    blurb: "Keep chocolate cool and candy moving across the subcontinent.",
    focus: ["Planning", "Procurement", "Logistics"],
  },
  {
    id: "corporate",
    name: "Corporate Functions",
    blurb: "Power the business through finance, people and technology.",
    focus: ["Finance", "Human resources", "IT & digital"],
  },
];

export const roles: Role[] = [
  { title: "Area Sales Manager", department: "sales", location: "Mumbai", type: "Full-time" },
  { title: "Key Account Executive — Modern Trade", department: "sales", location: "Bengaluru", type: "Full-time" },
  { title: "Production Shift Engineer", department: "manufacturing", location: "Rohtak", type: "Full-time" },
  { title: "Quality Assurance Specialist", department: "manufacturing", location: "Chennai", type: "Full-time" },
  { title: "Brand Manager — Pies", department: "marketing", location: "Chennai", type: "Full-time" },
  { title: "Digital Marketing Intern", department: "marketing", location: "Chennai", type: "Internship" },
  { title: "Food Technologist", department: "rnd", location: "Chennai", type: "Full-time" },
  { title: "Demand Planner", department: "supply", location: "Chennai", type: "Full-time" },
  { title: "Management Trainee", department: "corporate", location: "Chennai", type: "Graduate Programme" },
];

// The three culture pillars from lotteindia.com.
export const values: { title: string; tagline: string; body: string }[] = [
  {
    title: "Appreciate",
    tagline: "We acknowledge your efforts",
    body: "Big or small, we commend the determination to see things through — and make sure recognition lands where it is due.",
  },
  {
    title: "Connect",
    tagline: "We foster teamwork",
    body: "Healthy, positive relationships at work keep our people engaged and committed — birthdays, festivals and milestones are celebrated together.",
  },
  {
    title: "Excel",
    tagline: "We bring the best out of you",
    body: "Functional, behavioural and leadership training that nurtures your talent towards your career goals.",
  },
];

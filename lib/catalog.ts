export type Test = {
  id: string;
  price: number;
  name: string;
  measures: string;
  sample: string;
  turnaround: string;
  shelf: "suggested" | "addon";
  because?: string;
  follows?: string;
  icon: "drop" | "heart" | "flask" | "dna" | "microscope" | "atom" | "wind" | "leaf";
};

export const TESTS: Test[] = [
  {
    id: "iron-panel",
    price: 29,
    name: "Full iron panel",
    measures: "Iron, transferrin saturation, TIBC alongside ferritin",
    sample: "Blood, with your next draw",
    turnaround: "With your results",
    shelf: "suggested",
    because: "Ferritin 18 ng/mL",
    follows: "Ferritin",
    icon: "drop",
  },
  {
    id: "lipid-advanced",
    price: 49,
    name: "Advanced lipid panel",
    measures: "LDL particle number and size next to ApoB",
    sample: "Blood, with your next draw",
    turnaround: "With your results",
    shelf: "suggested",
    because: "ApoB 112 mg/dL",
    follows: "Apolipoprotein B (ApoB)",
    icon: "heart",
  },
  {
    id: "toxins",
    price: 149,
    name: "Environmental Toxins",
    measures: "Common industrial and household chemical exposures",
    sample: "Urine, at home",
    turnaround: "2 to 3 weeks",
    shelf: "addon",
    icon: "flask",
  },
  {
    id: "galleri",
    price: 949,
    name: "Grail Galleri Multi Cancer Test",
    measures: "Cell-free DNA signals shared by many cancer types",
    sample: "Blood, with your next draw",
    turnaround: "About 2 weeks",
    shelf: "addon",
    icon: "dna",
  },
  {
    id: "gut",
    price: 199,
    name: "Gut Microbiome Analysis",
    measures: "Which bacteria live in your gut, and in what balance",
    sample: "Stool, at home",
    turnaround: "3 to 4 weeks",
    shelf: "addon",
    icon: "microscope",
  },
  {
    id: "metals",
    price: 129,
    name: "Heavy Metals",
    measures: "Lead, mercury, arsenic, cadmium and others",
    sample: "Urine, at home",
    turnaround: "2 to 3 weeks",
    shelf: "addon",
    icon: "atom",
  },
  {
    id: "mycotoxins",
    price: 199,
    name: "Mycotoxins",
    measures: "Toxins produced by indoor and food moulds",
    sample: "Urine, at home",
    turnaround: "2 to 3 weeks",
    shelf: "addon",
    icon: "wind",
  },
  {
    id: "organic-acids",
    price: 179,
    name: "Organic Acids Test",
    measures: "Byproducts of metabolism, gut and nutrient pathways",
    sample: "Urine, at home",
    turnaround: "2 to 3 weeks",
    shelf: "addon",
    icon: "leaf",
  },
];

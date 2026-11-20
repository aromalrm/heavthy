import type { Marker, Status } from "./data";

const GROUPS: Record<string, string> = {
  "Heart & Vascular Health": "heart",
  "Metabolic Health": "metabolism",
  "Sex Hormones": "vitality",
  "Thyroid Health": "metabolism",
  "Inflammation": "vitality",
  "Liver Health": "organs",
  "Kidney Health": "organs",
  "Nutrients": "vitality",
  "Energy": "metabolism",
  "Immune System": "vitality",
  "Brain Health": "vitality"
};

const WHY: Record<string, string> = {
  "Heart & Vascular Health": "Reading cholesterol particles, blood fats, inflammation, and vessel signals together gives a clearer heart-risk picture than any one number.",
  "Metabolic Health": "These markers help show how steadily your body turns food into fuel and manages glucose and insulin.",
  "Sex Hormones": "Hormone results can influence energy, bone, muscle, mood, and reproductive health, but context changes their meaning.",
  "Thyroid Health": "Thyroid regulation helps set the pace of metabolism and energy throughout the body.",
  "Inflammation": "Inflammation markers can reveal whether immune activity is calm, temporarily activated, or persistently elevated.",
  "Liver Health": "The liver processes nutrients, medications, hormones, and waste, so patterns across several markers matter.",
  "Kidney Health": "The kidneys filter blood and balance fluids, salts, and waste products continuously.",
  "Nutrients": "Nutrient markers help reveal whether the body has the raw materials needed for energy, blood cells, nerves, and repair.",
  "Energy": "Energy depends on oxygen delivery, hormones, nutrients, metabolism, and cellular fuel production working together.",
  "Immune System": "Immune markers show the number, balance, and activity of cells involved in defense, allergy, and inflammation.",
  "Brain Health": "Blood-based brain-health markers provide indirect context about nutrients, hormones, inflammation, metabolism, and circulation."
};

const NAMES: Record<string, string[]> = {
  "Heart & Vascular Health": [
    "Atherogenic Coefficient",
    "Atherogenic Index of Plasma",
    "Castelli Risk Index I",
    "Castelli Risk Index II",
    "HDL Cholesterol",
    "HDL AS % OF CHOLESTEROL",
    "LDL Cholesterol",
    "LDL/HDL Ratio",
    "VLDL Cholesterol",
    "Cholesterol, Total",
    "Non-HDL Cholesterol",
    "Cholesterol/HDL Ratio",
    "Carbon Dioxide, Total",
    "hsCRP-to-Albumin Ratio (CAR)",
    "GGT-to-HDL Cholesterol Ratio",
    "LDL-C to Apolipoprotein B Ratio (LDL-C/ApoB)",
    "LDL Cholesterol / Total Cholesterol (Mass Ratio)",
    "Monocyte-to-HDL Ratio (MHR)",
    "Neutrophil-to-HDL Cholesterol Ratio (NHR)",
    "Non-HDL Cholesterol-to-Apolipoprotein B Ratio (Non-HDL-C/ApoB)",
    "NON-HDL Total Cholesterol Ratio",
    "Triglyceride HDL Molar Ratio",
    "Triglycerides",
    "Triglyceride-to-Apolipoprotein B Ratio (TG/ApoB)",
    "TyG Index",
    "Uric Acid"
  ],
  "Metabolic Health": [
    "Apolipoprotein B",
    "Aspartate Aminotransferase (AST)",
    "Atherogenic Coefficient",
    "Atherogenic Index of Plasma",
    "Castelli Risk Index I",
    "Castelli Risk Index II",
    "Chloride",
    "HDL Cholesterol",
    "LDL Cholesterol",
    "LDL/HDL Ratio",
    "VLDL Cholesterol",
    "Cholesterol, Total",
    "Non-HDL Cholesterol",
    "Cholesterol/HDL Ratio",
    "Carbon Dioxide, Total",
    "y-Glutamyl Transferase (GGT)",
    "LDL-C to Apolipoprotein B Ratio (LDL-C/ApoB)",
    "LDL Cholesterol / Total Cholesterol (Mass Ratio)",
    "Neutrophil-to-HDL Cholesterol Ratio (NHR)",
    "Non-HDL Cholesterol-to-Apolipoprotein B Ratio (Non-HDL-C/ApoB)",
    "NON-HDL Total Cholesterol Ratio",
    "Potassium",
    "Sodium",
    "Triglyceride HDL Molar Ratio",
    "Triglycerides",
    "Triglyceride-to-Apolipoprotein B Ratio (TG/ApoB)",
    "TyG Index",
    "Uric Acid",
    "Uric Acid-to-HDL Cholesterol Ratio (UHR)"
  ],
  "Sex Hormones": [
    "Albumin",
    "DHEA-Sulfate (DHEA-S)",
    "Estradiol",
    "Free Androgen Index",
    "Sex Hormone Binding Globulin (SHBG)",
    "Testosterone, Bioavailable",
    "Testosterone-to-Estradiol Ratio (T/E\u2082)"
  ],
  "Thyroid Health": [
    "Albumin",
    "DHEA-Sulfate (DHEA-S)",
    "T3 Uptake",
    "T4 (thyroxine) Total",
    "Testosterone, Bioavailable",
    "Testosterone, Total"
  ],
  "Inflammation": [
    "hsCRP-to-Albumin Ratio (CAR)",
    "Ferritin-to-Albumin Ratio",
    "Lymphocyte-to-Monocyte Ratio (LMR)",
    "Monocyte-to-HDL Ratio (MHR)",
    "Monocyte-to-Lymphocyte Ratio (MLR)",
    "Neutrophil-to-HDL Cholesterol Ratio (NHR)",
    "Neutrophil-to-Lymphocyte-Platelet Ratio (NLPR)",
    "Neutrophil-to-Lymphocyte Ratio (NLR)",
    "Platelet-to-Lymphocyte Ratio (PLR)",
    "Platelet-to-WBC Ratio (PWR)",
    "Rouleaux",
    "Systemic Immune-Inflammation Index",
    "Systemic Inflammation Response Index (SIRI)",
    "White Blood Cells"
  ],
  "Liver Health": [
    "Albumin/Globulin Ratio",
    "Albumin",
    "Alkaline Phosphatase (ALP)",
    "Aspartate Aminotransferase (AST)",
    "Bilirubin Direct",
    "Bilirubin, Total",
    "Bilirubin-to-Albumin Ratio",
    "Ferritin-to-Albumin Ratio",
    "y-Glutamyl Transferase (GGT)",
    "GGT-to-HDL Cholesterol Ratio",
    "Globulin, Total",
    "Indirect-to-Direct Bilirubin Ratio",
    "Macrocytosis",
    "Microcytosis",
    "Protein, Total"
  ],
  "Kidney Health": [
    "Albumin",
    "Calcium",
    "Chloride",
    "Corrected Calcium (Albumin-adjusted)",
    "hsCRP-to-Albumin Ratio (CAR)",
    "Globulin, Total",
    "Potassium",
    "Protein, Total",
    "Sodium",
    "Uric Acid",
    "Blood Urea Nitrogen (BUN)",
    "Urea-to-Creatinine Ratio",
    "Uric Acid-to-HDL Cholesterol Ratio (UHR)"
  ],
  "Nutrients": [
    "Aspartate Aminotransferase (AST)",
    "Calcium",
    "Corrected Calcium (Albumin-adjusted)",
    "hsCRP-to-Albumin Ratio (CAR)",
    "Red Cell Dist Width (RDW)",
    "Hematocrit",
    "Total Iron Binding Capacity (TIBC)",
    "Iron",
    "Iron Saturation",
    "Macrocytosis",
    "Mean Cell Hemoglobin (MCH)",
    "Mean Corpuscular Hemoglobin Concentration (MCHC)",
    "Mean Cell Volume (MCV)",
    "Microcytosis",
    "Platelet-to-WBC Ratio (PWR)",
    "Red Blood Cells",
    "RDW MCV Ratio"
  ],
  "Energy": [
    "Acanthocytes",
    "Albumin/Globulin Ratio",
    "Albumin",
    "Anisocytosis",
    "Aspartate Aminotransferase (AST)",
    "Basophilic Stippling",
    "Bilirubin-to-Albumin Ratio",
    "Bite Cells",
    "Blister Cells",
    "Cabot Rings",
    "Carbon Dioxide, Total",
    "Tear Drop Cells",
    "DHEA-Sulfate (DHEA-S)",
    "Elliptocytes",
    "Globulin, Total",
    "Heinz Bodies",
    "Helmet Cells",
    "Howell-jolly Bodies",
    "Hypochromia",
    "Nucleated Red Blood Cells",
    "Ovalocytes",
    "Pappenheimer Bodies",
    "Poikilocytosis",
    "Polychromasia",
    "Protein, Total",
    "Agglutinated RBC",
    "RBC Morphology",
    "Schistocytes",
    "Sickle Cells",
    "Siderocytes",
    "Spherocytes",
    "Stomatocytes",
    "Target Cells",
    "Testosterone-to-Estradiol Ratio (T/E\u2082)"
  ],
  "Immune System": [
    "Auer Rods",
    "Bands",
    "Bands Abs Count",
    "Basophils",
    "Baso (Absolute)",
    "Bizarre Platelets",
    "Blasts",
    "Absolute Blast Count",
    "Burr Cells",
    "Dohle Bodies",
    "Eosinophils",
    "Eos (Absolute)",
    "Giant Platelets",
    "Hairy Cells",
    "Immature Granulocytes",
    "Large Granular Lymphocytes",
    "Lymphocytes",
    "Lymphs (Absolute)",
    "Megakaryocytic",
    "Metamyelocyte",
    "Monocytes",
    "Monocytes (Absolute)",
    "Atypical Mononuclear Cells",
    "Myelocytes",
    "Neutrophils",
    "Neutrophils (Absolute)",
    "Hypersegmentation",
    "Vacuolated Granulocytes",
    "Degenerative",
    "Parasites",
    "Plasma Cells",
    "Platelet Clumps",
    "Mean Platelet Volume (MPV)",
    "Platelet Morphology",
    "Platelet Satellitosis",
    "Agranular Platelets",
    "Platelet Count",
    "Platelet Estimation",
    "Large Platelets",
    "Prolymphocytes",
    "Promyelocytes",
    "Sezary Cells",
    "Smudge Cells",
    "Toxic Granulation",
    "Atypical Lymphs",
    "Giant Neutrophils"
  ],
  "Brain Health": [
    "Estradiol",
    "Testosterone, Bioavailable",
    "Testosterone, Total"
  ]
};

function plain(name: string, system: string) {
  if (/IgE$/i.test(name)) {
    const target = name.replace(/\s*\([^)]*\)\s*IgE$/i, "");
    return `${name} measures an allergic antibody response to ${target}. It is interpreted with symptoms and exposure history, not by itself.`;
  }
  if (/\(Urine\)/i.test(name))
    return `${name} is part of a urinalysis. It helps add context about kidney filtration, hydration, or possible urinary-system changes.`;
  if (/Ratio|Coefficient|Index|TyG|Castelli|UHR|MHR|NHR|LMR|MLR|PLR|PWR|SIRI|SII/i.test(name))
    return `${name} is calculated from related lab results. It combines several signals into one comparison, so the underlying markers remain important.`;
  if (/Organ Age/i.test(name))
    return `${name} is a modeled estimate that compares a group of related results with expected patterns across age. It is a directional summary, not a diagnosis.`;
  if (/Cholesterol|Apolipoprotein|Triglyceride|Lipoprotein|Oxidized LDL/i.test(name))
    return `${name} adds detail to how fats and cholesterol-carrying particles move through your blood and affect long-term artery health.`;
  if (/Insulin|Glucose|A1c|C-Peptide|Fructosamine|Leptin|Adiponectin/i.test(name))
    return `${name} helps explain how your body manages blood sugar, insulin demand, and energy from food.`;
  if (/Testosterone|Estradiol|Progesterone|Prolactin|DHEA|Androgen|FSH|Luteinizing|Mullerian|PSA/i.test(name))
    return `${name} is a hormone-related signal. Its meaning depends on symptoms, medications, sex, life stage, and testing conditions.`;
  if (/T3|T4|Thyroid|Thyroglobulin|Thyroxine/i.test(name))
    return `${name} adds context to thyroid regulation, which influences metabolism, temperature, heart rate, and energy.`;
  if (/Vitamin|Folate|Iron|Ferritin|Calcium|Magnesium|Selenium|Homocysteine/i.test(name))
    return `${name} helps assess a nutrient or nutrient-related pathway involved in blood cells, energy, nerves, bones, or immune function.`;
  if (/Neutrophil|Lymph|Monocyte|Eosinophil|Basophil|White Blood|Antibod|Immunoglobulin|Platelet|Bands/i.test(name))
    return `${name} adds detail to immune-cell activity or immune signaling. Trends and the wider blood-cell pattern are more useful than one result alone.`;
  if (/ALT|AST|GGT|Bilirubin|Albumin|Globulin|Alkaline|Protein/i.test(name))
    return `${name} helps describe liver processing, protein balance, or possible cell stress when interpreted with the rest of the liver panel.`;
  if (/Creatinine|Cystatin|eGFR|Urea|BUN|Uric Acid|Sodium|Potassium|Chloride/i.test(name))
    return `${name} adds context about filtration, fluid balance, or waste handling across the kidneys and metabolism.`;
  return `${name} is one of the panel's markers grouped under ${system.toLowerCase()}. Its meaning depends on the related results and personal health context.`;
}

function shortOf(name: string) {
  return name
    .replace(/\s*\([^)]*(?:Ratio|Index|Mass Ratio)[^)]*\)\s*$/i, "")
    .replace(/\s*\([^)]{25,}\)\s*$/i, "");
}

export function panelForSystem(system: string): Marker[] {
  return (NAMES[system] ?? []).map((name, index) => {
    const status: Status = index % 7 === 0 ? "inrange" : "optimal";
    return {
      name,
      short: shortOf(name),
      system,
      group: GROUPS[system] ?? "vitality",
      status,
      value: "",
      range: "",
      plain: plain(name, system),
      history: [],
      whyItMatters: WHY[system],
      askQuestions: [
        `What does ${name} measure?`,
        `How does ${name} connect to my other ${system.toLowerCase()} results?`,
        "What would make this result worth following up?",
      ],
    };
  });
}

export function panelMarker(key: string) {
  for (const system of Object.keys(NAMES)) {
    const found = panelForSystem(system).find((marker) =>
      marker.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === key,
    );
    if (found) return found;
  }
  return undefined;
}

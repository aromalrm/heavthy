export type Status = "optimal" | "inrange" | "attention";

export type Marker = {
  name: string;
  short: string;
  system: string;
  group: string;
  status: Status;
  value: string;
  range: string;
  optimal?: string;
  plain: string;
  action?: string;
  history: number[];
  whyItMatters?: string;
  science?: string[];
  habits?: string[];
  askQuestions?: string[];
};

export type Group = {
  key: string;
  title: string;
  subtitle: string;
  systems: string[];
  percent: number;
  status: Status;
  summary: string;
  whyItMatters: string;
  focus: string;
};

export type ProtocolStep = {
  id: string;
  title: string;
  why: string;
  horizon: "week" | "daily" | "retest";
  targets: string[];
  due?: string;
  done?: boolean;
  progress?: { done: number; of: number; unit: string };
};

export const PERSONA = {
  name: "Aromal",
  firstName: "Aromal",
  age: 38,
  memberSince: "Oct 2025",
};

export const DRAWS = [
  { id: "2025-10", label: "Oct 14, 2025", short: "Oct", bioAge: 37.4 },
  { id: "2026-01", label: "Jan 13, 2026", short: "Jan", bioAge: 36.9 },
  { id: "2026-04", label: "Apr 9, 2026", short: "Apr", bioAge: 36.4 },
  { id: "2026-07", label: "Jul 8, 2026", short: "Jul", bioAge: 35.8 },
];

export const LATEST_DRAW = DRAWS.length - 1;

export const NEXT_TEST = { date: "Oct 8, 2026", short: "Oct 8" };

export const FEATURED_BIOMARKERS: Marker[] = [
  {
    name: "Apolipoprotein B (ApoB)",
    short: "Artery-risk particle count",
    system: "Heart & Vascular Health",
    group: "heart",
    status: "attention",
    value: "112 mg/dL",
    range: "< 80 mg/dL",
    plain:
      "ApoB counts cholesterol-carrying particles that can enter artery walls. Yours is above this panel's target, making it the clearest long-term cardiovascular signal in this report.",
    action:
      "Review ApoB alongside LDL, triglycerides and family history with a clinician before choosing an intervention.",
    history: [94, 101, 106, 112],
    whyItMatters:
      "Total cholesterol can look acceptable while particle count is still high. ApoB helps reveal that hidden risk because each potentially harmful particle carries one ApoB protein.",
    science: [
      "ApoB is a particle-count marker, not simply another cholesterol measurement.",
      "Its meaning depends on the complete lipid profile, medical history and the target used by the clinician or laboratory.",
      "Treatment decisions should not be made from this number alone.",
    ],
    habits: [
      "More soluble fiber (oats, beans, vegetables) supports a lower particle count.",
      "Replacing some saturated fat with unsaturated fats tends to lower ApoB.",
      "Regular aerobic exercise supports healthy lipid processing.",
      "Not smoking protects artery walls at any particle count.",
    ],
    askQuestions: [
      "How fast can ApoB realistically change?",
      "How does my ApoB relate to my other heart markers?",
      "What should I ask my doctor about this result?",
    ],
  },
  {
    name: "Ferritin",
    short: "Stored iron",
    system: "Nutrients",
    group: "vitality",
    status: "attention",
    value: "18 ng/mL",
    range: "30 - 150 ng/mL",
    plain:
      "Ferritin estimates the iron your body has stored for future use. Yours is below this panel's preferred range, which can be relevant to energy, exercise tolerance and hair health.",
    action:
      "Confirm the pattern with hemoglobin, iron saturation and a clinician before taking iron.",
    history: [34, 29, 23, 18],
    whyItMatters:
      "A low result is more useful when read with the complete blood count and iron panel. The possible cause matters as much as the number itself.",
    science: [
      "Ferritin reflects iron storage, but inflammation can also raise it.",
      "Iron supplementation is not appropriate for everyone and should follow clinical review.",
    ],
    habits: [
      "Iron-rich foods such as red meat, lentils and spinach support iron stores.",
      "Vitamin C with meals helps your body absorb plant-based iron.",
      "Tea and coffee close to meals can reduce iron absorption.",
    ],
    askQuestions: [
      "What are common reasons ferritin drops?",
      "Could low iron explain how I have been feeling?",
      "What should be checked before I consider iron supplements?",
    ],
  },
  {
    name: "Hemoglobin A1c",
    short: "3-month blood sugar average",
    system: "Metabolic Health",
    group: "metabolism",
    status: "optimal",
    value: "5.2%",
    range: "< 5.7%",
    plain:
      "A1c estimates average blood sugar over roughly three months. Yours is comfortably below the standard prediabetes threshold and has remained stable.",
    history: [5.3, 5.2, 5.2, 5.2],
    whyItMatters:
      "A1c reflects your average blood sugar, so it captures patterns that a single glucose reading can miss. Keeping it in range protects blood vessels and nerves over time.",
    habits: [
      "Fiber-rich meals slow how quickly sugar enters your blood.",
      "A short walk after meals helps muscles use glucose.",
      "Consistent sleep supports stable blood sugar hormones.",
    ],
    askQuestions: [
      "What does my A1c trend say about my metabolic health?",
      "How do A1c, fasting glucose and insulin fit together?",
      "What would cause A1c to start rising?",
    ],
  },
  {
    name: "Fasting Glucose",
    short: "Blood sugar after fasting",
    system: "Metabolic Health",
    group: "metabolism",
    status: "optimal",
    value: "88 mg/dL",
    range: "70 - 99 mg/dL",
    plain:
      "This is the glucose circulating after an overnight fast. Yours sits in the expected healthy range and supports the stable A1c result.",
    history: [92, 90, 89, 88],
    whyItMatters:
      "Fasting glucose shows your baseline blood sugar before food. It helps confirm whether your body keeps sugar steady between meals, not just after them.",
    habits: [
      "Regular movement during the day helps keep baseline glucose steady.",
      "Balanced meals with protein and fiber avoid large sugar swings.",
      "Managing stress and sleep supports the hormones that control glucose.",
    ],
    askQuestions: [
      "Why does fasting glucose matter if my A1c is normal?",
      "What can cause a one-off high fasting glucose?",
      "How often should this be rechecked?",
    ],
  },
  {
    name: "Fasting Insulin",
    short: "Insulin demand at rest",
    system: "Metabolic Health",
    group: "metabolism",
    status: "optimal",
    value: "5.4 µIU/mL",
    range: "2 - 10 µIU/mL",
    plain:
      "This shows how much insulin your body needs while fasting. Yours is low within this panel's target, suggesting glucose is being managed efficiently.",
    history: [6.8, 6.2, 5.8, 5.4],
    whyItMatters:
      "Insulin is the effort behind the glucose number. Low fasting insulin alongside normal glucose suggests your body manages sugar without strain.",
    habits: [
      "Strength training makes muscles more responsive to insulin.",
      "Whole foods over refined carbohydrates reduce insulin demand.",
      "Regular sleep supports insulin sensitivity.",
    ],
    askQuestions: [
      "What is insulin resistance and how would I notice it?",
      "How does fasting insulin add to glucose and A1c?",
      "What would make this number start climbing?",
    ],
  },
  {
    name: "Lipoprotein(a)",
    short: "Inherited artery-risk particle",
    system: "Heart & Vascular Health",
    group: "heart",
    status: "optimal",
    value: "24 nmol/L",
    range: "< 75 nmol/L",
    plain:
      "Lp(a) is a largely inherited cholesterol particle associated with cardiovascular risk. Yours is well below the panel's risk threshold.",
    history: [23, 24, 24, 24],
    whyItMatters:
      "Lp(a) is mostly set by your genes, so one good measurement is usually informative for life. It adds inherited context to the rest of your heart panel.",
    habits: [
      "Lifestyle changes barely move Lp(a) itself, so focus on overall heart health.",
      "Keeping ApoB, blood pressure and fitness in range lowers total risk.",
      "Knowing your family heart history adds useful context.",
    ],
    askQuestions: [
      "Why does Lp(a) rarely change over time?",
      "How does a low Lp(a) affect my overall heart risk?",
      "Should family members consider testing theirs?",
    ],
  },
  {
    name: "High-sensitivity CRP",
    short: "Body-wide inflammation",
    system: "Inflammation",
    group: "vitality",
    status: "optimal",
    value: "0.8 mg/L",
    range: "< 1.0 mg/L",
    plain:
      "This sensitive inflammation signal has improved across three checks and now sits in the lower-risk range.",
    history: [2.1, 1.6, 1.1, 0.8],
    whyItMatters:
      "Ongoing low-grade inflammation quietly stresses blood vessels and tissues. A low, stable CRP suggests your body is not fighting a constant background battle.",
    habits: [
      "Regular exercise is one of the strongest anti-inflammatory habits.",
      "A diet rich in vegetables, fish and olive oil supports lower CRP.",
      "Good sleep and dental health both reduce background inflammation.",
    ],
    askQuestions: [
      "What likely drove my CRP improvement?",
      "What can temporarily spike CRP?",
      "How does inflammation connect to my heart markers?",
    ],
  },
  {
    name: "Alanine Aminotransferase (ALT)",
    short: "Liver stress signal",
    system: "Liver Health",
    group: "organs",
    status: "optimal",
    value: "21 U/L",
    range: "7 - 35 U/L",
    plain:
      "ALT can rise when liver cells are under stress. Yours is stable and comfortably inside the laboratory range.",
    history: [24, 22, 21, 21],
    whyItMatters:
      "Your liver processes nutrients, medications and toxins around the clock. A stable ALT suggests liver cells are not under ongoing stress.",
    habits: [
      "Keeping alcohol moderate protects liver cells.",
      "A healthy weight lowers the chance of fat accumulating in the liver.",
      "Reviewing supplements and medications with a clinician avoids hidden liver strain.",
    ],
    askQuestions: [
      "What could cause ALT to rise?",
      "How do liver markers relate to metabolism?",
      "When would a liver result need follow-up?",
    ],
  },
  {
    name: "Estimated GFR",
    short: "Kidney filtration",
    system: "Kidney Health",
    group: "organs",
    status: "optimal",
    value: "104 mL/min",
    range: "≥ 90 mL/min",
    plain:
      "This estimates how effectively the kidneys filter blood. Yours is stable and in the expected healthy range.",
    history: [101, 103, 102, 104],
    whyItMatters:
      "Your kidneys filter waste and balance fluids continuously. A stable eGFR means that filtration capacity is holding steady over time.",
    habits: [
      "Staying hydrated supports day-to-day kidney function.",
      "Healthy blood pressure is the biggest protector of kidney filtration.",
      "Avoiding frequent use of anti-inflammatory painkillers protects kidneys.",
    ],
    askQuestions: [
      "What does eGFR actually estimate?",
      "What habits protect kidney function long-term?",
      "Why can eGFR vary between tests?",
    ],
  },
  {
    name: "Vitamin D",
    short: "Immune & bone nutrient",
    system: "Nutrients",
    group: "vitality",
    status: "inrange",
    value: "42 ng/mL",
    range: "30 - 100 ng/mL",
    optimal: "50 - 80 ng/mL",
    plain:
      "Vitamin D supports bone and immune health. Yours is inside the laboratory range but below this panel's optimal band, and slowly rising.",
    history: [36, 39, 41, 42],
    whyItMatters:
      "Vitamin D supports bones, muscles and immune function. Staying in range matters more than chasing a high number.",
    habits: [
      "Regular time outdoors supports natural vitamin D production.",
      "Fatty fish, eggs and fortified foods add dietary vitamin D.",
      "Discuss supplementation with a clinician before high doses.",
    ],
    askQuestions: [
      "Is my vitamin D level good enough for winter?",
      "How does vitamin D interact with my other nutrients?",
      "Do I need a supplement at this level?",
    ],
  },
  {
    name: "Total Testosterone",
    short: "Androgen hormone signal",
    system: "Sex Hormones",
    group: "vitality",
    status: "optimal",
    value: "28 ng/dL",
    range: "15 - 70 ng/dL",
    plain:
      "This androgen hormone supports muscle, bone, libido and energy. Yours sits inside this panel's expected range.",
    history: [26, 29, 27, 28],
    whyItMatters:
      "Sex hormones affect multiple systems, but the number only becomes useful when combined with symptoms, cycle stage, medications and life stage.",
    habits: [
      "Consistent sleep supports normal hormone signaling.",
      "Strength training supports muscle and bone health across hormone changes.",
      "Adequate energy and protein intake help avoid stress-related hormone disruption.",
    ],
    askQuestions: [
      "How should this result be interpreted for my life stage?",
      "Which symptoms would make this number more meaningful?",
      "How do my sex hormone markers work together?",
    ],
  },
  {
    name: "Thyroid Stimulating Hormone (TSH)",
    short: "Thyroid control signal",
    system: "Thyroid Health",
    group: "metabolism",
    status: "optimal",
    value: "1.8 mIU/L",
    range: "0.4 - 4.5 mIU/L",
    plain:
      "TSH is the signal that asks your thyroid to make hormones. Yours sits comfortably inside the laboratory range and has remained stable.",
    history: [2.1, 1.9, 1.8, 1.8],
    whyItMatters:
      "Thyroid hormones help set the pace of metabolism, temperature, heart rate and energy. TSH is a useful starting signal, but it is not the whole thyroid picture.",
    habits: [
      "Adequate iodine and selenium support thyroid hormone production.",
      "Consistent sleep and enough food help avoid stress-related shifts.",
      "Review supplements before testing because biotin can interfere with some thyroid results.",
    ],
    askQuestions: [
      "What does TSH tell me that thyroid hormones do not?",
      "How do my thyroid results connect to energy?",
      "When would symptoms justify a fuller thyroid review?",
    ],
  },
  {
    name: "Hemoglobin",
    short: "Oxygen-carrying capacity",
    system: "Energy",
    group: "metabolism",
    status: "optimal",
    value: "13.5 g/dL",
    range: "11.7 - 15.5 g/dL",
    plain:
      "Hemoglobin carries oxygen from your lungs to your tissues. Yours is inside the expected range, even though stored iron is currently low.",
    history: [13.7, 13.6, 13.5, 13.5],
    whyItMatters:
      "Your cells need oxygen to make energy. Normal hemoglobin supports oxygen delivery, but low iron stores can appear before hemoglobin falls.",
    habits: [
      "Iron, vitamin B12 and folate support healthy red blood cell production.",
      "Regular movement supports circulation and oxygen use.",
      "Persistent fatigue deserves broader context than this marker alone.",
    ],
    askQuestions: [
      "How can hemoglobin be normal when ferritin is low?",
      "Which other markers help explain low energy?",
      "What changes in this trend would matter?",
    ],
  },
  {
    name: "White Blood Cell Count",
    short: "Immune cell count",
    system: "Immune System",
    group: "vitality",
    status: "optimal",
    value: "5.8 K/µL",
    range: "3.8 - 10.8 K/µL",
    plain:
      "White blood cells help respond to infection and injury. Your total count is stable and inside the expected laboratory range.",
    history: [5.5, 5.9, 5.7, 5.8],
    whyItMatters:
      "The count gives a broad view of immune activity. The mix of cell types and the trend over time add more context than the total alone.",
    habits: [
      "Regular sleep supports coordinated immune responses.",
      "Adequate protein and varied nutrients support immune cell production.",
      "Vaccination and hand hygiene prevent more illness than trying to raise this number.",
    ],
    askQuestions: [
      "What does a white blood cell differential add?",
      "What can temporarily change this count?",
      "When would a trend need follow-up?",
    ],
  },
  {
    name: "Homocysteine",
    short: "Methylation & vessel signal",
    system: "Brain Health",
    group: "vitality",
    status: "optimal",
    value: "8.2 µmol/L",
    range: "< 10 µmol/L",
    plain:
      "Homocysteine is an amino acid influenced by B vitamins and other factors. Yours sits inside this panel's target.",
    history: [9.1, 8.7, 8.4, 8.2],
    whyItMatters:
      "Persistently elevated homocysteine can accompany low B-vitamin status and higher blood-vessel risk. It is one supporting signal, not a direct measure of brain function.",
    habits: [
      "Leafy greens, beans and other folate-rich foods support healthy processing.",
      "Vitamin B12 and B6 also help the body recycle homocysteine.",
      "Blood pressure, exercise and sleep remain stronger foundations for brain health.",
    ],
    askQuestions: [
      "What does homocysteine have to do with brain health?",
      "How do B vitamins influence this result?",
      "Which other results put this number in context?",
    ],
  },
  {
    name: "Creatinine",
    short: "Kidney filtration waste marker",
    system: "Kidney Health",
    group: "organs",
    status: "optimal",
    value: "0.78 mg/dL",
    range: "0.50 - 0.97 mg/dL",
    plain:
      "Creatinine is a waste product filtered from your blood by the kidneys. Yours is stable and inside the laboratory range.",
    history: [0.8, 0.79, 0.78, 0.78],
    whyItMatters:
      "Creatinine helps estimate kidney filtration, but muscle mass, hydration and medications can also affect the result.",
    habits: [
      "Healthy blood pressure supports kidney filtration.",
      "Consistent hydration makes trends easier to interpret.",
      "Review frequent pain-reliever use with a clinician.",
    ],
    askQuestions: [
      "What does my creatinine say about kidney filtration?",
      "What can change creatinine without kidney disease?",
      "Which kidney results should be read with this?",
    ],
  },
  {
    name: "Cortisol",
    short: "Stress-response hormone",
    system: "Energy",
    group: "metabolism",
    status: "optimal",
    value: "13.2 µg/dL",
    range: "Morning 6.2 - 19.4 µg/dL",
    plain:
      "Cortisol helps regulate alertness, stress response and energy availability. This morning result sits inside the expected laboratory range.",
    history: [14.1, 13.6, 13.4, 13.2],
    whyItMatters:
      "Cortisol follows a daily rhythm, so timing matters. One result is most useful when interpreted with symptoms, sleep and testing time.",
    habits: [
      "Consistent sleep supports a predictable cortisol rhythm.",
      "Regular movement helps regulate stress response.",
      "Testing at a similar time makes future comparisons more useful.",
    ],
    askQuestions: [
      "How does cortisol affect daily energy?",
      "Why does testing time change the interpretation?",
      "How does this result connect to sleep and stress?",
    ],
  },
];

export const GROUPS: Group[] = [
  {
    key: "heart",
    title: "Heart & Circulation",
    subtitle: "Artery risk, cholesterol particles, blood fats",
    systems: ["Heart & Vascular Health"],
    percent: 74,
    status: "attention",
    summary:
      "Most heart signals are reassuring, but your cholesterol particle count is above this panel's target. That makes long-term artery protection the clearest priority in this group.",
    whyItMatters:
      "Your heart and blood vessels move oxygen and nutrients throughout your body. Looking at cholesterol particles, blood fats, and inflammation together gives a more useful picture than any one result alone.",
    focus:
      "Start with ApoB. Review it with your full cholesterol panel, family history, and a clinician before choosing an intervention.",
  },
  {
    key: "metabolism",
    title: "Energy & Metabolism",
    subtitle: "Blood sugar, insulin, how you turn food into fuel",
    systems: ["Metabolic Health", "Energy", "Thyroid Health"],
    percent: 91,
    status: "optimal",
    summary:
      "Your blood sugar and insulin results tell a consistent, reassuring story. Your body appears to be turning food into fuel without needing unusually high insulin.",
    whyItMatters:
      "This group connects blood sugar, insulin, thyroid signals, and energy production. Together they help explain how steadily your body creates and uses fuel.",
    focus:
      "Maintain the habits supporting this pattern. No isolated metabolic result needs urgent follow-up.",
  },
  {
    key: "organs",
    title: "Organ Health",
    subtitle: "Liver, kidney and waste-clearing signals",
    systems: ["Liver Health", "Kidney Health"],
    percent: 96,
    status: "optimal",
    summary:
      "Your liver and kidney signals are stable and inside their expected ranges. There is no clear organ-related priority in this panel.",
    whyItMatters:
      "Your liver processes nutrients and waste, while your kidneys filter the blood and balance fluids. Stable signals support the picture that both systems are working as expected.",
    focus:
      "Keep monitoring these markers over time. A trend away from your usual baseline can matter even before a result leaves the laboratory range.",
  },
  {
    key: "vitality",
    title: "Defense & Vitality",
    subtitle: "Inflammation, immune health, hormones, nutrients",
    systems: ["Inflammation", "Immune System", "Sex Hormones", "Nutrients", "Brain Health"],
    percent: 82,
    status: "inrange",
    summary:
      "Inflammation has improved and most defense-related signals are reassuring. Low stored iron is the main result to understand in this group.",
    whyItMatters:
      "This group brings together immune activity, inflammation, hormones, nutrients, and brain-related signals. These systems influence resilience, recovery, and how you feel day to day.",
    focus:
      "Confirm the low ferritin pattern with your blood count and full iron panel before considering supplements.",
  },
];

export const CORE_HEALTH = [
  { name: "Heart & Vascular Health", grade: "B", status: "inrange" as Status },
  { name: "Metabolic Health", grade: "A", status: "optimal" as Status },
  { name: "Sex Hormones", grade: "A", status: "optimal" as Status },
  { name: "Thyroid Health", grade: "A", status: "optimal" as Status },
  { name: "Inflammation", grade: "A", status: "optimal" as Status },
  { name: "Liver Health", grade: "A", status: "optimal" as Status },
  { name: "Kidney Health", grade: "A", status: "optimal" as Status },
  { name: "Nutrients", grade: "B", status: "inrange" as Status },
  { name: "Energy", grade: "B", status: "inrange" as Status },
  { name: "Immune System", grade: "A", status: "optimal" as Status },
  { name: "Brain Health", grade: "A", status: "optimal" as Status },
];

export const PROTOCOL: ProtocolStep[] = [
  {
    id: "apob-review",
    title: "Review ApoB with a clinician",
    why: "Your clearest priority. Read it with the full lipid panel and family history.",
    horizon: "week",
    targets: ["Apolipoprotein B (ApoB)", "Lipoprotein(a)"],
    due: "By Jul 22",
  },
  {
    id: "iron-check",
    title: "Confirm low iron before supplementing",
    why: "Ferritin fell at every test. Hemoglobin and saturation show whether it matters.",
    horizon: "week",
    targets: ["Ferritin", "Hemoglobin"],
    due: "By Jul 22",
    done: true,
  },
  {
    id: "fiber",
    title: "Soluble fiber at one meal a day",
    why: "Oats, beans and lentils are linked with a lower particle count.",
    horizon: "daily",
    targets: ["Apolipoprotein B (ApoB)"],
    progress: { done: 9, of: 14, unit: "days" },
  },
  {
    id: "iron-food",
    title: "Vitamin C with plant-based iron",
    why: "It helps absorption. Keep tea and coffee away from those meals.",
    horizon: "daily",
    targets: ["Ferritin"],
    progress: { done: 5, of: 14, unit: "days" },
  },
  {
    id: "sleep",
    title: "Keep the sleep routine that lowered CRP",
    why: "Inflammation fell across three tests as sleep became regular.",
    horizon: "daily",
    targets: ["High-sensitivity CRP"],
    progress: { done: 11, of: 14, unit: "nights" },
  },
  {
    id: "retest",
    title: "Retest ApoB and ferritin",
    why: "Shows whether the two changes above are working.",
    horizon: "retest",
    targets: ["Apolipoprotein B (ApoB)", "Ferritin"],
    due: NEXT_TEST.short,
  },
];

export const NAV = [
  { label: "Home", href: "/home" },
  { label: "Data", href: "/data" },
  { label: "Protocol", href: "/protocol" },
  { label: "Marketplace", href: "/marketplace" },
] as const;

export function protocolFor(name: string) {
  return PROTOCOL.filter((step) => step.targets.includes(name));
}

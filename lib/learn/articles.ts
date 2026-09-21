/**
 * Learn articles: plain typed data so the section stays a static export with
 * no MDX dependency. Education only, never product recommendations. Tax facts
 * are dated to FY 2025-26 and must be re-checked when the Finance Act changes.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "facts"; rows: [string, string][] };

export interface Article {
  slug: string;
  title: string;
  description: string;
  topic: "Tax" | "Investing" | "Loans";
  /** Set for articles that quote rules or limits that change year to year. */
  asOf?: string;
  minutes: number;
  cta: { href: string; label: string };
  body: Block[];
}

export const articles: Article[] = [
  {
    slug: "old-vs-new-tax-regime",
    title: "Old vs new tax regime, explained",
    description:
      "What actually differs between the two regimes for FY 2025-26, and how to tell which one leaves you with less tax.",
    topic: "Tax",
    asOf: "FY 2025-26",
    minutes: 5,
    cta: { href: "/income-tax/", label: "Compare both regimes with your numbers" },
    body: [
      {
        type: "p",
        text: "Indian salaried taxpayers can choose between two ways of calculating income tax each year. The new regime has lower slab rates and almost no deductions. The old regime has higher slab rates but lets you subtract things like 80C investments, health insurance and HRA before tax is worked out.",
      },
      { type: "h2", text: "The slabs at a glance" },
      {
        type: "facts",
        rows: [
          ["New regime slabs", "Nil to ₹4L, then 5%, 10%, 15%, 20%, 25% in ₹4L steps, and 30% above ₹24L"],
          ["Old regime slabs", "Nil to ₹2.5L, 5% to ₹5L, 20% to ₹10L, 30% above (below age 60)"],
          ["Standard deduction", "₹75,000 (new) and ₹50,000 (old), for salaried income"],
          ["Section 87A rebate", "New: no tax if taxable income is up to ₹12L. Old: up to ₹5L"],
        ],
      },
      { type: "h2", text: "What you give up in the new regime" },
      {
        type: "ul",
        items: [
          "Section 80C (up to ₹1.5L), 80D health insurance, 80CCD(1B) extra NPS and 80E education-loan interest",
          "HRA exemption and home-loan interest on a self-occupied house",
          "Most other exemptions and allowances",
        ],
      },
      { type: "h2", text: "A rough way to decide" },
      {
        type: "p",
        text: "The old regime tends to win only when your total deductions are large, often well above ₹3.5L to ₹4L for mid-to-high incomes. If you pay high rent and a home-loan EMI and also use your full 80C and 80D limits, run the numbers. If you mostly claim only the standard deduction, the new regime usually leaves you with less tax.",
      },
      {
        type: "p",
        text: "Salaried people can switch every year. Business owners have tighter rules on switching back, so check before you choose.",
      },
    ],
  },
  {
    slug: "section-80c-explained",
    title: "Section 80C: what counts and what to weigh",
    description:
      "The ₹1.5 lakh deduction under the old regime, the common ways it gets used, and the trade-offs of lock-ins.",
    topic: "Tax",
    asOf: "FY 2025-26",
    minutes: 5,
    cta: { href: "/income-tax/", label: "See how much 80C room you have left" },
    body: [
      {
        type: "p",
        text: "Section 80C lets you deduct up to ₹1.5 lakh a year from your taxable income in the old regime. Many people already fill part of it without trying, through provident fund and insurance premiums, so check what you have used before adding anything.",
      },
      { type: "h2", text: "Things that commonly qualify" },
      {
        type: "ul",
        items: [
          "Employee provident fund (EPF) contributions and voluntary PF",
          "Public Provident Fund (PPF) and Sukanya Samriddhi Yojana",
          "Equity-linked savings schemes (ELSS mutual funds)",
          "Life insurance premiums, within the eligible limits",
          "Principal repaid on a home loan, and tuition fees for up to two children",
          "5-year tax-saver fixed deposits and National Savings Certificates",
        ],
      },
      { type: "h2", text: "Lock-ins differ a lot" },
      {
        type: "facts",
        rows: [
          ["PPF", "15-year term, with limited partial withdrawals after a few years"],
          ["ELSS", "3-year lock-in, and returns follow the equity market"],
          ["Tax-saver FD / NSC", "5-year lock-in, with interest that is taxable"],
          ["EPF", "Tied to employment; withdrawal has its own rules"],
        ],
      },
      { type: "h2", text: "Questions worth asking" },
      {
        type: "ul",
        items: [
          "Will I need this money within the lock-in period?",
          "Is the tax saved worth more to me than the flexibility I give up?",
          "Am I buying something only for the deduction, or because it fits a goal I already had?",
        ],
      },
      {
        type: "p",
        text: "The deduction reduces taxable income, so the tax you save depends on your slab. At the 30% slab, ₹1.5L of deduction saves about ₹46,800 including cess. At 5%, it saves far less.",
      },
    ],
  },
  {
    slug: "nps-extra-deduction",
    title: "NPS and the extra ₹50,000 deduction",
    description:
      "How Section 80CCD(1B) and employer NPS contributions work, and what to know about the lock-in.",
    topic: "Tax",
    asOf: "FY 2025-26",
    minutes: 4,
    cta: { href: "/income-tax/", label: "Try NPS in the tax calculator" },
    body: [
      {
        type: "p",
        text: "The National Pension System (NPS) is a government-regulated retirement account. It matters for tax because it has deductions that sit on top of the ₹1.5L 80C limit.",
      },
      {
        type: "facts",
        rows: [
          ["80CCD(1B)", "Extra deduction of up to ₹50,000 for your own NPS contribution, old regime only"],
          ["80CCD(2)", "Employer contribution is deductible in both regimes, up to 14% of salary in the new regime and 10% in the old"],
        ],
      },
      { type: "h2", text: "The trade-offs" },
      {
        type: "ul",
        items: [
          "Money is meant for retirement. Exit and withdrawal rules are restrictive before age 60",
          "A part of the corpus must usually be used to buy an annuity, and annuity income is taxable",
          "Returns depend on the asset mix you pick and are not guaranteed",
        ],
      },
      {
        type: "p",
        text: "Employer NPS is the one deduction that helps in the new regime too, so it is worth asking whether your employer offers it as part of your salary structure.",
      },
    ],
  },
  {
    slug: "health-insurance-80d",
    title: "Health insurance and Section 80D",
    description:
      "The 80D limits for you, your family and your parents, and why the deduction is a side benefit rather than the point.",
    topic: "Tax",
    asOf: "FY 2025-26",
    minutes: 3,
    cta: { href: "/income-tax/", label: "Check your 80D room" },
    body: [
      {
        type: "p",
        text: "Health insurance exists to protect you from a large medical bill. The 80D deduction is a small extra reward, and it applies in the old regime only.",
      },
      {
        type: "facts",
        rows: [
          ["Self, spouse and children", "Up to ₹25,000 (₹50,000 if you are a senior citizen)"],
          ["Parents", "Up to ₹25,000 (₹50,000 if they are senior citizens)"],
          ["Preventive health check-up", "Included within these limits, up to ₹5,000"],
        ],
      },
      {
        type: "p",
        text: "Cover adequacy, waiting periods, room-rent limits and exclusions matter far more than the tax saving. Read the policy document, and compare like with like before you decide.",
      },
    ],
  },
  {
    slug: "hra-basics",
    title: "HRA exemption in plain terms",
    description:
      "How the House Rent Allowance exemption is worked out and the situations where it helps.",
    topic: "Tax",
    asOf: "FY 2025-26",
    minutes: 3,
    cta: { href: "/income-tax/", label: "Add your rent to the calculator" },
    body: [
      {
        type: "p",
        text: "If your salary includes House Rent Allowance and you pay rent, part of that HRA can be exempt from tax in the old regime. The exempt amount is the smallest of three numbers:",
      },
      {
        type: "ul",
        items: [
          "The HRA you actually receive",
          "Rent paid minus 10% of your basic salary (plus dearness allowance, if it counts as salary)",
          "50% of basic salary if you live in a metro (Delhi, Mumbai, Kolkata, Chennai), otherwise 40%",
        ],
      },
      {
        type: "p",
        text: "Rent above ₹1 lakh a year generally requires your landlord's PAN. Keep rent receipts and a rental agreement. HRA is not available in the new regime.",
      },
    ],
  },
  {
    slug: "power-of-compounding",
    title: "The power of compounding, and starting early",
    description:
      "Why time matters more than the size of the deposit, with the rule of 72 as a quick mental check.",
    topic: "Investing",
    minutes: 4,
    cta: { href: "/future-value/", label: "Play with compounding in the calculator" },
    body: [
      {
        type: "p",
        text: "Compounding means you earn returns on your earlier returns. Over short periods it looks small. Over decades it does most of the work.",
      },
      { type: "h2", text: "The rule of 72" },
      {
        type: "p",
        text: "Divide 72 by the annual rate to estimate how many years it takes money to double. At 8% it is about 9 years, and at 12% about 6 years. It is an approximation, and it assumes a steady rate that real investments do not deliver.",
      },
      { type: "h2", text: "Why early beats big" },
      {
        type: "p",
        text: "Someone who invests ₹5,000 a month for 30 years at an assumed 10% ends up with far more than someone who invests ₹10,000 a month for 15 years, even though the second person deposits the same total. The extra 15 years of growth is what makes the difference. The 10% here is only an illustration, not a prediction.",
      },
      { type: "h2", text: "Two honest caveats" },
      {
        type: "ul",
        items: [
          "Inflation reduces what a future rupee can buy. Use the present value calculator to see this",
          "Returns are uneven. Equity can fall sharply for years, and the calculator's single steady rate hides that",
        ],
      },
    ],
  },
  {
    slug: "sip-vs-lump-sum",
    title: "SIP vs lump sum: what really differs",
    description:
      "How regular investing and one-time investing behave differently, without pretending either always wins.",
    topic: "Investing",
    minutes: 4,
    cta: { href: "/compare/", label: "Compare two plans side by side" },
    body: [
      {
        type: "p",
        text: "A systematic investment plan (SIP) invests a fixed amount at regular intervals. A lump sum invests everything at once. They suit different situations more than they compete.",
      },
      {
        type: "facts",
        rows: [
          ["SIP", "Fits monthly income, spreads the entry price over time and needs no market timing"],
          ["Lump sum", "Fits money you already have, and has more time invested, for better or worse"],
        ],
      },
      {
        type: "ul",
        items: [
          "If markets rise steadily, a lump sum tends to come out ahead because more money is invested for longer",
          "If markets fall soon after you invest, a SIP tends to hurt less because you buy more units at lower prices later",
          "Nobody can reliably predict which case will happen, so the choice is mostly about cash flow and comfort",
        ],
      },
      {
        type: "p",
        text: "For most people the practical question is not SIP versus lump sum. It is whether they can keep investing consistently through good and bad years.",
      },
    ],
  },
  {
    slug: "prepay-loan-or-invest",
    title: "Prepay a loan or invest the money?",
    description:
      "A way of thinking about the trade-off between a guaranteed saving and an uncertain return.",
    topic: "Loans",
    minutes: 4,
    cta: { href: "/emi/", label: "See how prepayment and step-up EMI change a loan" },
    body: [
      {
        type: "p",
        text: "Paying down a loan gives you a certain return equal to the loan's interest rate. Investing gives you a return that could be higher or lower, and might be negative in the short run.",
      },
      { type: "h2", text: "Things to weigh" },
      {
        type: "ul",
        items: [
          "The loan rate against a realistic, after-tax expectation for the investment",
          "Whether the loan gets a tax benefit, such as home-loan interest in the old regime",
          "Prepayment charges, if any, on your loan",
          "How much certainty you value, since a guaranteed saving lets many people sleep better",
          "Whether you would still keep an emergency fund after prepaying",
        ],
      },
      {
        type: "p",
        text: "A high-interest loan, such as a personal loan or credit card balance, is usually the first thing to clear because few investments reliably beat those rates. A low-rate loan leaves more room for judgement. Use the EMI and Compare calculators to see what each choice changes in interest paid.",
      },
    ],
  },
  {
    slug: "emergency-fund",
    title: "Emergency fund basics",
    description:
      "Why many people set aside a few months of expenses before investing, and where to keep it.",
    topic: "Investing",
    minutes: 3,
    cta: { href: "/future-value/", label: "Project how a savings habit grows" },
    body: [
      {
        type: "p",
        text: "An emergency fund is money set aside for job loss, a medical bill or an urgent repair. Its purpose is to stop you from selling investments at a bad time or borrowing at a high rate.",
      },
      {
        type: "ul",
        items: [
          "A common guideline is three to six months of essential expenses. Choose a number that fits how stable your income is",
          "Keep it easy to reach, in something with low risk and quick access rather than something aimed at high returns",
          "Count only essentials: rent or EMI, food, utilities, insurance premiums and dependants' costs",
        ],
      },
      {
        type: "p",
        text: "Many people build this first and then start longer-term investing, but the right order depends on your situation.",
      },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

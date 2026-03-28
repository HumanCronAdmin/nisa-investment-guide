// Investment option data (all hardcoded, no API needed)

const INVESTMENT_OPTIONS = {
  ideco: {
    id: 'ideco',
    name: 'iDeCo (Individual Defined Contribution Pension)',
    shortName: 'iDeCo',
    description: 'Japan\'s individual defined contribution pension plan. Contributions are tax-deductible, and investment gains grow tax-free until withdrawal at age 60+.',
    monthlyContributionLimit: 23000, // yen (for company employees without corporate DC)
    annualContributionLimit: 276000,
    taxRate: 0, // tax-free during accumulation; taxed at withdrawal (simplified)
    withdrawalTaxNote: 'Taxed as retirement income at withdrawal (age 60+). Retirement income deduction applies, significantly reducing effective tax rate.',
    pros: [
      'Tax-deductible contributions (reduces income tax & resident tax)',
      'Investment gains are tax-free during accumulation',
      'Wide range of low-cost index funds available',
      'Retirement income deduction at withdrawal'
    ],
    cons: [
      'Cannot withdraw until age 60',
      'Monthly contribution limits are relatively low',
      'Limited to one account per person',
      'Management fees apply (varies by provider)'
    ],
    expectedReturns: {
      conservative: { equity: 0.03, bond: 0.015, deposit: 0.002 },
      balanced: { equity: 0.05, bond: 0.02, deposit: 0.002 },
      aggressive: { equity: 0.07, bond: 0.03, deposit: 0.002 }
    },
    linkText: 'Open iDeCo Account (SBI Securities)',
    linkUrl: 'https://go.sbisec.co.jp/prd/ideco/ideco_top.html',
    color: '#3B82F6' // blue
  },

  tokutei: {
    id: 'tokutei',
    name: 'Tokutei Koza (Taxable Brokerage Account)',
    shortName: 'Taxable Account',
    description: 'A standard taxable brokerage account at a Japanese securities firm. No contribution limits and high liquidity, but investment gains are taxed at 20.315%.',
    monthlyContributionLimit: null, // no limit
    annualContributionLimit: null,
    taxRate: 0.20315,
    withdrawalTaxNote: 'Gains taxed at a flat 20.315% (income tax 15.315% + resident tax 5%). Withholding tax option available for simplified filing.',
    pros: [
      'No contribution limits',
      'Full liquidity - withdraw anytime',
      'Simple tax withholding option (tokutei koza with withholding)',
      'Wide range of investment products',
      'No age restrictions'
    ],
    cons: [
      'Gains taxed at 20.315%',
      'No tax deduction on contributions',
      'Dividends also taxed at 20.315%'
    ],
    expectedReturns: {
      conservative: { equity: 0.03, bond: 0.015, deposit: 0.002 },
      balanced: { equity: 0.05, bond: 0.02, deposit: 0.002 },
      aggressive: { equity: 0.07, bond: 0.03, deposit: 0.002 }
    },
    linkText: 'Open Account (Rakuten Securities)',
    linkUrl: 'https://www.rakuten-sec.co.jp/',
    color: '#10B981' // green
  },

  overseas: {
    id: 'overseas',
    name: 'Overseas Brokerage (e.g., Interactive Brokers)',
    shortName: 'Overseas Broker',
    description: 'An overseas brokerage account allows direct access to US ETFs and international markets. Lower expense ratios on some funds, but requires self-filing taxes and carries currency risk.',
    monthlyContributionLimit: null, // no limit
    annualContributionLimit: null,
    taxRate: 0.20315,
    currencyRiskRange: 0.02, // +/- 2% annual impact
    withdrawalTaxNote: 'Gains taxed at 20.315% via annual tax filing (kakutei shinkoku). Foreign tax credit may apply for US dividends (US withholding 10%). Currency gains/losses also taxable.',
    pros: [
      'Direct access to US ETFs with ultra-low expense ratios',
      'Broader investment universe (international stocks, options, etc.)',
      'Fractional shares available at some brokers',
      'Multi-currency accounts'
    ],
    cons: [
      'Currency exchange risk (JPY/USD fluctuations)',
      'Must file annual tax return (kakutei shinkoku)',
      'US dividend withholding tax (10%, partially recoverable)',
      'Potential reporting requirements (foreign asset reporting if over 50M yen)',
      'Transfer fees may apply'
    ],
    expectedReturns: {
      conservative: { equity: 0.03, bond: 0.015, deposit: 0.002 },
      balanced: { equity: 0.05, bond: 0.02, deposit: 0.002 },
      aggressive: { equity: 0.07, bond: 0.03, deposit: 0.002 }
    },
    linkText: 'Open Account (Interactive Brokers)',
    linkUrl: 'https://www.interactivebrokers.com/',
    color: '#F59E0B' // amber
  },

  savings: {
    id: 'savings',
    name: 'Savings & Government Bonds',
    shortName: 'Savings/Bonds',
    description: 'Bank deposits and Japanese government bonds (JGBs). Capital is protected but returns are minimal. Best suited as an emergency fund or for very conservative investors.',
    monthlyContributionLimit: null,
    annualContributionLimit: null,
    taxRate: 0.20315, // interest taxed at 20.315%
    withdrawalTaxNote: 'Interest income taxed at 20.315% (withheld at source). Government bonds: minimum holding period of 1 year.',
    pros: [
      'Principal protection (deposits insured up to 10M yen per bank)',
      'Extremely low risk',
      'High liquidity (savings accounts)',
      'Government bonds backed by Japanese government'
    ],
    cons: [
      'Very low returns (often below inflation)',
      'Interest taxed at 20.315%',
      'Opportunity cost vs. equity investments',
      'Government bonds have 1-year minimum holding period'
    ],
    expectedReturns: {
      conservative: { equity: 0, bond: 0.005, deposit: 0.002 },
      balanced: { equity: 0, bond: 0.005, deposit: 0.002 },
      aggressive: { equity: 0, bond: 0.005, deposit: 0.002 }
    },
    linkText: 'Learn About Government Bonds',
    linkUrl: 'https://www.mof.go.jp/english/policy/jgbs/index.html',
    color: '#6B7280' // gray
  }
};

// Risk tolerance descriptions
const RISK_PROFILES = {
  conservative: {
    label: 'Conservative',
    description: 'Prioritize capital preservation. Lower returns but minimal risk.',
    allocation: { equity: 0.2, bond: 0.5, deposit: 0.3 },
    ranking: ['ideco', 'savings', 'tokutei', 'overseas']
  },
  balanced: {
    label: 'Balanced',
    description: 'Mix of growth and stability. Moderate risk for moderate returns.',
    allocation: { equity: 0.5, bond: 0.3, deposit: 0.2 },
    ranking: ['ideco', 'tokutei', 'overseas', 'savings']
  },
  aggressive: {
    label: 'Aggressive',
    description: 'Maximize growth potential. Higher risk for potentially higher returns.',
    allocation: { equity: 0.7, bond: 0.2, deposit: 0.1 },
    ranking: ['ideco', 'overseas', 'tokutei', 'savings']
  }
};

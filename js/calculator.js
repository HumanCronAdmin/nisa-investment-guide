// Investment simulation calculation logic

/**
 * Calculate compound interest with monthly contributions
 * Formula: FV = PMT * [((1 + r/12)^(12*t) - 1) / (r/12)]
 * where PMT = monthly payment, r = annual rate, t = years
 */
function calculateCompoundReturn(monthlyAmount, annualRate, years) {
  if (annualRate === 0) {
    return monthlyAmount * 12 * years;
  }
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;
  const futureValue = monthlyAmount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  return futureValue;
}

/**
 * Calculate blended annual return based on risk profile allocation
 */
function getBlendedReturn(option, riskLevel) {
  const allocation = RISK_PROFILES[riskLevel].allocation;
  const returns = option.expectedReturns[riskLevel];

  const blended =
    (returns.equity * allocation.equity) +
    (returns.bond * allocation.bond) +
    (returns.deposit * allocation.deposit);

  return blended;
}

/**
 * Calculate results for a single investment option
 */
function calculateOptionResult(optionId, monthlyAmount, years, riskLevel) {
  const option = INVESTMENT_OPTIONS[optionId];
  const blendedReturn = getBlendedReturn(option, riskLevel);

  // Cap monthly amount at contribution limit if applicable
  let effectiveMonthly = monthlyAmount;
  if (option.monthlyContributionLimit) {
    effectiveMonthly = Math.min(monthlyAmount, option.monthlyContributionLimit);
  }

  const totalContributed = effectiveMonthly * 12 * years;
  const grossValue = calculateCompoundReturn(effectiveMonthly, blendedReturn, years);
  const grossGain = grossValue - totalContributed;

  // Tax calculation
  let taxAmount = 0;
  let afterTaxValue = grossValue;

  if (optionId === 'ideco') {
    // iDeCo: tax-free during accumulation
    // Simplified: at withdrawal, retirement income deduction applies
    // Retirement income deduction: 800,000 * years (up to 20 years) or 700,000 * (years - 20) + 8,000,000
    let retirementDeduction;
    if (years <= 20) {
      retirementDeduction = 400000 * years;
    } else {
      retirementDeduction = 8000000 + 700000 * (years - 20);
    }
    const taxableGain = Math.max(0, grossGain - retirementDeduction) * 0.5; // half of excess is taxable
    taxAmount = taxableGain * 0.20315; // simplified marginal rate
    afterTaxValue = grossValue - taxAmount;

    // Tax savings from contribution deductions (income tax + resident tax)
    // Assume marginal rate of ~30% (20% income + 10% resident)
    const annualTaxSaving = effectiveMonthly * 12 * 0.30;
    const totalTaxSaving = annualTaxSaving * years;
    afterTaxValue += totalTaxSaving; // add back tax savings
  } else if (optionId === 'overseas') {
    // Overseas: same tax rate but add currency risk impact
    taxAmount = Math.max(0, grossGain) * option.taxRate;
    afterTaxValue = grossValue - taxAmount;
    // Note: currency risk is informational, not applied to calculation
  } else {
    // Tokutei & Savings: straightforward tax on gains
    taxAmount = Math.max(0, grossGain) * option.taxRate;
    afterTaxValue = grossValue - taxAmount;
  }

  const afterTaxGain = afterTaxValue - totalContributed;
  const annualizedReturn = years > 0 && totalContributed > 0
    ? (Math.pow(afterTaxValue / totalContributed, 1 / years) - 1)
    : 0;

  return {
    optionId,
    name: option.name,
    shortName: option.shortName,
    effectiveMonthly,
    totalContributed,
    grossValue: Math.round(grossValue),
    grossGain: Math.round(grossGain),
    taxAmount: Math.round(taxAmount),
    afterTaxValue: Math.round(afterTaxValue),
    afterTaxGain: Math.round(afterTaxGain),
    annualizedReturn,
    blendedReturn,
    color: option.color,
    capped: option.monthlyContributionLimit && monthlyAmount > option.monthlyContributionLimit
  };
}

/**
 * Calculate results for all investment options
 */
function calculateAllResults(monthlyAmount, years, riskLevel) {
  const results = Object.keys(INVESTMENT_OPTIONS).map(optionId =>
    calculateOptionResult(optionId, monthlyAmount, years, riskLevel)
  );

  // Sort by recommendation ranking based on risk profile
  const ranking = RISK_PROFILES[riskLevel].ranking;
  const ranked = ranking.map((optionId, index) => {
    const result = results.find(r => r.optionId === optionId);
    return { ...result, rank: index + 1 };
  });

  return ranked;
}

/**
 * Format number as Japanese Yen
 */
function formatYen(amount) {
  return '\u00a5' + Math.round(amount).toLocaleString('en-US');
}

/**
 * Format percentage
 */
function formatPercent(decimal) {
  return (decimal * 100).toFixed(2) + '%';
}

/**
 * Main comparison function - called when user clicks Compare
 */
function runComparison() {
  const monthlyAmount = parseInt(document.getElementById('monthlyAmount').value, 10);
  const years = parseInt(document.getElementById('investmentPeriod').value, 10);
  const riskLevel = document.querySelector('input[name="riskTolerance"]:checked')?.value;

  if (!monthlyAmount || !years || !riskLevel) {
    alert('Please fill in all fields.');
    return;
  }

  const results = calculateAllResults(monthlyAmount, years, riskLevel);

  // Show results section
  document.getElementById('resultsSection').classList.remove('hidden');
  gtag('event', 'investment_simulated', {monthly_amount: monthlyAmount, period_years: years, risk_level: riskLevel});

  // Render chart
  renderComparisonChart(results);

  // Render comparison table
  renderComparisonTable(results, monthlyAmount);

  // Render recommendations
  renderRecommendations(results, riskLevel);

  // Scroll to results
  document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Render the comparison table
 */
function renderComparisonTable(results, originalMonthly) {
  const tbody = document.getElementById('comparisonTableBody');
  tbody.innerHTML = '';

  results.forEach(r => {
    const option = INVESTMENT_OPTIONS[r.optionId];
    const row = document.createElement('tr');
    row.className = 'border-b border-gray-700 hover:bg-gray-750';
    row.innerHTML = `
      <td class="py-3 px-4">
        <span class="font-semibold" style="color: ${r.color}">${r.shortName}</span>
        ${r.capped ? '<br><span class="text-xs text-yellow-400">*Capped at ' + formatYen(option.monthlyContributionLimit) + '/mo</span>' : ''}
      </td>
      <td class="py-3 px-4 text-right">${formatYen(r.totalContributed)}</td>
      <td class="py-3 px-4 text-right">${formatYen(r.grossValue)}</td>
      <td class="py-3 px-4 text-right">${formatYen(r.grossGain)}</td>
      <td class="py-3 px-4 text-right text-red-400">-${formatYen(r.taxAmount)}</td>
      <td class="py-3 px-4 text-right font-bold text-green-400">${formatYen(r.afterTaxValue)}</td>
      <td class="py-3 px-4 text-right">${formatPercent(r.annualizedReturn)}</td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Render recommendation rankings
 */
function renderRecommendations(results, riskLevel) {
  const container = document.getElementById('recommendations');
  const profile = RISK_PROFILES[riskLevel];

  container.innerHTML = `
    <h3 class="text-xl font-bold mb-2 text-white">Recommended Order for ${profile.label} Investors</h3>
    <p class="text-gray-400 mb-4">${profile.description}</p>
    <div class="space-y-3">
      ${results.map(r => {
        const option = INVESTMENT_OPTIONS[r.optionId];
        const medalColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600', 'text-gray-500'];
        const medals = ['1st', '2nd', '3rd', '4th'];
        return `
          <div class="flex items-start gap-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${medalColors[r.rank - 1]}" style="background-color: ${r.color}22; border: 2px solid ${r.color}">
              ${medals[r.rank - 1]}
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-white">${r.shortName}</h4>
              <p class="text-sm text-gray-400">${option.description.substring(0, 120)}...</p>
              <p class="text-sm mt-1">
                <span class="text-green-400 font-medium">After-tax value: ${formatYen(r.afterTaxValue)}</span>
                <span class="text-gray-500 ml-2">(${formatPercent(r.annualizedReturn)} annualized)</span>
              </p>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Slider sync
function syncSlider() {
  const slider = document.getElementById('monthlySlider');
  const input = document.getElementById('monthlyAmount');
  input.value = slider.value;
}

function syncInput() {
  const slider = document.getElementById('monthlySlider');
  const input = document.getElementById('monthlyAmount');
  let val = parseInt(input.value, 10);
  if (isNaN(val)) val = 10000;
  if (val < 10000) val = 10000;
  if (val > 500000) val = 500000;
  input.value = val;
  slider.value = val;
}

// Display formatted amount
function updateDisplayAmount() {
  const input = document.getElementById('monthlyAmount');
  const display = document.getElementById('amountDisplay');
  const val = parseInt(input.value, 10);
  if (!isNaN(val)) {
    display.textContent = formatYen(val) + ' /month';
  }
}

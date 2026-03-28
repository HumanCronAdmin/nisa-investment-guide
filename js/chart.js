// Chart.js comparison chart rendering

let comparisonChart = null;

/**
 * Render bar chart comparing after-tax values across investment options
 */
function renderComparisonChart(results) {
  const ctx = document.getElementById('comparisonChartCanvas').getContext('2d');

  // Destroy existing chart if any
  if (comparisonChart) {
    comparisonChart.destroy();
  }

  const labels = results.map(r => r.shortName);
  const afterTaxData = results.map(r => r.afterTaxValue);
  const contributedData = results.map(r => r.totalContributed);
  const taxData = results.map(r => r.taxAmount);
  const colors = results.map(r => r.color);

  comparisonChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Total Contributed',
          data: contributedData,
          backgroundColor: colors.map(c => c + '44'),
          borderColor: colors.map(c => c + '88'),
          borderWidth: 1
        },
        {
          label: 'After-Tax Value',
          data: afterTaxData,
          backgroundColor: colors.map(c => c + 'CC'),
          borderColor: colors,
          borderWidth: 2
        },
        {
          label: 'Tax Paid',
          data: taxData,
          backgroundColor: '#EF444488',
          borderColor: '#EF4444',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#D1D5DB',
            font: { size: 13 }
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.dataset.label + ': ' + formatYen(context.raw);
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#9CA3AF', font: { size: 12 } },
          grid: { color: '#374151' }
        },
        y: {
          ticks: {
            color: '#9CA3AF',
            font: { size: 12 },
            callback: function (value) {
              if (value >= 10000000) {
                return (value / 10000000).toFixed(1) + 'M';
              } else if (value >= 10000) {
                return (value / 10000).toFixed(0) + 'K';
              }
              return value;
            }
          },
          grid: { color: '#374151' }
        }
      }
    }
  });
}

// Assuming Chart.js is already included in your HTML
// and a canvas element with id="myChart" exists.

function linearModel(x, a, b) {
    return a * x + b;
}

function calculateSpendingReduction(startingValue, startYear, endYear, annualReduction) {
    let spendingReduction = [startingValue];
    for (let year = startYear + 1; year <= endYear; year++) {
        let previousYearSpending = spendingReduction[spendingReduction.length - 1];
        spendingReduction.push(previousYearSpending * (1 - annualReduction));
    }
    return spendingReduction;
}

function calculateLinearRegression(years, spending) {
    // Simple linear regression
    let n = years.length;
    let sum_x = years.reduce((a, b) => a + b, 0);
    let sum_y = spending.reduce((a, b) => a + b, 0);
    let sum_xy = years.map((year, idx) => year * spending[idx]).reduce((a, b) => a + b, 0);
    let sum_xx = years.map(year => year * year).reduce((a, b) => a + b, 0);
    let slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    let intercept = (sum_y - slope * sum_x) / n;

    return [slope, intercept];
}

function createProjectedData(years, spending, startYear, endYear) {
    let [slope, intercept] = calculateLinearRegression(years, spending);
    let projectedSpending = [];
    for (let year = startYear; year <= endYear; year++) {
        projectedSpending.push(linearModel(year, slope, intercept));
    }
    return projectedSpending;
}

// Given data
let yearsProvided = Array.from({length: 2022 - 1973}, (_, i) => i + 1973);
let spendingProvided = [
    0.68, 0.69, 0.70, 0.71, 0.72, 0.73, 0.74, 0.75, 0.76, 0.77,
    0.78, 0.79, 0.80, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87,
    0.88, 0.90, 0.92, 0.94, 0.96, 1.00, 1.03, 1.09, 1.14, 1.21,
    1.28, 1.34, 1.39, 1.42, 1.47, 1.54, 1.57, 1.62, 1.63, 1.62,
    1.63, 1.64, 1.66, 1.69, 1.74, 1.82, 1.91, 1.92, 1.98
];

let startYear = 2000;
let lastProvidedYear = 2021;
let startSpendingValue = spendingProvided[startYear - yearsProvided[0]];
let endSpendingValue = spendingProvided[lastProvidedYear - yearsProvided[0]];
let yearsRange = lastProvidedYear - startYear;
let percentageIncrease = (endSpendingValue / startSpendingValue - 1) * 100;
let averageAnnualPercentageIncrease = percentageIncrease / yearsRange;

// Using the model to project future spending
let projectionEndYear = 2100;
let spending2023 = linearModel(2023, ...calculateLinearRegression(yearsProvided, spendingProvided));
let projectedFilteredSpending = createProjectedData(yearsProvided, spendingProvided, 2023, projectionEndYear);
let spendingReduction = calculateSpendingReduction(spending2023, 2023, projectionEndYear, 0.01);
let spendingFreeze = Array(projectionEndYear - 2023 + 1).fill(spending2023);

// Adjust labels to start from 1973 up to the projectionEndYear, ensuring projections start at 2023
let adjustedLabels = yearsProvided.concat(Array.from({length: projectionEndYear - 2021}, (_, i) => i + 2022));

// Adjust projectedFilteredSpending to start from 2023
let adjustedProjectedFilteredSpending = Array(lastProvidedYear - yearsProvided[0] + 1).fill(null).concat(projectedFilteredSpending.slice(lastProvidedYear - startYear + 1));

// Adjust spendingReduction to start from 2023
let adjustedSpendingReduction = Array(lastProvidedYear - yearsProvided[0] + 1).fill(null).concat(spendingReduction);

// Adjust spendingFreeze to start from 2023
let adjustedSpendingFreeze = Array(lastProvidedYear - yearsProvided[0] + 1).fill(null).concat(spendingFreeze);

let chartData = {
    type: 'line',
    data: {
        labels: adjustedLabels,
        datasets: [
            {
                label: 'Historical Data',
                data: spendingProvided,
                borderColor: 'blue',
                fill: false
            },
            {
                label: 'Projected Status Quo',
                data: adjustedProjectedFilteredSpending,
                borderColor: 'red',
                fill: false
            },
            {
                label: 'Projected 1% Reduction',
                data: adjustedSpendingReduction,
                borderColor: 'green',
                borderDash: [5, 5],
                fill: false
            },
            {
                label: 'Projected Spending Freeze',
                data: adjustedSpendingFreeze,
                borderColor: 'magenta',
                borderDash: [5, 5],
                fill: false
            }
        ]
    },
    options: {
        // ... (Chart.js options here)
    }
};

let ctx = document.getElementById('myChart').getContext('2d');
let myChart = new Chart(ctx, chartData);

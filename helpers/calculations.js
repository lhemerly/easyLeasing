/**
 * Calculates the term of a contract in months based on start and end dates
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {number} term
 */
function calculateTerm(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
  return diffMonths;
}

/**
 * Generates installments for a contract based on the contract value, start date, term and interest rate
 * @param {number} contractValue
 * @param {Date} startDate
 * @param {number} term
 * @param {number} interestRate
 * @returns {Array} installments
 */
function generateInstallments(installmentValue, startDate, term, interestRate) {
  const installments = [];
  const start = new Date(startDate);
  for (let i = 1; i <= term; i++) {
    const dueDate = new Date(start.getTime());
    dueDate.setMonth(start.getMonth() + i);

    const presentValueAdjustment = (
      installmentValue *
      (1 - Math.pow(1 + interestRate, i - 1))
    ).toFixed(2);

    installments.push({
      installment_number: i,
      due_date: dueDate,
      installment_amount: parseFloat(installmentValue),
      present_value_adjustment: parseFloat(presentValueAdjustment),
    });
  }

  return installments;
}

/**
 * Calculates the right of use asset value based on the present value of the installment schedule.
 * @param {Array} installments - An array of installment objects with present value adjustment.
 * @returns {Number} rightOfUseAsset - The calculated right of use asset value.
 */
function calculateRightOfUseAsset(installments) {
  let rightOfUseAsset = 0;

  console.log(installments);

  for (const installment of installments) {
    rightOfUseAsset +=
      installment.installment_amount + installment.present_value_adjustment;
  }

  return rightOfUseAsset;
}

module.exports = {
  calculateTerm,
  generateInstallments,
  calculateRightOfUseAsset,
};

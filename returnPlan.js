function doGet(e) {
  if (e.parameter.name === 'RATE') {
  let periods = Number(e.parameter.periods);
  let payment = Number(e.parameter.payment);
  let present = Number(e.parameter.present);
  let returnValue = ContentService.createTextOutput(((((1 + RATE(periods, payment, present)) ** 12 - 1) * 100).toFixed(2)));
  return returnValue ;
  } else if (e.parameter.name === 'calcLoan') {
    let impSF = Number(e.parameter.impSF);
    let disc = Number(e.parameter.discount);
    let loanAmount = ContentService.createTextOutput(calculateLoanAmount(impSF, disc));
    return loanAmount;
  } else if(e.parameter.name === 'pmt') {
    let loanAmount = Number(e.parameter.loanAmount);
    let ir = Number(e.parameter.ir);
    let response = ContentService.createTextOutput(-pmt(ir / 12, 120, loanAmount, 0, 0).toFixed(2) + 5.99);
    return response;
  }
}


/*
 * @usage RATE($periods, $payment, $present, $future, $type, $guess)
 */

function RATE (periods, payment, present, future, type, guess) {
    guess = guess === undefined ? 0.01 : guess;
    future = future === undefined ? 0 : future;
    type = type === undefined ? 0 : type;

    // Set maximum epsilon for end of iteration
    var epsMax = 1e-10;

    // Set maximum number of iterations
    var iterMax = 128;

    // Implement Newton's method
    var y,
        y0,
        y1,
        x0,
        x1 = 0,
        f = 0,
        i = 0;
    var rate = guess;
    if (Math.abs(rate) < epsMax) {
        y =
            present * (1 + periods * rate) +
            payment * (1 + rate * type) * periods +
            future;
    } else {
        f = Math.exp(periods * Math.log(1 + rate));
        y = present * f + payment * (1 / rate + type) * (f - 1) + future;
    }
    y0 = present + payment * periods + future;
    y1 = present * f + payment * (1 / rate + type) * (f - 1) + future;
    i = x0 = 0;
    x1 = rate;
    while (Math.abs(y0 - y1) > epsMax && i < iterMax) {
        rate = (y1 * x0 - y0 * x1) / (y1 - y0);
        x0 = x1;
        x1 = rate;
        if (Math.abs(rate) < epsMax) {
            y =
                present * (1 + periods * rate) +
                payment * (1 + rate * type) * periods +
                future;
        } else {
            f = Math.exp(periods * Math.log(1 + rate));
            y = present * f + payment * (1 / rate + type) * (f - 1) + future;
        }
        y0 = y1;
        y1 = y;
        ++i;
    }
    return rate;
};


function calculateLoanAmount(impSF, disc) {
let loanAmount = (((impSF/(1-disc))-impSF)*1.21)+impSF;
return loanAmount;
}

/**
 * @param rate_per_period       The interest rate for the loan.
 * @param number_of_payments    The total number of payments for the loan in months.
 * @param present_value         The present value, or the total amount that a series of future payments is worth now;
 *                              Also known as the principal.
 * @param future_value          The future value, or a cash balance you want to attain after the last payment is made.
 *                              If fv is omitted, it is assumed to be 0 (zero), that is, the future value of a loan is 0.
 * @param type                  Optional, defaults to 0. The number 0 (zero) or 1 and indicates when payments are due.
 *                              0 = At the end of period
 *                              1 = At the beginning of the period
 * @returns {number}
 */
function pmt(
  rate_per_period,
  number_of_payments,
  present_value,
  future_value,
  type
) {
  future_value = typeof future_value !== "undefined" ? future_value : 0;
  type = typeof type !== "undefined" ? type : 0;

  if (rate_per_period != 0.0) {
    // Interest rate exists
    var q = Math.pow(1 + rate_per_period, number_of_payments);
    return (
      -(rate_per_period * (future_value + q * present_value)) /
      ((-1 + q) * (1 + rate_per_period * type))
    );
  } else if (number_of_payments != 0.0) {
    // No interest rate, but number of payments exists
    return -(future_value + present_value) / number_of_payments;
  }

  return 0;
}

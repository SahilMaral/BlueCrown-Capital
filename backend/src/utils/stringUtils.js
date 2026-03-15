/**
 * Utility to convert numeric amounts to Indian Rupees in words
 */
const numberToWords = (num) => {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convert = (n) => {
    let word = '';
    if (n >= 10000000) {
      word += convert(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      word += convert(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      word += convert(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      word += convert(Math.floor(n / 100)) + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      word += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      word += teens[n - 10] + ' ';
      n = 0;
    }
    if (n > 0) {
      word += ones[n] + ' ';
    }
    return word.trim();
  };

  const amountParts = num.toString().split('.');
  const integerPart = parseInt(amountParts[0], 10);
  const decimalPart = amountParts[1] ? parseInt(amountParts[1].padEnd(2, '0').slice(0, 2), 10) : 0;

  let result = convert(integerPart) + ' Rupees';
  if (decimalPart > 0) {
    result += ' and ' + convert(decimalPart) + ' Paise';
  }
  
  return result.trim() + ' Only';
};

module.exports = { numberToWords };

import { getCardName, validateCard } from 'credit-card-validator';

export default function validateCreditCard(number) {
  const valid = validateCard(number);
  if (!valid && /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/.test(number)) {
    return {valid: true, type: 'diners'};
  }
  return {valid, type: getCardName(number)};
}
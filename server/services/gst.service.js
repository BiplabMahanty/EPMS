const calculateGST = (lineItems, businessState, placeOfSupply) => {
  const isInterState = businessState && placeOfSupply && businessState !== placeOfSupply;
  let subtotal = 0, totalDiscount = 0, cgst = 0, sgst = 0, igst = 0;

  const items = lineItems.map((item) => {
    const base = item.qty * item.rate;
    const discountAmt = item.discountType === 'percent'
      ? (base * item.discount) / 100
      : (item.discount || 0);
    const taxable = base - discountAmt;
    const gstAmt = (taxable * (item.gstRate || 0)) / 100;
    const amount = taxable + gstAmt;

    subtotal += taxable;
    totalDiscount += discountAmt;
    if (isInterState) igst += gstAmt;
    else { cgst += gstAmt / 2; sgst += gstAmt / 2; }

    return { ...item, gstAmount: gstAmt, amount };
  });

  return { items, subtotal, totalDiscount, cgst, sgst, igst };
};

module.exports = { calculateGST };

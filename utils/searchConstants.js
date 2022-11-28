const productQueryParams = {
  price: {
    asc: { price: "asc" },
    desc: { price: "desc" },
    default: {},
  },
  date: {
    newest: { createdAt: "desc" },
    latest: { createdAt: "asc" },
    default: { createdAt: "desc" },
  },
  totalSales: {
    true: { totalSales: "desc" },
    default: {},
  },
  /* status: {
        disabled: { isDisabled: true },
        notDisabled: { isDisabled: false },
        all: {},
        default: { isDisabled: false },
    }, */
};

const commentQueryParams = {
  date: {
    newest: { createdAt: "desc" },
    latest: { createdAt: "asc" },
    default: { createdAt: "desc" },
  },
  status: {
    disabled: { isDisabled: true },
    notDisabled: { isDisabled: false },
    all: {},
    default: { isDisabled: false },
  },
};

// const orderQueryParams = {
//     date: {
//         newest: { createdAt: 'desc' },
//         latest: { createdAt: 'asc' },
//         default: { createdAt: 'desc' },
//     },
//     status: {
//         disabled: { isDisabled: true },
//         notDisabled: { isDisabled: false },
//         all: {},
//         default: { isDisabled: false },
//     },
// };

const orderQueryParams = {
  date: {
    newest: { createdAt: "desc" },
    latest: { createdAt: "asc" },
    default: { createdAt: "desc" },
  },
  orderStatus: {
    placed: { status: "Placed" },
    approved: { status: "Approved" },
    delivering: { status: "Delivering" },
    paid: { status: "Paid" },
    completed: { status: "Completed" },
    failed: { status: "Failed" },
    cancelled: { status: "Cancelled" },
    default: {},
  },
};

const userQueryParams = {
  date: {
    newest: { createdAt: "desc" },
    latest: { createdAt: "asc" },
    default: { createdAt: "desc" },
  },
  status: {
    disabled: { isDisabled: true },
    notDisabled: { isDisabled: false },
    all: {},
    default: { isDisabled: false },
  },
};

const categoryQueryParams = {
  date: {
    newest: { createdAt: "desc" },
    latest: { createdAt: "asc" },
    default: { createdAt: "desc" },
  },
  status: {
    disabled: { isDisabled: true },
    notDisabled: { isDisabled: false },
    all: {},
    default: { isDisabled: false },
  },
};

const producerQueryParams = {
  date: {
    newest: { createdAt: "desc" },
    latest: { createdAt: "asc" },
    default: { createdAt: "desc" },
  },
  status: {
    disabled: { isDisabled: true },
    notDisabled: { isDisabled: false },
    all: {},
    default: { isDisabled: false },
  },
};

const validateConstants = function (reference, constant, constantField) {
  constantField = constantField
    ? constantField.toString().trim().toLowerCase()
    : "";
  return reference[constant].hasOwnProperty(constantField)
    ? reference[constant][constantField]
    : reference[constant]["default"];
};

const priceRangeFilter = (minPrice, maxPrice) => {
  if (minPrice >= 0 && maxPrice >= 0) {
    if (minPrice > maxPrice) {
      const temp = minPrice;
      minPrice = maxPrice;
      maxPrice = temp;
    }
    return { price: { $gte: minPrice, $lte: maxPrice } };
  }
  return {};
};

const ratingFilter = (value) => {
  if (value == 5) {
    return { rating: value };
  } else if (value >= 0 && value < 5) {
    return { rating: { $gte: value, $lte: 5 } };
  }
  return {};
};

export {
  productQueryParams,
  commentQueryParams,
  orderQueryParams,
  userQueryParams,
  categoryQueryParams,
  producerQueryParams,
  validateConstants,
  priceRangeFilter,
  ratingFilter,
};

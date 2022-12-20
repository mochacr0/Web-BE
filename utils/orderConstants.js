const orderUpdateStatus = {
  Placed: {
    excludedStatus: '',
    includedStatus: [],
    updateAuthorities: ['user'],
    cancelAuthorities: ['user', 'admin'],
  },
  Approved: {
    excludedStatus: '',
    includedStatus: 'Placed',
    updateAuthorities: ['admin'],
    cancelAuthorities: ['admin'],
  },
  Delivering: {
    excludedStatus: '',
    includedStatus: 'Approved',
    updateAuthorities: ['admin', 'shipper'],
    cancelAuthorities: [],
  },
  Paid: {
    excludedStatus: 'Failed',
    includedStatus: 'Delivering',
    updateAuthorities: ['shipper'],
    cancelAuthorities: [],
  },
  Failed: {
    excludedStatus: 'Paid',
    includedStatus: 'Delivering',
    updateAuthorities: ['admin'],
    cancelAuthorities: ['admin'],
  },
  Completed: {
    excludedStatus: 'Failed',
    includedStatus: 'Paid',
    updateAuthorities: ['admin'],
    cancelAuthorities: [],
  },
};

const validateStatus = (order, status, role) => {
  status = status ? status.toString().trim() : '';
  if (order.status == 'Completed' || order.status == 'Cancelled') {
    return `Order had been ${order.status.toLowerCase()}`;
  }
  if (status.length == 0) {
    return 'Status is not provided';
  }
  if (!orderUpdateStatus.hasOwnProperty(status)) {
    return `Status ${status} is not supported`;
  }
  if (!orderUpdateStatus[status].updateAuthorities.includes(role)) {
    return `Order status '${status}' can not be updated by ${role}`;
  }
  if (
    status == 'Cancelled' &&
    !orderUpdateStatus[status].cancelAuthorities.includes(role)
  ) {
    return `Order with current status '${order.status}' cannot be cancelled by ${role}`;
  }
  const includedStatusHistory = order.statusHistory.find(
    (history) => history.status == orderUpdateStatus[status].includedStatus
  );
  if (!includedStatusHistory) {
    return `Order need to be '${orderUpdateStatus[status].includedStatus}' before changing to '${status}`;
  }
  const excludedStatusHistory = order.statusHistory.find(
    (history) => history.status == orderUpdateStatus[status].excludedStatus
  );
  if (excludedStatusHistory) {
    return `Cannot change status from '${
      order.statusHistory[order.statusHistory.length - 1].status
    }' to '${status}`;
  }
  return '';
};

const validateStatusBeforeCancel = (order, role) => {
  if (order.status == 'Completed' || order.status == 'Cancelled') {
    return `Order had been ${order.status.toLowerCase()}`;
  }
  if (!orderUpdateStatus[order.status].cancelAuthorities.includes(role)) {
    return `Order with current status '${order.status}' cannot be cancelled by ${role}`;
  }
  return '';
};

export { orderUpdateStatus, validateStatus, validateStatusBeforeCancel };

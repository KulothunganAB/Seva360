/**
 * Scope data to the user's district for admin and citizen roles.
 */
const filterByUserDistrict = (items, user, field = 'district') => {
  if (!user?.district || (user.role === 'admin' && user.district === 'All')) {
    return items;
  }
  if (user.role === 'admin' || user.role === 'citizen') {
    return items.filter((item) => item[field] === user.district);
  }
  return items;
};

const assertAdminDistrict = (user, targetDistrict) => {
  if (user.role !== 'admin') return true;
  if (!user.district || user.district === 'All') return true;
  return user.district === targetDistrict;
};

module.exports = { filterByUserDistrict, assertAdminDistrict };

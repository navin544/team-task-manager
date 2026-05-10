function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSearchRegex(value) {
  return new RegExp(escapeRegExp(value.trim()), 'i');
}

module.exports = {
  buildSearchRegex
};

function Pluralize(singular, plural, count) {
  return count > 1 ? plural : singular;
}

export default Pluralize;

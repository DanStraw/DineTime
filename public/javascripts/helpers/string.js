function removeSpaces(term) {
  term = term.split("");
  for (let i = 0; i < term.length; i++) {
    if (term[i] === " ") {
      term.splice(i, 1);
    }
  }
  return term.join("");
}
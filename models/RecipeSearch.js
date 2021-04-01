class RecipeSearch {
  constructor(_searchTerm, _type, _results = []) {
    this.searchTerm = _searchTerm;
    this.type = _type;
    this.results = _results;
  }
}

module.exports = {
  RecipeSearch: RecipeSearch
};
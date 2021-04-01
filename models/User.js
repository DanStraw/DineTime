class User {
  constructor(_email, _username, _password, _confirmPassword) {
    this.email = _email,
      this.username = _username,
      this.password = _password,
      this.confirmPassword = _confirmPassword || _password;
    this.recipes = {
      food: [{
        searchTerm: "pizza",
        resultsIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      }, {
        searchTerm: "apple",
        resultsIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      }],
      drink: [{
        searchTerm: "gin",
        resultsIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      }]
    }
  }
};

module.exports = User;
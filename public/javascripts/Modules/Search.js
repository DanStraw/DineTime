class Search {
  constructor(term, type) {
    this.term = term;
    this.type = type;
    this.ingredients = [];
    this.results = [];
  }

  async findItem() {
    const that = this;
    const id = removeSpaces(this.term);
    let found = false;
    this.type = this.type === 'food' ? 'dish' : this.type;
    await $.ajax({
      url: `/recipes/${this.type}/${removeSpaces(this.term)}`,
      dataType: 'JSON',
      method: 'GET'
    }).then(function (response) {
      console.log("found response: ", response);
      found = response ? true : false;
      console.log('found updated: ', found);
    });
    return found;
  }

  addIngredient(ingredient) {
    this.ingredients.push(ingredient);
  }

  removeIngredient(index) {
    this.ingredients.splice(1, index);
  }

  getTerm() {
    return this.term;
  }

  async drink() {
    const result = await $.ajax({
      url: `/recipes/drink/${removeSpaces(this.term)}`,
      type: 'POST',
      dataType: 'JSON'
    }).done(function (response) {
      if (response) {
        return response;
      } else {
        return swal("no response found");
      }
    });
    return result;

  };

  async dish() {
    const result = await $.ajax({
      url: `/recipes/dish/${removeSpaces(this.term)}`,
      type: 'POST',
      dataType: 'JSON',
      data: { searchTerm: this.term }
    })
      .done(function (response) {
        if (response) {

          return response;

        } else {
          console.log('dish save fail');
        }
      });
    return result;
  }
}
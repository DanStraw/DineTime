class Recipe {
  constructor(term, data, index) {
    this.term = term;
    this.data = data;
    this.index = index;
  }

  addInfo(_type, _html_attr, _text) {
    let info = $(`${_type}`);
    for (const key in _html_attr) {
      info.attr(key, _html_attr[key]);
    }
    _text ? info.text(_text) : null;
    return info;
  }

  addList(ingredientsLine, ingredients, measurements, _id) {
    let list = $('<ol>');
    list.attr("id", _id);
    if (ingredientsLine) {
      ingredientsLine.forEach(element => {
        list.append(`<li>${element}</li>`);
      });
      return list;
    }

    for (let i = 0; i < ingredients.length; i++) {
      list.append("<li>" + (measurements[i] || "") + " " + (ingredients[i] || "") + "</li>");
    }
    return list;
  }

  display() {
    const deleteVal = removeSpaces(this.term);
    let resultDiv = this.addInfo('<div>', { "class": 'resultItem col-md-5 offset-md-1' });
    const headerRow = this.addInfo('<div>', { "class": "row" }, null);
    var heading = this.addInfo("<h3>", { "id": "item-name", 'class': 'col-md-9' }, this.data.drinkName || this.data.strDrink || this.data.label || this.data.dishName);
    const deleteButton = this.addInfo('<button>', { 'class': 'col-md-2 delete-item', 'value': deleteVal + "-" + this.index }, 'X');
    var image = this.addInfo("<img>", { "src": this.data.picture || this.data.image || this.data.strDrinkThumb })


    //set ingredient and measurements
    if (!this.data.ingredients && !this.data.ingredientLines) {
      this.data.ingredients = [];
      this.data.measurements = [];
      let count = 0;
      for (let key in this.data) {
        if (key.includes("strIngredient")) {
          count++;
        }
      }
      for (let i = 0; i <= count; i++) {
        this.data.ingredients.push(this.data[`strIngredient${i + 1}`]);
        this.data.measurements.push(this.data[`strMeasure${i + 1}`]);
      }
    }

    var recipe = this.addList(this.data.ingredientLine, this.data.ingredients, (this.data.measurements || []), "recipe");
    var misc = this.addInfo("<p>", null, (this.data.calories ? "Calories: " + Math.round(this.data.calories) : this.data.type));
    const instruction_attributes = this.data.strInstructions ? { "id": "instructions" } : { "id": "instructions", "href": (this.data.recipe || this.data.url), "title": this.data.dishName + " Recipe" };
    var instructions = this.addInfo((this.data.strInstructions ? "<p>" : "<a>"), instruction_attributes, (!this.data.strInstructions ? "Link to Recipe" : this.data.strInstructions));

    headerRow.append(heading); // .append(deleteButton);
    resultDiv.append(headerRow);
    resultDiv.append(image);
    resultDiv.append(recipe);
    resultDiv.append(misc);
    resultDiv.append(instructions);

    return resultDiv;
  }
}
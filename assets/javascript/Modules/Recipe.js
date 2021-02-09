class Recipe {
  constructor(data) {
    this.data = data
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
    let imageDiv = this.addInfo('<div>', { "class": 'imgClass' });
    var image = this.addInfo("<img>", { "src": this.data.picture || this.data.image || this.data.strDrinkThumb })
    var heading = this.addInfo("<h3>", { "id": "item-name" }, this.data.drinkName || this.data.strDrink || this.data.label || this.data.dishName);

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

    imageDiv.append(heading);
    imageDiv.append(image);
    imageDiv.append(recipe);
    imageDiv.append(misc);
    imageDiv.append(instructions);

    return imageDiv;
  }
}
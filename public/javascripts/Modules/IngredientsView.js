class IngredientsView {
  constructor(ingredients) {
    this.ingredients = ingredients;
  }

  showIngredients() {
    $('#ingredients-list').empty();
    this.ingredients.forEach(ingredient => {
      let ingredientView = $('<button>');
      ingredientView.attr({ "id": ingredient, 'class': 'ingredient-item', 'data-trigger': 'hover', 'data-toggle': 'popover', 'title': 'Remove Ingredient' });
      ingredientView.text(ingredient);
      $('#ingredients-list').append(ingredientView);
    });
  }
}
$("#food-drink-view").hide();
$("#drink-history").hide();
$("#dish-history").hide();
$("#food-ingredients-search").hide();

var config = keys.firebase_config;
firebase.initializeApp(config);

var database = firebase.database();

const ingredientSearch = new Search(null, 'ingredient');

const clearInputFields = function () {
    $("#ingredient-input").val("");
    $("#food-input").val("");
    $("#drink-input").val("");
}

const resetResultsView = function () {
    $("#food-drink-view").empty();
    $("#food-drink-view").show();
}

const types = ['food', 'drink'];
types.forEach(type => {
    $(`#search-${type}`).on("click", function (event) {
        event.preventDefault();
        var term = $(`#${type}-input`).val().trim();
        if (term === "") {
            clearInputFields();
            return swal("You left the search box empty");
        } else {
            clearInputFields();
            searchRecipes(term, type);
        }
    })
});

function searchRecipes(term, type) {
    resetResultsView();
    let search = new Search(term, type);
    if (search.findItem()) {
        return swal(`${food} is already in food search history`)
    };
    type === 'food' ? search.dish() : search.drink();
}

database.ref().on("child_added", function (snapshot) {
    const historyItem = new HistoryItem(snapshot.val().searchTerm, removeSpaces(snapshot.val().searchTerm), snapshot.val().type, snapshot.val().results);
    historyItem.display();
    historyItem.showRecipes();
});

const toggleHistoryList = function (id) {
    $(id).is(":visible") ? $(id).hide() : $(id).show();
}

$("#dish-div").on("click", function () {
    toggleHistoryList(`#${$('#dish-div').attr("value")}`);
})
$("#drink-div").on("click", function () {
    toggleHistoryList(`#${$('#drink-div').attr("value")}`);
});

$("#add-ingredient").on('click', function (event) {
    event.preventDefault();
    let ingredient = $('#ingredient-input');
    ingredientSearch.addIngredient(ingredient[0].value);
    let ingredientsView = new IngredientsView(ingredientSearch.ingredients);
    ingredientsView.showIngredients();
    $('#ingredient-input').empty();
})

database.ref().on('child_removed', function (snapshot) {
    var deletedID = removeSpaces(snapshot.val().searchTerm);
    $("#" + deletedID).empty();
    $("#" + deletedID + "histdiv").empty();
})

function deleteHistory() {
    const historyItem = new HistoryItem(null, removeSpaces($(this)[0].value), null);
    historyItem.delete();
}

function showHistoryItemRecipes() {
    resetResultsView();
    var searchTerm = $(this).text().trim();
    database.ref(removeSpaces(searchTerm)).on("value", function (snapshot) {
        const historyItem = new HistoryItem(searchTerm, removeSpaces(searchTerm), null, snapshot.val().results);
        historyItem.showRecipes();
    })
}

$(document).on("click", ".history", showHistoryItemRecipes);
$(document).on("click", ".delete", deleteHistory);
$(document).on("click", ".delete-item", function () {
    let itemToDelete = $(this).val();
    const [key, index] = itemToDelete.split("-");
    const itemDeleteService = new FirebaseService({ key, index });
    itemDeleteService.findSearchResults();
    itemDeleteService.deleteRecipe();
    $("#food-drink-view").empty();
    itemDeleteService.saveResults();
});

$('#dish-type-select').change(function () {
    console.log('select changed');
    console.log($(this).val());
    switch ($(this).val()) {
        case 'ingredients':
            $('#food-recipe-search').hide();
            $('#food-input').empty();
            $("#food-ingredients-search").show();
            break;
        default:
            $('#food-ingredients-search').hide();
            $('#ingredient-input').empty();
            $("#food-recipe-search").show();
            break;
    }
})
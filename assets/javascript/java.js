// Food Search
$("#search-food").on("click", function (event) {
    event.preventDefault();

    var food = $("#food-input").val().trim();
    if (food !== "") {
        $("#food-input").val("")
        foodSearch(food);
    }

})  // End of $("#search-food").on("click", function (event) {}


// Drink Search
$("#search-drink").on("click", function (event) {
    event.preventDefault();

    var drink = $("#drink-input").val().trim();
    if (drink !== "") {
        $("#drink-input").val("")
        drinkSearch(drink);
    }

})  // End of $("#search-food").on("click", function (event) {}


// Food search function
function foodSearch(food) {
    var API_KEY = "fb001d1c57dffa88545ebe6f986046e9	";
    var APP_ID = "5f782d14";
    var queryURL = "https://api.edamam.com/search?app_id=" + APP_ID + "&app_key=" + API_KEY + "&q=" + food;

    $.ajax({
        url: queryURL,
        method: 'GET',
    }).then(function (response) {
        $("#food-drink-view").empty();

        for (var i = 0; i < response.hits.length; i++) {
            var imageDiv = $('<div>');
            imageDiv.addClass('imgClass');

            var image = $("<img>");
            image.attr("src", response.hits[i].recipe.image);
            imageDiv.append(image);

            var pOne = $("<p>").text("Label: " + response.hits[i].recipe.label);
            imageDiv.append(pOne);

            var pTwo = $("<p>").text("Ingredient: " + response.hits[i].recipe.ingredientLines);
            imageDiv.append(pTwo);

            var pThree = $("<p>").text("Calories: " + response.hits[i].recipe.calories);
            imageDiv.append(pThree);

            var pFour = $("<p>").text("Total Weight: " + response.hits[i].recipe.totalWeight);
            imageDiv.append(pFour);

            $("#food-drink-view").prepend(imageDiv);
        }


    })

}   //  End of function foodSearch(food){}



// Drink search function
function drinkSearch(drink) {
    var queryURL = "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=" + drink;

    // API response function
    $.ajax({
        url: queryURL,
        method: 'GET',
    }).then(function (response) {
        // $("#food-drink-view").empty();
        console.log(response)

        for (var i = 0; i < response.drinks.length; i++) {
            // var imageDiv = $('<div>');
            // imageDiv.addClass('imgClass');

            // Make an image div
            var image = $(".img");
            $(".img").attr("src", response.drinks[i].strDrinkThumb);
            imageDiv.append(image);

            var pOne = $("<p>").text("Drink-ID: " + response.drinks[i].idDrink);
            imageDiv.append(pOne);

            var pTwo = $("<p>").text("Drink Label: " + response.drinks[i].strDrink);
            imageDiv.append(pTwo);

            var pThree = $("<p>").text("Alcohol: " + response.drinks[i].strAlcoholic);
            imageDiv.append(pThree);
            var drinkObj = response.drinks[i]
            for (var j = 9; j < 23; j++) {
                var ingredient = drinkObj[Object.keys(drinkObj)[j]];
                if (ingredient !== "") {
                    var pFour = $("<p>").text("Ingredient: " + drinkObj[Object.keys(drinkObj)[j]]);
                    imageDiv.append(pFour);
                }
            }
            var pFive = $("<p>").text("Instruction: " + response.drinks[i].strInstructions);
            imageDiv.append(pFive);
            $("#food-drink-view").prepend(imageDiv);

        }

    })  // End of the response function

}   //  End of function foodSearch(food){}






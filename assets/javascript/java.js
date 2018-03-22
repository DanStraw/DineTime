// Initialize Firebase
var config = {
    apiKey: "AIzaSyDFxvI2pF2TVAL8YxlTKiIJsA3zAT8wT1I",
    authDomain: "dinetime-c2874.firebaseapp.com",
    databaseURL: "https://dinetime-c2874.firebaseio.com",
    projectId: "dinetime-c2874",
    storageBucket: "",
    messagingSenderId: "647476940046"
    };
    firebase.initializeApp(config);
    var database = firebase.database();
    
// Food Search
$("#search-food").on("click", function (event) {
    event.preventDefault();
    var food = $("#food-input").val().trim();
    console.log(food);
    if (food !== "") {
        $("#food-input").val("")
        foodSearch(food);
    }
    
    // alert window that shows nothing enter in the search box
    else{
        swal("You didn't enter anythink on the search box!");
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

    // alert window that shows nothing enter in the search box
    else{
        swal("You didn't enter anythink on the search box!");
    }
    

})  // End of $("#search-food").on("click", function (event) {}


// Food search function
function foodSearch(food) {
    $("#food-drink-view").empty();
    var API_KEY = "fb001d1c57dffa88545ebe6f986046e9";
    var APP_ID = "5f782d14";
    var corsProxy = "https://cors-anywhere.herokuapp.com/";
    var apiUrl = "https://api.edamam.com/search?app_id=" + APP_ID + "&app_key=" + API_KEY + "&q=" + food;
    var queryURL = corsProxy + apiUrl;
    $.ajax({
        url: queryURL,
        method: 'GET',
    }).then(function (data) {
        $("#food-drink-view").empty();
        console.log(data);
        for (var i = 0; i < data.hits.length; i++) {
            var image = data.hits[i].recipe.image;
            var dishName = data.hits[i].recipe.label;
            var ingredients = data.hits[i].recipe.ingredientLines;
            var calories = data.hits[i].recipe.calories;
            var weight = data.hits[i].recipe.totalWeight;

            database.ref().push( {
                dishName: dishName,
                ingredients: ingredients,
                calories: calories,
                image: image,
                weight: weight,
            });

            // var imageDiv = $('<div>');
            // imageDiv.addClass('imgClass');

            // var image = $("<img>");
            // image.attr("src", response.hits[i].recipe.image);
            // imageDiv.append(image);

            // var pOne = $("<p>").text("Label: " + response.hits[i].recipe.label);
            // imageDiv.append(pOne);

            // var pTwo = $("<p>").text("Ingredient: " + response.hits[i].recipe.ingredientLines);
            // imageDiv.append(pTwo);

            // var pThree = $("<p>").text("Calories: " + response.hits[i].recipe.calories);
            // imageDiv.append(pThree);

            // var pFour = $("<p>").text("Total Weight: " + response.hits[i].recipe.totalWeight);
            // imageDiv.append(pFour);

            // $("#food-drink-view").prepend(imageDiv);
        }


    })

}   //  End of function foodSearch(food){}



// Drink search function
function drinkSearch(drink) {
    $("#food-drink-view").empty();
    var queryURL = "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=" + drink;

    // API response function
    $.ajax({
        url: queryURL,
        method: 'GET',
    }).then(function (response) {
        $("#food-drink-view").empty();

        for (var i = 0; i < response.drinks.length; i++) {
            
            var drinkObj = response.drinks[i]
            var drinkName = drinkObj.strDrink
            var ingredients = [];
            var measurements = [];


            for (var j = 9; j < 23; j++) {
                var ingredient = drinkObj[Object.keys(drinkObj)[j]];
                var measurement = drinkObj[Object.keys(drinkObj)[j + 16]];
                if (ingredient !== "") {
                    ingredients.push(ingredient)
                    measurements.push(measurement);
                }    

            }
            database.ref().push( {
                drink: drinkName,
                ID: drinkObj.idDrink,
                type: drinkObj.strAlcoholic,
                ingredients: ingredients,
                measurements: measurements,
                picture: drinkObj.strDrinkThumb,
                instructions: drinkObj.strInstructions,
            });
        }

    })  // End of the response function

}   //  End of function foodSearch(food){}

database.ref().on("child_added", function(snapshot) {
    if ([Object.keys(snapshot.val())[1]] == "drink") {
        var imageDiv = $('<div>');
        imageDiv.addClass('imgClass');
        // Make an image div
        var image = $("<img>");
        image.attr("src", snapshot.val().picture);
        imageDiv.append(image);
        var pOne = $("<p>").text("Drink-ID: " + snapshot.val().ID);
        imageDiv.append(pOne);
        var pTwo = $("<p>").text("Drink Label: " + snapshot.val().drink);
        imageDiv.append(pTwo);
        var pThree = $("<p>").text("Alcohol: " + snapshot.val().type);
        imageDiv.append(pThree);
        var ingredients = snapshot.val().ingredients;
        var measurements = snapshot.val().measurements;
        var recipe = $("<div>");
        recipe.attr("id", "recipe");
        for (let i = 0; i < ingredients.length; i++) {
            $(recipe).append(measurements[i] + " " + ingredients[i] + ", ");  
        }
        imageDiv.append(recipe);
        var pFive = $("<p>").text("Instructions: " + snapshot.val().instructions);
        imageDiv.append(pFive);
        $("#food-drink-view").prepend(imageDiv);
    } else {
        var imageDiv = $('<div>');
        imageDiv.addClass('imgClass');

        // Make an image div
        var image = $("<img>");
        image.attr("src", snapshot.val().image);
        var pOne = $("<p>").text("Dish Name: " + snapshot.val().dishName);
        imageDiv.append(pOne);
        imageDiv.append(image);
        var pTwo = $("<p>").text("Ingredients: " + snapshot.val().ingredients);
        imageDiv.append(pTwo);
        var pThree = $("<p>").text("Calories: " + snapshot.val().calories);
        imageDiv.append(pThree);
        var pFour = $("<p>").text("Weight: " + snapshot.val().weight);
        imageDiv.append(pFour);
        $("#food-drink-view").prepend(imageDiv);
    }
})

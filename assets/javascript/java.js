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

$("#drink-history").hide();
$("#dish-history").hide();
var drinkHist = false;
var dishHist = false;
    
// Food Search
$("#search-food").on("click", function (event) {
    event.preventDefault();
    var food = $("#food-input").val().trim();
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
    console.log($("#liquor-type").value);
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
        var results = [];
        for (var i = 0; i < data.hits.length; i++) {
            var resultItem = {
                image: data.hits[i].recipe.image,
                dishName: data.hits[i].recipe.label,
                ingredients: data.hits[i].recipe.ingredientLines,
                calories: data.hits[i].recipe.calories,
                weight: data.hits[i].recipe.totalWeight,
            }
            results.push(resultItem);
        }
        database.ref().push( {
            SearchTerm: food,
            results: results,
        });
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
        $("#food-drink-view").empty();
        var results = [];  
        for (var i = 0; i < response.drinks.length; i++) {
            var drinkObj = response.drinks[i];
            var ingredients = [];
            var measurements = [];
            for (var j = 9; j < 23; j++) {
                var ingredient = drinkObj[Object.keys(drinkObj)[j]];
                var measurement = drinkObj[Object.keys(drinkObj)[j + 15]];
                if (ingredient !== "") {
                    ingredients.push(ingredient);
                    measurements.push(measurement);
                }    
            }
            var resultItem = {
                drinkName: drinkObj.strDrink,
                ID: drinkObj.idDrink,
                ingredients: ingredients,
                measurements: measurements,
                type: drinkObj.strAlcoholic,
                picture: drinkObj.strDrinkThumb,
                instructions: drinkObj.strInstructions,
            }
            results.push(resultItem);     
        }
        database.ref().push( {
            SearchTerm: drink,
            results: results,    
        });

    })  // End of the response function

}   //  End of function foodSearch(food){}

database.ref().on("child_added", function(snapshot) {
    var results = snapshot.val().results;
    var searchItem = snapshot.val().SearchTerm
    console.log([Object.keys(results[0])[1]]);
    if ([Object.keys(results[0])[1]] == "drinkName") {
        $("#drink-history").append("<li> " + searchItem + "</li>");
    } else {
        $("#dish-history").append("<li> " + searchItem + "</li>");
    }

    results.forEach(element => {   
        if ([Object.keys(element)[1]] == "drinkName") {
            var imageDiv = $('<div>');
            imageDiv.addClass('imgClass');
            // Make an image div
            var image = $("<img>");
            image.attr("src", element.picture);
            var pOne = $("<p>").text("Drink-ID: " + element.ID);
            var pTwo = $("<p>").text("Drink: " + element.drinkName);
            pTwo.attr("id", "item-name");
            imageDiv.append(pTwo);
            imageDiv.append(image);
            imageDiv.append(pOne);
            var pThree = $("<p>").text("Alcohol: " + element.type);
            imageDiv.append(pThree);
            var ingredients = element.ingredients;
            var measurements = element.measurements;
            var recipe = $("<ul>");
            recipe.attr("id", "recipe");
            for (let i = 0; i < ingredients.length; i++) {
                $(recipe).append("<li>" + measurements[i] + " " + ingredients[i] + "</li>");  
            }
            imageDiv.append(recipe);
            var pFive = $("<p>").text("Instructions: " + element.instructions);
            imageDiv.append(pFive);
            $("#food-drink-view").prepend(imageDiv);
        } else {
            var imageDiv = $('<div>');
            imageDiv.addClass('imgClass');

            // Make an image div
            var image = $("<img>");
            image.attr("src", element.image);
            var pOne = $("<p>").text("Dish Name: " + element.dishName);
            pOne.attr("id", "item-name");
            imageDiv.append(pOne);
            imageDiv.append(image);
            var pTwo = $("<ul>");
            var ingredients = element.ingredients;
            for (let i = 0; i < ingredients.length; i++) {
                $(pTwo).append("<li> -" + ingredients[i] + "</li>");  
            }
            imageDiv.append(pTwo);
            var pThree = $("<p>").text("Calories: " + element.calories);
            imageDiv.append(pThree);
            var pFour = $("<p>").text("Weight: " + element.weight);
            imageDiv.append(pFour);
            $("#food-drink-view").prepend(imageDiv);
        }
    });
})

$("#dish-div").on("click", function() {
    if (!dishHist) {
        $("#dish-history").show();
        dishHist = true;
    } else {
        $("#dish-history").hide();
        dishHist = false;
    }
    
})

$("#drink-div").on("click", function() {
    if (!drinkHist) {
        $("#drink-history").show();
        drinkHist = true;
    } else {
        $("#drink-history").hide();
        drinkHist = false;
    }   
})
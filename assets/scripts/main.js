$(document).ready(function () {
    
    //  Global variables
    var apiMovie = 'https://api.themoviedb.org/3/search/movie';
    var apiSeries = 'https://api.themoviedb.org/3/search/tv';
    var myToken = 'e80fd63011e84d9eb3ea864a957b8a81';
    var languageSearch = 'it-IT'; //Default language
    var resultsFeedback = 0;

    //  jQuery refs
    var inputSearch = $('#app__search-area__movie-search');
    var buttonSearch = $('.app__search-area button');
    var movieGround = $('#app__movie-ground');

    //  Init Handlebars
    var source = $('#movie-template').html();
    var template = Handlebars.compile(source);

    //  Search by hitting ENTER
    inputSearch.keydown(function (e) { 
        switch (e.which){
            case 13: // 13 is ENTER
                searchHandler(
                    apiMovie, 
                    apiSeries, 
                    myToken, 
                    template, 
                    inputSearch, 
                    movieGround, 
                    languageSearch,
                    resultsFeedback
                    );
                    checkerResults(resultsFeedback, inputSearch);
                break;
            default:
                break
        }
    });

    //  Search by clicking on the button
    buttonSearch.click(function () { 
        searchHandler(
            apiMovie, 
            apiSeries, 
            myToken, 
            template, 
            inputSearch, 
            movieGround, 
            languageSearch,
            resultsFeedback
            );
            checkerResults(resultsFeedback, inputSearch);
    });
    
}); //  END of DOCUMENT READY

/****************
*   FUNCTIONS   *
*****************/

// Search function
function searchHandler(apiMovie, apiSeries, myToken, template, input, destination, languageSearch, resultsFeedback){
        cleanAll(destination);
        var querySearch  = input.val();
        if (querySearch.trim() != ''){
            callAndSearch(
                apiMovie, 
                myToken, 
                languageSearch, 
                querySearch, 
                template, 
                destination, 
                'movie',
                resultsFeedback
                );
            callAndSearch(
                apiSeries, 
                myToken, 
                languageSearch, 
                querySearch, 
                template, 
                destination, 
                'series',
                resultsFeedback
                );
        }
        else {
            $('#app__movie-ground').html('Inserisci un valore nella ricerca');
            input.val('');
            input.focus();
        }
}

//  Ajax call for the search
function callAndSearch(api, token, language, query, template, destination, condition, resultsFeedback){
    $.ajax({
        type: "GET",
        url: api,
        data: {
            api_key : token,
            language : language,
            query : query
        },
        success: function (response) {
            var totalResults = response.results.length;
            //  If there are no elements matching the search criteria
            if (response.total_results === 0){
                return resultsFeedback +=1;
            }
            //  Matching search elements
            else {
                for (var i = 0; i < totalResults; i++){
                    printMovieCards(i, response, template, destination, condition);
                }
            }
        },
        error: function () {  
            console.log('Cannot retrieve the API, try again later');   
        }
    });
}

//  No matching results handler
function checkerResults(resultsFeedback, input){
    if (resultsFeedback == 0){
        $('#app__movie-ground').html('Nessun risultato trovato');
        input.select();
    }
}

//  Clean a destination
function cleanAll(destination){
    destination.html('');
}

//  Prepare and print the template for the movie cards
function printMovieCards(i, response, template, destination, condition){
    var thisResult = response.results[i];
    var starsAverage = countStars(thisResult.vote_average);
    var languageFlag = switchToFlag(thisResult.original_language);
    if (condition == 'movie'){
        var templateData = {
            title : thisResult.title,
            originalTitle : thisResult.original_title,
            originalLanguage : languageFlag,
            voteAverage : starsAverage,
            type : 'Film'
        };
    }
    else if (condition == 'series'){
        var templateData = {
            title : thisResult.name,
            originalTitle : thisResult.original_name,
            originalLanguage : languageFlag,
            voteAverage : starsAverage,
            type : 'Serie TV'
        };
    }
    var output = template(templateData);
    destination.append(output);
}

//  Show stars instead of numbers
function countStars(voteAverage){
    var normalizedAverage = Math.ceil(voteAverage/2);
    var evaluation = '';
    for (var fullStars = 1; fullStars <= normalizedAverage; fullStars++){
        evaluation += '<i class="fas fa-star" data-vote="'+ fullStars +'"></i>';
    }
    for (fullStars; fullStars <= 5; fullStars++){
        evaluation += '<i class="far fa-star" data-vote="'+ fullStars +'"></i>';
    }
    return evaluation;
}

//  Read the language and show a flag instead of chars
function switchToFlag(language){
    switch (language) {
        case 'it':
            return '<img class="flag" src="assets/img/it.svg" alt="lang_it">'
        case 'en':
            return '<img class="flag" src="assets/img/en.svg" alt="lang_en">'
        default:
            return language;
    }
}
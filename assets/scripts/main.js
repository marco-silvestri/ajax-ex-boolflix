$(document).ready(function () {
    
    //  Global variables
    var apiMovie = 'https://api.themoviedb.org/3/search/movie';
    var apiSeries = 'https://api.themoviedb.org/3/search/tv';
    var myToken = 'e80fd63011e84d9eb3ea864a957b8a81';
    var languageSearch = 'it-IT'; //Default language

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
                searchAndPrint(apiMovie, apiSeries, myToken, template, inputSearch, movieGround, languageSearch);
                break;
            default:
                break
        }
    });

    //  Search by clicking on the button
    buttonSearch.click(function () { 
        searchAndPrint(
            apiMovie, 
            apiSeries, 
            myToken, 
            template, 
            inputSearch, 
            movieGround, 
            languageSearch
            );
    });
}); //  END of DOCUMENT READY

/****************
*   FUNCTIONS   *
*****************/

function searchAndPrint(apiMovie, apiSeries, myToken, template, input, destination, languageSearch){
        cleanAll(destination);
        var querySearch  = input.val();
        if (querySearch.trim() != ''){
            callAndSearch(
                apiMovie, 
                myToken, 
                languageSearch, 
                querySearch, 
                input, 
                template, 
                destination, 
                'movie'
                );
            callAndSearch(
                apiSeries, 
                myToken, 
                languageSearch, 
                querySearch, 
                input, 
                template, 
                destination, 
                'series'
                );
        }
        else {
            $('#app__movie-ground').html('Inserisci un valore nella ricerca');
            input.val('');
            input.focus();
        }
}

function callAndSearch(api, token, language, query, input, template, destination, condition){
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
                $('#app__movie-ground').html('Nessun film trovato');
                input.select();
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

//  Clean a destination
function cleanAll(destination){
    destination.html('');
}

function printMovieCards(i, response, template, destination, condition){
    var thisResult = response.results[i];
    var starsAverage = countStars(thisResult.vote_average);
    if (condition == 'movie'){
        var templateData = {
            title : thisResult.title,
            originalTitle : thisResult.original_title,
            originalLanguage : thisResult.original_language,
            voteAverage : starsAverage,
            type : 'Film'
        };
    }
    else if (condition == 'series'){
        var templateData = {
            title : thisResult.name,
            originalTitle : thisResult.original_name,
            originalLanguage : thisResult.original_language,
            voteAverage : starsAverage,
            type : 'Serie TV'
        };
    }
    var output = template(templateData);
    destination.append(output);
}


function countStars(voteAverage){
    var normalizedAverage = Math.ceil(voteAverage/2);
    var evaluation = '';
    for (var fullStars = 0; fullStars < normalizedAverage; fullStars++){
        evaluation += '<i class="fas fa-star"></i>';
    }
    for (fullStars; fullStars < 5; fullStars++){
        evaluation += '<i class="far fa-star"></i>';
    }
    return evaluation;
}

/*  TODO
*   -Serialize params objects
*
*
*
*
*
*/
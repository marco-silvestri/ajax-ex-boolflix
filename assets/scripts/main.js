$(document).ready(function () {
    
    //  Global
    var apiData = {
        endPoint : 'https://api.themoviedb.org/3/search/',
        token :'e80fd63011e84d9eb3ea864a957b8a81',
        languageSearch : 'it-IT'
    };

    var searchTypes = [
        'tv',
        'movie'
    ];

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
                searchHandler(apiData, searchTypes, inputSearch, template, movieGround);
                break;
            default:
                break
        }
    });

    //  Search by clicking on the button
    buttonSearch.click(function () { 
        searchHandler(apiData, searchTypes, inputSearch, template, movieGround);   
    });
    
}); //  END of DOCUMENT READY

/****************
*   FUNCTIONS   *
*****************/

// Search function
function searchHandler(api, types, input, template, destination){
        cleanAll(destination);
        var querySearch  = input.val();
        if (querySearch.trim() != ''){
            for (i = 0; i < types.length; i++){
                callAndSearch(api, types[i], querySearch, input, template, destination);
            }
        }
        else {
            $('#app__movie-ground').html('Inserisci un valore nella ricerca');
            input.focus();
        }
}

//  Ajax call for the search
function callAndSearch(api, type, query, input, template, destination){
    $.ajax({
        type: "GET",
        url: api.endPoint + type,
        data: {
            api_key : api.token,
            language : api.languageSearch,
            query : query
        },
        success: function (response) {
            var totalResults = response.results.length;
            //  If there are no elements matching the search criteria
            if (response.total_results === 0 && type == 'movie'){
                $('#app__movie-ground').append('<p>Nessun Film trovato</p>');
                input.select();
                input.val('');
            }
            else if (response.total_results === 0 && type == 'tv'){
                $('#app__movie-ground').append('<p>Nessuna Serie TV trovata</p>');
                input.select();
                input.val('');
            }
            //  Matching search elements
            else {
                for (var i = 0; i < totalResults; i++){
                    printMovieCards(i, response, template, destination, type);
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

//  Prepare and print the template for the movie cards
function printMovieCards(i, response, template, destination, type){
    var thisResult = response.results[i];
    var starsAverage = countStars(thisResult.vote_average);
    var languageFlag = switchToFlag(thisResult.original_language);
    var templateData = {
        originalLanguage : languageFlag,
        voteAverage : starsAverage,
        posterSource : createPoster(thisResult),
        synopsis : createSynopsis(thisResult, 150)
    };
    if (type == 'movie'){
        templateData.title = thisResult.title;
        templateData.originalTitle = thisResult.original_title;
        templateData.type = 'Film'
    }
    else if (type == 'tv'){
        templateData.title = thisResult.name;
        templateData.originalTitle = thisResult.original_name;
        templateData.type = 'Serie TV'
    }
    var output = template(templateData);
    destination.append(output);
}

//  Dynamically create a poster, if not found load a placeholder
function createPoster(thisResult){
    var posterSource = {
        baseConstructor : 'https://image.tmdb.org/t/p/',
        small : 'w154',
        medium : 'w342',
        large : 'w780',
        original : 'original'
    };
    if (thisResult.poster_path == null){
        var posterPath = 'assets/img/no-product-image.png';
    }
    else {
        var posterPath = posterSource.baseConstructor + posterSource.medium + thisResult.poster_path
    }
    return posterPath;
}

//  Create synopsis
function createSynopsis(thisResult, beforeTruncation) {
    if (thisResult.overview != ''){
        return thisResult.overview.substr(0, beforeTruncation) + '...'
    } 
    else if (thisResult.overview == ''){
        return 'Siamo spiacenti, non è presente nessuna sinossi nella lingua selezionata.'
    } 
}

//  Show stars instead of numbers
function countStars(voteAverage){
    var normalizedAverage = Math.ceil(voteAverage/2);
    var evaluation = '';
    for (var i = 1; i <= 5; i++){
        if (i <= normalizedAverage){
            evaluation += '<i class="fas fa-star" data-vote="'+ i +'"></i>';
        }
        else {
            evaluation += '<i class="far fa-star" data-vote="'+ i +'"></i>';
        }   
    }
    return evaluation
}

//  Read the language and show a flag instead of chars
function switchToFlag(language){
    var languageList = [
        'en',
        'it'
    ];
    if (languageList.includes(language)){
        var flag = '<img class="flag" src="assets/img/'+ language + '.svg" alt="lang_' + language + '">'
        return flag;
    }
    return language;
}
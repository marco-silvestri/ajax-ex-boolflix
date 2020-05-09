$(document).ready(function () {
    
    //  Global
    var apiData = {
        endPoint : 'https://api.themoviedb.org/3/search/',
        token :'e80fd63011e84d9eb3ea864a957b8a81',
        languageSearch : 'it-IT'
    };

    //  jQuery refs
    var inputSearch = $('#app__search-area__movie-search');
    var buttonSearch = $('.app__search-area button');
    var movieGround = $('#app__movie-ground');

    //  Init Handlebars
    var source = $('#movie-template').html();
    var template = Handlebars.compile(source);

    //  Search by hitting ENTER
    inputSearch.keypress(function (e) {
        if (e.which == 13){
            searchHandler(apiData, inputSearch, movieGround, template);
        }
    });

    //  Search by clicking on the button
    buttonSearch.click(function () { 
        searchHandler(apiData, inputSearch, movieGround, template);
    });
    
}); //  END of DOCUMENT READY

/****************
*   FUNCTIONS   *
*****************/

// Search function
function searchHandler(api, input, destination, template){
    cleanAll(destination);
    let querySearch  = input.val();
    Promise.all([
        callAndSearch(api, 'movie', querySearch),
        callAndSearch(api, 'tv', querySearch)
    ])
    .then((result) =>{
        if (result[0].total_results === 0 && result[1].total_results === 0){
            destination.html('Nessun risultato di ricerca')
        }
        else {
            for (var i = 0; i < result[0].results.length; i++){
                printMovieCards(result[0].results, template, destination, 'movie', i)
            };
            for (var i = 0; i < result[1].results.length; i++){
                printMovieCards(result[1].results, template, destination, 'tv', i)
            };
        };
    })
}

//  Ajax call for the search
function callAndSearch(api, type, query){
    var result =
        $.ajax({
            type: "GET",
            url: api.endPoint + type,
            data: {
                api_key : api.token,
                language : api.languageSearch,
                query : query
            },
            success: () => {
                console.log('yay');
            },
            error: function () {
                let err = 'Cannot retrieve the API, try again later';  
                PromiseRejectionEvent(console.log(err));  
            }
        });;
        return result.promise();
}

//  Clean a destination
function cleanAll(destination){
    destination.html('');
}

//  Prepare and print the template for the movie cards
function printMovieCards(response, template, destination, type, i){
    var thisResult = response[i];
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
        var posterPath = posterSource.baseConstructor + posterSource.medium + thisResult.poster_path;
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
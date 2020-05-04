$(document).ready(function () {
    
    //  Global variables
    var myApi = 'https://api.themoviedb.org/3/search/movie';
    var myToken = 'e80fd63011e84d9eb3ea864a957b8a81';

    //  jQuery refs
    var inputSearch = $('#app__search-area__movie-search');
    var buttonSearch = $('.app__search-area button');
    var movieGround = $('#app__movie-ground');

    //  Init Handlebars
    var source = $('#movie-template').html();
    var template = Handlebars.compile(source);

    inputSearch.keydown(function (e) { 
        switch (e.which){
            case 13:
                searchAndPrint(myApi, myToken, template, inputSearch, movieGround);
                break;
            default:
                break
        }
    });

    buttonSearch.click(function () { 
        searchAndPrint(myApi, myToken, template, inputSearch, movieGround);
    });
}); //  END of DOCUMENT READY

/***************
*   FUNCTIONS
****************/

function searchAndPrint(myApi, myToken, template, input, destination){
    destination.html('');
        var querySearch  = input.val();
        $.ajax({
            type: "GET",
            url: myApi,
            data: {
                api_key : myToken,
                query : querySearch
            },
            success: function (response) {
                var totalResults = response.results.length;
                for (var i = 0; i < totalResults; i++){
                    var thisResult = response.results[i];
                    var templateData = {
                        title : thisResult.title,
                        originalTitle : thisResult.original_title,
                        originalLanguage : thisResult.original_language,
                        voteAverage : thisResult.vote_average
                    };
                    var output = template(templateData);
                    destination.append(output);
                }
            },
            error: function () {  
                console.log('Cannot retrieve the API, try again later');   
            }
        });
}
$(document).ready(function(){

    //event listener for yt button
    $("#youtube").click(function(e){
    e.preventDefault();
    $("#videos").empty();  // clears videos when submit button clicked

    var key = "AIzaSyAa1zc7O33vu-6VA17JJFLnWPC9ckiXcOw";
    var search = $("#search").val();
    var maxResults= 6;
    var ytUrl = "https://www.googleapis.com/youtube/v3/search?key=" + key + "&videoEmbeddable=true&type=video&part=snippet&maxResults=" + maxResults + "&q=" + search;

    //creating ajax call for when the submit button is clicked.
    $.ajax({
        url:ytUrl,
        method: "GET"
    }).then(function(data) {
    
})
})
})
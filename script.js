$(document).ready(function () {
    var previousArtist = "";
    function startSearch(e) {
        $("#feedback").text("");
        e.preventDefault();
        var thisArtist = $("#artist").val().trim();
        if (!$("#song").val()) {
            incompleteSongFieldError();
            return;
        }
        getItunesInfo();
        if ($("#useVimeo").is(":checked")) {
            vimVids();
        }
        else {
            ytVids();
        }
        if (thisArtist) {
            if (thisArtist != previousArtist) {
                previousArtist = thisArtist;
                getLyrics();
            }
        }
        else {
            setLyricsMessage();
        }
        $("#video-img").hide();
        $("#lyrics-img").hide();
    }

    function ytVids() {
        $("#videos").empty(); // clears videos when submit button clicked

        var key = "AIzaSyAa1zc7O33vu-6VA17JJFLnWPC9ckiXcOw";
        var search = $("#song").val().trim() + " " + $("#artist").val().trim();
        var maxResults = 3;
        var ytUrl =
            "https://www.googleapis.com/youtube/v3/search?key=" +
            key +
            "&videoEmbeddable=true&type=video&part=snippet&maxResults=" +
            maxResults +
            "&q=" +
            search;

        //creating ajax call for when the submit button is clicked.
        $.ajax({
            url: ytUrl,
            method: "GET",
        }).catch(function (error) {
            if (error) {
                var noYtMessage =
                    "WHOOPS! YouTube is unavailable, use Vimeo instead.";
                $("#feedback").text("");   
                $("#feedback").append(noYtMessage);
                vimVids();
            }
        }).then(function (data) {
            // for each loop for the data recieved.
            $.each(data.items, function (i, item) {
                //created p tag for video title.
                var p = $("<p>");
                p.html(item.snippet.title);
                //append p tag and iframe with video id to video section.
                $("#videos").append(
                    p,
                    `<iframe src="https://www.youtube.com/embed/${item.id.videoId}" frameborder="0" allow="accelerometer; encrypted-media" allowfullscreen></iframe>`
                );
                setIframeWidthHeight();
            });
        });
    }

    function vimVids() {
        $("#videos").empty(); // clears videos when submit button clicked
        //var test = "beyonce";
        var accessToken = "1d50cb8f1dbb330003a778e658d15053";
        var numResults = 3;
        var search = $("#song").val().trim() + " " + $("#artist").val().trim();
        var vimUrl =
            "https://api.vimeo.com/videos?per_page=" + numResults + "&query=" +
            search +
            "&access_token=" +
            accessToken;
        //creating ajax call for when the submit button is clicked.
        $.ajax({
            url: vimUrl,
            method: "GET",
        }).then(function (data) {
            // for  loop for the data recieved.
            $.each(data.data, function (i, item) {
                //created p tag for video title.
                var p = $("<p>");
                p.html(item.name);
                //append p tag and iframe with video id to video section.
                $("#videos").append(p, `${item.embed.html}`);

                setIframeWidthHeight();
            });
        });
    }
    //Function to get lyrics
    function getLyrics() {
        $("#lyricsPlacement").empty(); // clears videos when submit button clicked

        var artist = $("#artist").val().trim();
        var song = $("#song").val().trim();
        var lyricUrl = "https://api.lyrics.ovh/v1/" + artist + "/" + song;
        $.ajax({
            url: lyricUrl,
            method: "GET",
        }).then(function (response) {
            // parse lyrics
            // lyrics = response.lyrics;
            lyrics = response.lyrics.replace(/\n*\n/g, '<br>');

            // adding song-lyrics to the lyrics div
            if (lyrics) {
                $("#lyricsPlacement").append(lyrics);
            } else {
                var noLyricsMessage =
                    "WHOOPS! We can't find the lyrics you're looking for!";
                $("#lyricsPlacement").append(noLyricsMessage);
            }
        });
    }

    function getItunesInfo() {
        $("#album-art").empty();
        $("#track-info").empty();

        var search = $("#song").val().trim() + " " + $("#artist").val().trim();
        var queryURL = `https://cors-anywhere.herokuapp.com/https://itunes.apple.com/search?term=${search}&country=CA&media=music&entity=musicTrack&limit=1`

        $.ajax({
            url: queryURL,
            method: "GET", 
            headers:{"Access-Control-Allow-Origin": "*"}
        }).done(function(data){

            $("#itunes-area").removeClass("hide");
            //parse data into JSON format 
            var trackData = JSON.parse(data);
            //grab data we want
            var trackName = trackData.results[0].trackName;
            var artist = trackData.results[0].artistName;
            var albumName = trackData.results[0].collectionName;
            var albumArt = trackData.results[0].artworkUrl100;
            //create album art img element
            var aAElem = $('<img>').attr("src", albumArt);
            //create track name anchor element
            var trackAnchor = $("<a>").text(`${trackName}`);
            //link the track preview page provided by apple
            trackAnchor.attr("href", `${trackData.results[0].trackViewUrl}`)
            //open in new tab
            trackAnchor.attr("target", `_blank`);
            //give class to change font color
            trackAnchor.attr("class", `previewLinks`);
            //create artist name anchor element 
            var artistAnchor = $("<a>").text(`${artist}`);
            //link artis preview pagfe provided by apple
            artistAnchor.attr("href", `${trackData.results[0].artistViewUrl}`)
            //open in new tab
            artistAnchor.attr("target", `_blank`);
            //give class to change font color
            artistAnchor.attr("class", `previewLinks`);
            //create a p element to put track name and artist into 
            var tNArtistElem = $("<p>");
            tNArtistElem.append(trackAnchor, " by ", artistAnchor);
            //creater album name p element 
            var aNElem = $("<p>").text(albumName);

            //append everything
            $("#album-art").append(aAElem);
            $("#track-info").append(tNArtistElem, aNElem);
            //console.log(`trackName = ${trackName} || artist = ${artist} || albumName = ${albumName} || albumArt url = ${albumArt}`);
        });
    }

    function setIframeWidthHeight() {
        $("iframe").attr("width", "420");
        $("iframe").attr("height", "315");
    }

    function setLyricsMessage() {
        $("#lyricsPlacement").empty();
        var noArtistMessage = "To get lyrics an Artist must be provided.";
        $("#lyricsPlacement").append(noArtistMessage);
    }

    function incompleteSongFieldError() {
        //create modal saying the song field is required 
        var modal = $("<div>");
        modal.text("Song Title field is required");
        modal.attr("class", "notification is-danger errorModal");
        modal.attr("id", "noSongError");
        var exitBtn = $("<button>");
        exitBtn.attr("class", "delete");
        exitBtn.attr("id", "exitBtn");
        modal.prepend(exitBtn);
        $("#noSongModal").append(modal);
        $("#exitBtn").click(function () {
            $("#noSongError").remove();
        });
    }

    function vimeoLocalStorage()
    {
        if ($("#useVimeo").is(":checked")) {
            localStorage.setItem("vim", "yes");            
        }
        else {
            localStorage.setItem("vim", "no");            
        }
    }

    $("#search-btn").click(startSearch);
    $("#useVimeo").click(vimeoLocalStorage);

    
    // Theme Switcher
    var mode = "light";
    // Set mode dark or light mode at the start
    var dlMode = localStorage.getItem("mode")
    if (dlMode === "dark") {
        $("#theme-switcher").prop("checked", true);
        dark();   
    } else if (dlMode === "light") {
        light();
    } else {
        light();
    }
   
    function dark(){
        mode = "dark";
        $("body").attr("class", "dark");
        $("footer").attr("class", "footer-d");
        $("#cannon-img").attr("src", "./img/logoD.png");
        localStorage.setItem("mode","dark");                    //set to localstorage
    }
    function light(){
        mode = "light";
        $("body").attr("class", "light");
        $("footer").attr("class", "footer");
        $("#cannon-img").attr("src", "./img/logo.png");
        localStorage.setItem("mode","light");                   //set to localstorage
    }

    //Event Listener for theme switcher.
    $("#theme-switcher").click(function () {
        dlMode = localStorage.getItem("mode")
        // Switch from light to dark
        if (mode === "light") {
            dark();
        }
        else {
            // Switch from dark to light
            light();
        }
    });
    //Video Preference local storage
    var vim = localStorage.getItem("vim")
    if (vim === "yes") {
        $("#useVimeo").prop("checked", true); 
    }

});
    





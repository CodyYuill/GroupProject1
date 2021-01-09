//null videos 

$(document).ready(function () {
    //screate last searched artist and song title variables
    var previousTitle = "";
    var previousArtist = "";
    function startSearch(e) {
        e.preventDefault();
        //clear feedback text
        $("#feedback").text("");
        //make sure shareable link button is hidden and emptied
        $("#share").addClass("hide");
        $("#share-link").empty();
        //empty no song title field error modal
        $("#noSongModal").empty();
        //grab search field inputs
        var thisArtist = $("#artist").val().trim();
        var thisTitle = $("#song").val().trim();
        //check if song title is proveded
        if (!thisTitle) {
            //if no song title give error modal and return 
            incompleteSongFieldError();
            return;
        }
        //get the itunes info
        getItunesInfo();
        //check if user wants vimeo or youtube video results
        //then call needed function
        if ($("#useVimeo").is(":checked")) {
            vimVids();
        }
        else {
            ytVids();
        }
        //check to see if artist field is filled in 
        if (thisArtist) {
            //if it is only re search lyrics if the song or artist is different 
            //fromt he last search
            if (thisArtist != previousArtist || thisTitle != previousTitle) {
                previousArtist = thisArtist;
                previousTitle = thisTitle;
                getLyrics();
            }
        }
        //otherwise give an error message in the lyrics column
        else {
            setLyricsMessage();
        }
        //hide the images
        $("#video-img").hide();
        $("#lyrics-img").hide();
    }

    function ytVids() {
        // clears videos and error message when submit button clicked 
        $("#videos").empty(); 
        $("#error").text("");

        //set required api queries 
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
            //if call fails let user know youtube didnt work 
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
        // clears videos and error message when submit button clicked 

        $("#error").text("");
        $("#videos").empty();
        //set required api queries 
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
            var total = data.total 
            //if vimeo didnt work let user know
            if (total < 1){
                var noVimMessage =
                    "WHOOPS! Video is not available. Please check search and try again.";
                $("#error").append(noVimMessage);
                $("#video-img").show();

            }

            // for  loop for the data recieved.
            $.each(data.data, function (i, item) {
                //created p tag for video title.
                var p = $("<p>");
                p.html(item.name);
                //if embed html is null skip that result 
                if(item.embed.html == null)
                {
                    return;
                }
                //append p tag and iframe with video id to video section.
                $("#videos").append(p, `${item.embed.html}`);
                

                setIframeWidthHeight();
            });
        });
    }
    //Function to get lyrics
    function getLyrics() {
        //clear section
        $("#lyricsPlacement").empty();
        //set required api queries 
        var artist = $("#artist").val().trim();
        var song = $("#song").val().trim();
        var lyricUrl = "https://api.lyrics.ovh/v1/" + artist + "/" + song;
        $.ajax({
            url: lyricUrl,
            method: "GET",
        }).then(function (response) {
            // parse lyrics
            lyrics = response.lyrics.replace(/\n*\n/g, '<br>');

            // adding song-lyrics to the lyrics div
            if (lyrics) {
                $("#lyricsPlacement").append(lyrics);
            } else {
                $("#error1").empty();
                var noLyricsMessage =
                    "WHOOPS! We can't find the lyrics you're looking for!";
                $("#error1").append(noLyricsMessage);
                $("#lyrics-img").show();
            }
        });
    }

    function getItunesInfo() {
        //empty section
        $("#album-art").empty();
        $("#track-info").empty();
        //set required api queries 
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
            $("#share").removeClass("hide");
            $("#share-link").empty();
            
            //console.log(`trackName = ${trackName} || artist = ${artist} || albumName = ${albumName} || albumArt url = ${albumArt}`);
        });
    }

    $("#share").click(function() { 
        //only create a link once, if a link is created 
        //do not make a n ew ajax call
        if($("#linkField").val())
        {
            return;
        }
        //empty the text 
        $("#linkField").text("")
        //grab first anchor link (song preview page)
        var value = $("a").attr("href")
        //set required api queries 
        var linkRequest = {
                destination: value,
                domain: { fullName: "rebrand.ly" }
                }
        var requestHeaders = {
                "Content-Type": "application/json",
                "apikey": "74b789cded664bcbad7382cf21ded63a",
                }
                  
        $.ajax({
            url: "https://api.rebrandly.com/v1/links",
            type: "post",
            data: JSON.stringify(linkRequest),
            headers: requestHeaders,
            dataType: "json",
            }).done(function (link){
            //grab the link and append to page
            var shortUrl = link.shortUrl;
            var link = $(`<input type="text" id="linkField">`);
            link.attr("value", shortUrl);
            var copyBtn = $(`<button id="copyBtn">Copy text</button>`);
            copyBtn.click(copyLink);
            $("#share-link").append(link, copyBtn);
          
        })   
    })

    function copyLink() { 
        console.log("test");
        
        var copyText = $("#linkField");
      
        //select our input element to copy link from
        copyText.select();
        //copyText.setSelectionRange(0, 99999); //For mobile devices
      
        //Copy the link
        document.execCommand("copy");

        var copyMsg = $(`<p id="copyMsg"></p>`).text("Copied to clipboard!");
        $("#share-link").append(copyMsg);
    }
    
    function setIframeWidthHeight() {
        //set inital ifram dimensions
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
        //append modal
        $("#noSongModal").append(modal);
    }

    

    function vimeoLocalStorage()
    {
        //store whether user was using yotube or vimeo in local storage
        if ($("#useVimeo").is(":checked")) {
            localStorage.setItem("vim", "yes");            
        }
        else {
            localStorage.setItem("vim", "no");            
        }
    }

    //set event listeners
    $("#search-btn").click(startSearch);
    $("#useVimeo").click(vimeoLocalStorage);

    //Video Preference local storage
    var vim = localStorage.getItem("vim")
    if (vim === "yes") {
        $("#useVimeo").prop("checked", true); 
    }

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
    
});
    





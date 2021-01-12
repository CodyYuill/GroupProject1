$(document).ready(function () {
    //Create last searched artist and song title variables
    var previousTitle = "";
    var previousArtist = "";

    function startSearch(e) {
        // Prevent page from reloading form on default
        e.preventDefault();
        // Clear any error feedback
        $("#feedback").text("");
        $("#noSongModal").empty();
        // Hide shareable link and button
        $("#share").addClass("hide");
        $("#copy-btn").addClass("hide");
        $("#share-link").empty();
        // Get user input for song and artist
        var thisArtist = $("#artist").val().trim();
        var thisTitle = $("#song").val().trim();
        // Check if song title is provided
        if (!thisTitle) {
            // If no song title give error modal and return 
            incompleteSongFieldError();
            return;
        }
        // Invoke iTunes function to get the song info
        getItunesInfo();
        // Check if user wants Vimeo or YouTube video results
        // Then call needed function
        if ($("#useVimeo").is(":checked")) {
            vimVids();
        }
        else {
            ytVids();
        }
        // Check to see if artist field is filled in 
        if (thisArtist) {
            // If it is only re search lyrics if the song or artist is different 
            // From the last search
            if (thisArtist != previousArtist || thisTitle != previousTitle) {
                previousArtist = thisArtist;
                previousTitle = thisTitle;
                getLyrics();
            }
        }
        // Otherwise give an error message in the lyrics column
        else {
            setLyricsMessage();
        }
        // Hide the previous two images
        $("#video-img").hide();
        $("#lyrics-img").hide();
    }

    function ytVids() {
        // Clears videos and error message when submit button clicked 
        $("#videos").empty();
        $("#error").text("");

        // Set required API queries 
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

        // Creating ajax call for when the submit button is clicked.
        $.ajax({
            url: ytUrl,
            method: "GET",
        }).catch(function (error) {
            // If API call fails, let user know YouTube didn't work 
            // Will use Vimeo instead
            if (error) {
                var noYtMessage =
                    "WHOOPS! YouTube is unavailable, use Vimeo instead.";
                $("#feedback").text("");
                $("#feedback").append(noYtMessage);
                vimVids();
            }
        }).then(function (data) {
            // For Each loop for the data recieved.
            $.each(data.items, function (i, item) {
                // Create a <p> tag to output video title.
                var p = $("<p>");
                p.html(item.snippet.title);
                // Append <p> tag and iframe with video id to video section.
                $("#videos").append(
                    p,
                    `<iframe src="https://www.youtube.com/embed/${item.id.videoId}" frameborder="0" allow="accelerometer; encrypted-media" allowfullscreen></iframe>`
                );
                setIframeWidthHeight();
            });
        });
    }

    function vimVids() {
        // Clears videos and error message when submit button clicked 
        $("#error").text("");
        $("#videos").empty();
        // Set required API queries 
        var accessToken = "1d50cb8f1dbb330003a778e658d15053";
        var numResults = 3;
        var search = $("#song").val().trim() + " " + $("#artist").val().trim();
        var vimUrl =
            "https://api.vimeo.com/videos?per_page=" + numResults + "&query=" +
            search +
            "&access_token=" +
            accessToken;
        // Creating ajax call for when the submit button is clicked.
        $.ajax({
            url: vimUrl,
            method: "GET",
        }).then(function (data) {
            var total = data.total
            // If vimeo didnt work let user know with visible message
            if (total < 1) {
                var noVimMessage =
                    "WHOOPS! Video is not available. Please check search and try again.";
                $("#error").append(noVimMessage);
                $("#video-img").show();
            }
            // For Each Loop for the data recieved.
            $.each(data.data, function (i, item) {
                // Created <p> tag for video title output
                var p = $("<p>");
                p.html(item.name);
                // If embed html is null, skip that result 
                if (item.embed.html == null) {
                    return;
                }
                // Append <p> tag and iframe with video ID to video section.
                $("#videos").append(p, `${item.embed.html}`);
                setIframeWidthHeight();
            });
        });
    }
    // Function to get lyrics
    function getLyrics() {
        // Clear section and any error messages
        $("#error1").text("");
        $("#lyricsPlacement").empty();
        // Set required API queries 
        var artist = $("#artist").val().trim();
        var song = $("#song").val().trim();
        var lyricUrl = "https://api.lyrics.ovh/v1/" + artist + "/" + song;
        $.ajax({
            url: lyricUrl,
            method: "GET",
        }).then(function (response) {
            // Parse lyrics to have even spacing between each line/verse
            lyrics = response.lyrics.replace(/\n*\n/g, '<br>');
            // Append song-lyrics to the lyrics div
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
    // Function to get iTunes information
    function getItunesInfo() {
        // Empty section of any previous song info
        $("#album-art").empty();
        $("#track-info").empty();
        // Set required API queries 
        var search = $("#song").val().trim() + " " + $("#artist").val().trim();
        var queryURL = `https://cors-anywhere.herokuapp.com/https://itunes.apple.com/search?term=${search}&country=CA&media=music&entity=musicTrack&limit=1`
        $.ajax({
            url: queryURL,
            method: "GET",
            headers: { "Access-Control-Allow-Origin": "*" }
        }).done(function (data) {
            $("#itunes-area").removeClass("hide");
            // Parse data into JSON format 
            var trackData = JSON.parse(data);
            // Grab data we need
            var trackName = trackData.results[0].trackName;
            var artist = trackData.results[0].artistName;
            var albumName = trackData.results[0].collectionName;
            var albumArt = trackData.results[0].artworkUrl100;
            // Create album art <img> element
            var aAElem = $('<img>').attr("src", albumArt);
            // Create track name anchor element
            var trackAnchor = $("<a>").text(`${trackName}`);
            // Link the track preview page provided by apple
            trackAnchor.attr("href", `${trackData.results[0].trackViewUrl}`)
            // Open in new tab
            trackAnchor.attr("target", `_blank`);
            // Give class to change font color
            trackAnchor.attr("class", `previewLinks`);
            // Create artist name anchor element 
            var artistAnchor = $("<a>").text(`${artist}`);
            // Link artist preview page provided by Apple
            artistAnchor.attr("href", `${trackData.results[0].artistViewUrl}`)
            // Open in new tab
            artistAnchor.attr("target", `_blank`);
            // Give class to change font color
            artistAnchor.attr("class", `previewLinks`);
            // Create a p element to put track name and artist into 
            var tNArtistElem = $("<p>");
            tNArtistElem.append(trackAnchor, " by ", artistAnchor);
            // Create album name <p> element 
            var aNElem = $("<p>").text(albumName);
            //Append all gathered information
            $("#album-art").append(aAElem);
            $("#track-info").append(tNArtistElem, aNElem);
            $("#share").removeClass("hide");
            $("#copy-btn").addClass("hide");
            $("#share-link").empty();
        });
    }
    // Event Listener for shareable link button
    $("#share").click(function () {
        // Only create a link once, if a link is created 
        // Do not make a new ajax call
        if ($("#linkField").val()) {
            return;
        }
        // Empty any previous track share info 
        $("#linkField").text("")
        // Grab first anchor link (song preview page)
        var value = $("a").attr("href")
        // Set required API queries 
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
        }).done(function (link) {
            // Grab the link and append to page
            // Have a copy link button save to users clipboard
            // Provide feedback to the user when complete
            var shortUrl = link.shortUrl;
            var link = $(`<input class="input" type="text" id="linkField" readonly>`);
            link.attr("value", shortUrl);
            $("#copy-btn").removeClass("hide");
            $("#copy-btn").attr(`data-tooltip="Tooltip Text"`);
            $("#copy-feedback").text("Copy to clipboard");
            $("#copy-btn").click(copyLink);
            $("#share").addClass("hide");
            $("#share-link").append(link);
            $("#copy-feedback").text("Copy to clipboard");
        })
    })

    function copyLink() {
        // Save link to user's clipboard
        var copyText = $("#linkField");
        copyText.select();
        document.execCommand("copy");
        $("#copy-feedback").text("Copied!");
    }

    function setIframeWidthHeight() {
        //set inital iframe dimensions
        $("iframe").attr("width", "420");
        $("iframe").attr("height", "315");
    }

    function setLyricsMessage() {
        // Error message for lyrics if no artist is provided
        $("#lyricsPlacement").empty();
        var noArtistMessage = "To get lyrics an Artist must be provided.";
        $("#lyricsPlacement").append(noArtistMessage);
    }

    function incompleteSongFieldError() {
        // Create modal saying song field is required 
        var modal = $("<div>");
        modal.text("Song Title field is required");
        modal.attr("class", "notification is-danger errorModal");
        modal.attr("id", "noSongError");
        // Append modal
        $("#noSongModal").append(modal);
    }

    function vimeoLocalStorage() {
        // Save user's video preference to local storage
        if ($("#useVimeo").is(":checked")) {
            localStorage.setItem("vim", "yes");
        }
        else {
            localStorage.setItem("vim", "no");
        }
    }
    // Add event listeners for search button and Vimeo checkbox
    $("#search-btn").click(startSearch);
    $("#useVimeo").click(vimeoLocalStorage);

    // Video Preference local storage
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
    function dark() {
        mode = "dark";
        $("body").attr("class", "dark");
        $("footer").attr("class", "footer-d");
        $("#cannon-img").attr("src", "./img/logoD.png");
        // Save user selection to Local Storage
        localStorage.setItem("mode", "dark");
    }
    function light() {
        mode = "light";
        $("body").attr("class", "light");
        $("footer").attr("class", "footer");
        $("#cannon-img").attr("src", "./img/logo.png");
        // Save user selection to Local Storage
        localStorage.setItem("mode", "light");
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






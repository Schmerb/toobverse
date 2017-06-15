'use strict';

var state = {
    user_query: '',
    search_results: [],
    thumbnails: [],
    mobile: false,
    isSlick: false
};

// Selectors
var TOP = '.top';
var LANDING_CONTAINER = '#landing-container';
var EXPLORE_BTN = '#explore-btn';
var EXPLORE = '.explore';
var FORM_CONTAINER = '#form-container';
var SEARCH_CONTAINER = '#search-container';
var SEARCH_FORM = '.search-form';
var QUERY = '#query';
var USER_QUERY_LABEL = '#query-label';
var USER_QUERY = '.user-query';
var RESULTS = '.results';
var VIDEO_THUMBNAIL = '.video-thumbnail';

var LIGHTBOX = '.lightbox';
var TIMES_ICON = '#times';
var RESULT_CAROUSEL  = '#result-carousel';
var MODAL_FILTER = '.modal-filter';
var FRAME_CONTAINER = '.frame-container';
var FRAME = '#frame';
var VIDEO_NAME = '#video-name';
var CHANNEL_NAME = '#channel-name';
//================================================================================
// Display user search results to screen
//================================================================================

function displayResults(resp) {
    var videos = resp.items.map(function(video) {
        var $video_img = `<div>
                            <img class="video-thumbnail" 
                                 id="${video.id.videoId}"
                                 src="${video.snippet.thumbnails.medium.url}" 
                                 alt="${video.snippet.description}" 
                                 data-video-id="${video.id.videoId}"
                                 data-title="${video.snippet.title}"
                                 data-channel-id="${video.snippet.channelId}"
                                 data-channel-title="${video.snippet.channelTitle}"
                                 data-published="${video.snippet.publishedAt}"
                                 data-description="${video.snippet.description}"
                                 data-live-content="${video.snippet.liveBroadcastContent}"
                            >
                            <label class="slide-label" for="${video.id.videoId}">${video.snippet.title}</label>
                          </div>`;
        return $video_img;
    });
    state.thumbnails = videos;
    $(RESULTS).empty().append(videos.join(''));
    
}



//================================================================================
// Helper functions and API handlers
//================================================================================

function printToConsole(resp) {
    console.log(resp);
}

//
//
//
function searchYoutubeHandler() {
    searchYouTube(state.user_query, function(resp) {
        state.search_results = resp.items;
        console.log(resp);
        $(USER_QUERY_LABEL).removeClass('hidden');
        $(USER_QUERY).text(state.user_query);
        displayResults(resp);
    });
}

//
// 
//
function openLightbox(video_img) {
    $(LIGHTBOX).removeClass('hidden');
    updateCurrentVideo(video_img);
    loadCarousel();
}


function updateCurrentVideo(newVideo) {
    var videoId = newVideo.attr('data-video-id');
    var title = newVideo.attr('data-title');
    var channelTitle = newVideo.attr('data-channel-title');
    var channelId = newVideo.attr('data-channel-id');
    var description = newVideo.attr('data-description');
    var datePublished = newVideo.attr('data-published');

    var embedLink = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    var channelLink = `https://www.youtube.com/channel/${channelId}`;

    $(FRAME).attr('src', embedLink);
    $(VIDEO_NAME).text(title);
    $(CHANNEL_NAME).text(channelTitle);
    $(CHANNEL_NAME).attr('href', channelLink);
}

function closeLightbox() {
    $(FRAME).attr('src', ''); //$(FRAME).attr('src').slice(0, -1) + '0'
    $(LIGHTBOX).addClass('hidden');
}

function loadCarousel() {
    // var slides = state.thumbnails.map(function(thumbnail) {
    //     var slide = `<div>
    //                     ${thumbnail}
    //                     <label></label>
    //                  </div>`;
    //     return slide;
    // });
    $(RESULT_CAROUSEL).html(state.thumbnails.join(''));
    initLightboxCarousel();
}

function initLightboxCarousel() {
    $('.responsive').slick({
        dots: true,
        arrows: false,
        infinite: false,
        speed: 300,
        slidesToShow: 4,
        slidesToScroll: 4,
        variableWidth: true,
        responsive: [
            {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: true,
                dots: true
            }
            },
            {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
            },
            {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
            }
            // You can unslick at a given breakpoint now by adding:
            // settings: "unslick"
            // instead of a settings object
        ]
    });
    state.isSlick = true;
}

function unslickCarousel() {
    $('.responsive').slick('unslick');
    state.isSlick = false;
}

// * * * * * * * * * * * * * * * * * * * *
// Check screen size to determine 
// Mobile Vs. Desktop
// * * * * * * * * * * * * * * * * * * * *
function checkSizeHandler() {
    $(document).ready(function() {
        checkSize();

        $(window).resize(checkSize);
    });
}

function checkSize() {
    // debugger;
    (Number($("body").css('width').slice(0, -2)) <= 700) ? state.mobile = true : state.mobile = false;
}

//
//
//
function fixedSearchBar() {
    $(window).scroll(function(e) {
        var scroll = $(window).scrollTop();
        // console.log(scroll);
        if(scroll > $(window).height()) {
            $(SEARCH_FORM).addClass('fixed-search-bar');
            $(FORM_CONTAINER).addClass('form-backdrop');
            if (!state.mobile) {
                $(USER_QUERY_LABEL).css({marginTop: '10px'});
            } 
        } else {
            $(SEARCH_FORM).removeClass('fixed-search-bar');
            $(FORM_CONTAINER).removeClass('form-backdrop');
            $(USER_QUERY_LABEL).css({marginTop: ''});
        }
        
    });
}

function smoothScroll(target) {
    $('body, html').animate({
        scrollTop: $(target).offset().top
    }, 800);
}


//================================================================================
// API Calls
//================================================================================

var YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/';

function searchYouTube(searchTerm, callback, maxResults) {
    if(arguments.length == 1) {
        callback = printToConsole;
        maxResults = 50;
    } else if (arguments.length == 2) {
        maxResults = 50;
    }
    var SEARCH_URL = YOUTUBE_BASE_URL + 'search/';
    var query = {
        key: 'AIzaSyCtbQ7eOypMc7OKBSGFs46aIL6Ozmmeygw',
        part: 'snippet',
        q: searchTerm,
        maxResults: maxResults
    };
    $.getJSON(SEARCH_URL, query, callback);
}

function searchVideoById(video_ID, callback) {
    if(arguments.length == 1) {
        callback = printToConsole;
    } 
    var VIDEOS_URL = YOUTUBE_BASE_URL + 'videos';
    var query = {
        key: 'AIzaSyCtbQ7eOypMc7OKBSGFs46aIL6Ozmmeygw',
        part: 'snippet',
        id: video_ID
    };
    $.getJSON(VIDEOS_URL, query, callback);
}

//================================================================================
// Event Listeners
//================================================================================

function scrollToSearchBar() {
    $(EXPLORE).on('click', function(e) {
        e.preventDefault();
        smoothScroll('main');
        $(QUERY).focus();
    });
}

function scrollToTop() {
    $(TOP).on('click', function(e) {
        e.preventDefault();
        smoothScroll('.banner');
    });
}
    

function searchFormSubmit() {
    $(SEARCH_FORM).on('submit', function(e) {
        e.preventDefault();
        smoothScroll('main');
        state.user_query = $(QUERY).val();
        $(this)[0].reset();
        searchYoutubeHandler();
    });
}

function playVideoLightboxClick() {
    $(RESULTS).on('click', VIDEO_THUMBNAIL, function(e) {
        e.preventDefault();
        openLightbox($(this));
    });
}

function lightboxCarouselVideoClick() {
    $(LIGHTBOX).on('click', VIDEO_THUMBNAIL, function(e) {
        e.preventDefault();
        updateCurrentVideo($(this));
    });
}

function closeLightboxClick() {
    $(document).on('click', MODAL_FILTER + ', ' + TIMES_ICON,function(e) {
        e.preventDefault();
        if (e.target == $(MODAL_FILTER)[0] || e.target == $(TIMES_ICON)[0]) {
            unslickCarousel();
            closeLightbox();
        }
    });
}



//================================================================================
// Entry Point
//================================================================================
$(function() {
    scrollToSearchBar();
    scrollToTop();
    searchFormSubmit();
    checkSizeHandler();
    fixedSearchBar();

    // Video lightbox
    playVideoLightboxClick();
    lightboxCarouselVideoClick();
    closeLightboxClick();

    initLightboxCarousel();
    // searchYouTube('night grinderz 2017', function(resp) {
    //     resp.items.forEach(function(item) {
    //         console.log(item.snippet.thumbnails.medium.url);
    //     });
    // });
    // searchYouTube('night grinderz 2017');
    searchVideoById('EkBalQOxLgg');
});
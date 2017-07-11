'use strict';

var state = {
    user_query: '',
    hd_filter: false,
    _4k_filter: false,
    _4k_browse: false,
    live_browse: false,
    currentLiveCategory: '',
    currentlyEnlarged: false,
    search_results: [],
    thumbnails: [],
    cached_thumbnails_pages: [],
    currentPageNum: 1,
    mobile: false,
    isSlick: false
};

// Selectors

// Header
var TOP = '.top';
var LANDING_CONTAINER = '#landing-container';
var TITLE = '.title';
var SLOGAN = '#slogan';
var MISSION_STATEMENT = '#mission-statement';
var EXPLORE_BTN = '#explore-btn';
var EXPLORE = '.explore';
var LIVE = '.live';
var MISSION = '.mission';
var _4K_NAV_ITEM = '.nav-4k'
var HEADER_NAV = '.header-nav';
var DROPDOWN_CONTENT = '.dropdown-content';

// Search / Results
var FORM_CONTAINER = '#form-container';
var SEARCH_CONTAINER = '#search-container';
var SEARCH_NAV = '.search-nav';
var SEARCH_DROPDOWN_CONTENT = '.search-dropdown-content';
var SEARCH_FORM = '.search-form';
var HD_CHECKBOX = '#hd-checkbox';
var _4K_CHECKBOX = '#_4k-checkbox';
var QUERY = '#query';
var USER_QUERY_LABEL = '#query-label';
var USER_QUERY = '.user-query';
var USER_QUERY_WRAP = '.user-query-wrap';
var RESULTS_TYPE = '#results-type';
var SEARCH_RESULTS_SPAN = '.search-results-span';
var BROWSE_VIDEOS_SPAN = '.browse-videos-span';
var RESULTS_CONTAINER = '.results-container';
var RESULTS = '.results';
var VIDEO_THUMBNAIL = '.video-thumbnail';
var PAGE_CONTROLS_CONTAINER = '.page-controls-container';
var NEXT_PAGE_BTN = '.next-page-btn';
var PREV_PAGE_BTN = '.prev-page-btn';
var PAGE_NUM = '.page-num';
var PAGE_NUM_WRAP = '.page-num-wrap';

// Lightbox 
var LIGHTBOX = '.lightbox';
var NEW_SEARCH_TIMES_LABEL = '#new-search-times-label';
var TIMES_ICON = '#times';
var ENLARGE_BTN = '#enlarge';
var MINIMIZE_BTN = '#minimize';
var RESULT_CAROUSEL  = '#result-carousel';
var MODAL_FILTER = '.modal-filter';
var FRAME_CONTAINER = '.frame-container';
var FRAME = '#frame';
var VIDEO_NAME = '#video-name';
var CHANNEL_NAME = '#channel-name';
var MONTH = '#month';
var YEAR = '#year';
var CHANNEL_OUTER_WRAP = '#channel-outer-wrap';


//================================================================================
// Display user search results to screen
//================================================================================

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Creates array of thumbanils from list of results and 
// attaches all relevant metadata to thumbnails before 
// displaying these to the screen
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function displayResults(resp) {
    var videos = resp.items.map(function(video, index) {
        var $video_img = `<div>
                            <img class="video-thumbnail" 
                                 id="${video.id.videoId}"
                                 src="${video.snippet.thumbnails.medium.url}" 
                                 alt="${video.snippet.description}" 
                                 data-index=${index}
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
    $(RESULTS).empty()
              .append(videos.join(''));
    $(RESULTS_CONTAINER).addClass('results-filter');
    if(resp.items.length > 0) {
        $(RESULTS).removeClass('hidden');
        $(PAGE_CONTROLS_CONTAINER).removeClass('hidden');
    } else {
        $(RESULTS).addClass('hidden');
        $(PAGE_CONTROLS_CONTAINER).addClass('hidden');
    }
}



//================================================================================
// Helper functions 
//================================================================================

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Default callback function for all API requests 
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function printToConsole(resp) {
    console.log(resp);
}



// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Displays the lightbox, sets the current video and
// loads the responsive carousel with dynamic text size
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function openLightbox(video_img, index) {
    $(LIGHTBOX).removeClass('hidden');
    updateCurrentVideo(video_img);
    loadCarousel(index);
    dynamicQueryLabelFontSize(USER_QUERY, 'label[for="result-carousel"]');
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Sets the player to new video and updates the metadata
// associated with new video
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function updateCurrentVideo(newVideo) {
    var videoId = newVideo.attr('data-video-id');
    var title = newVideo.attr('data-title');
    var channelTitle = newVideo.attr('data-channel-title');
    var channelId = newVideo.attr('data-channel-id');
    var description = newVideo.attr('data-description');
    var datePublished = newVideo.attr('data-published');

    var embedLink = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    var channelLink = `https://www.youtube.com/channel/${channelId}`;
    var timestamp = new Date(Date.parse(datePublished));
    var uploadMonth = timestamp.getMonth();
    var uploadYear = timestamp.getFullYear();

    $(FRAME).attr('src', embedLink);
    $(VIDEO_NAME).text(title);
    $(CHANNEL_NAME).text(channelTitle);
    $(CHANNEL_NAME).attr('href', channelLink);
    $(MONTH).text(uploadMonth);
    $(YEAR).text(uploadYear);

    // responsiveIframes();
    setVideoDimensions();
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Sets the appropriate dimensions of current video based on
// whether the video is 4K or user has chosen to  
// enlarge / minimize the video player manually 
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function setVideoDimensions(enlarge) {
    var width = '';
    var height = '';
    if (state._4k_filter || enlarge || state.currentlyEnlarged) {
        width = '1024px';
        height = '576px';
        $(NEW_SEARCH_TIMES_LABEL).addClass('hidden');
        $(ENLARGE_BTN).addClass('hidden');
        $(MINIMIZE_BTN).addClass('hidden');
        $('label[for="enlarge"]').addClass('hidden');
        
        $(FRAME_CONTAINER).addClass('wide');
        $(TIMES_ICON).addClass('hd-4k');
        $(RESULT_CAROUSEL).addClass('hd-4k');
        $(TIMES_ICON).addClass('hd-4k');

        // minimizeCarousel();
    } else {
        $(NEW_SEARCH_TIMES_LABEL).removeClass('hidden');
        $(ENLARGE_BTN).removeClass('hidden');
        $(MINIMIZE_BTN).removeClass('hidden');
        $('label[for="enlarge"]').removeClass('hidden');
        $(FRAME_CONTAINER).removeClass('wide');
        $(TIMES_ICON).removeClass('hd-4k');

        // enlargeCarousel();
    }
    $(FRAME).css({
        width: width,
        height: height
    });
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Closes the lightbox, stopping current video playing
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function closeLightbox() {
    $(FRAME).attr('src', ''); //$(FRAME).attr('src').slice(0, -1) + '0'
    $(LIGHTBOX).addClass('hidden');
    $(VIDEO_THUMBNAIL).removeClass('small-video-thumbnail');
    $(RESULT_CAROUSEL).removeClass('small-carousel');
    $('.slick-track').removeClass('small-slick-track');
    $('.slick-slide').removeClass('small-slick-slide');
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Hides the minimize video button and displays ther
// enlarge video button
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function hideMinimizeIcon() {
    $(ENLARGE_BTN).removeClass('hidden');
    $(MINIMIZE_BTN).addClass('hidden');
    $('label[for="minimize"]').addClass('hidden');
    $('label[for="enlarge"]').removeClass('hidden');
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Hides the enlarge video button and displays ther
// minimize video button
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function hideEnlargeIcon() {
    $(ENLARGE_BTN).addClass('hidden');
    $('label[for="enlarge"]').addClass('hidden');
    $('label[for="minimize"]').removeClass('hidden');
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Minimizes the carousel slides height in order to fit 
// them in lightbox with large video frame.
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function minimizeCarousel() {
    $(VIDEO_THUMBNAIL).addClass('small-video-thumbnail');
    $(RESULT_CAROUSEL).addClass('small-carousel');
    $('.slick-track').addClass('small-slick-track');
    $('.slick-slide').addClass('small-slick-slide');

    var currentSlide = $('.responsive').slick('slickCurrentSlide');
    $('.responsive').slick('slickGoTo', currentSlide, true);
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Sets the carousel slides back to their initial size
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function enlargeCarousel() {
    $(VIDEO_THUMBNAIL).removeClass('small-video-thumbnail');
    $(RESULT_CAROUSEL).removeClass('small-carousel');
    $('.slick-track').removeClass('small-slick-track');
    $('.slick-slide').removeClass('small-slick-slide');

    var currentSlide = $('.responsive').slick('slickCurrentSlide');
    $('.responsive').slick('slickGoTo', currentSlide, true);
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Displays the user's search query in search bar
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function showUserQuery() {
    $(USER_QUERY_LABEL).removeClass('hidden');
    $(SEARCH_RESULTS_SPAN).removeClass("hidden");
    $(BROWSE_VIDEOS_SPAN).addClass('hidden');
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Displays browse title for 4K and live videos in 
// search bar
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function showBrowseVideos() {
    $(USER_QUERY_LABEL).removeClass('hidden');
    $(SEARCH_RESULTS_SPAN).addClass("hidden");
    $(BROWSE_VIDEOS_SPAN).removeClass('hidden');
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Resets result page numbers for new search
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function resetPageNumber() {
    state.currentPageNum = 1;
    $(PAGE_NUM).text(state.currentPageNum);
    $(PREV_PAGE_BTN).addClass('toggled');
}

//================================================================================
// Slick functions
//================================================================================

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Loads the results carousel with new search result
// item thumbnails and then (re)initiates carousel
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function loadCarousel(index) {
    $(RESULT_CAROUSEL).html(state.thumbnails.join(''));
    initLightboxCarousel(index);
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// (Re)Initializes responsive carousel 
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function initLightboxCarousel(index) {
    $('.responsive').slick({
        dots: true,
        arrows: false,
        infinite: false,
        speed: 300,
        slidesToShow: 3,
        slidesToScroll: 3,
        initialSlide: index,
        variableWidth: true,
        centerMode: false,
        focusOnSelect: false,
        responsive: [
            {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 2,
                infinite: false,
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
    // slickEvents();
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Unslicks / destroys slick carousel 
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function unslickCarousel() {
    $('.responsive').slick('unslick');
    state.isSlick = false;
}

//================================================================================
// Utility Functions
//================================================================================


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
    // ;
    (Number($("body").css('width').slice(0, -2)) <= 416) ? state.mobile = true : state.mobile = false;
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Fixes the search bar to the top of the window when user
// scrolls below its initial position in document and 
// moves it back to its initial position when user 
// scrolls back above its container
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function fixedSearchBar() {
    $(window).scroll(function(e) {
        var scroll = $(window).scrollTop();
        // console.log(scroll);
        if(scroll > $(window).height()) {
            $(SEARCH_FORM).addClass('fixed-search-bar');
            $(SEARCH_NAV).addClass('fixed-search-bar');
            $(SEARCH_DROPDOWN_CONTENT).addClass('fixed');
            $(FORM_CONTAINER).addClass('form-backdrop');
            $(RESULTS + ' div:first-of-type').addClass('mobile-results-adjust');
            if (!state.mobile) {
                // $(USER_QUERY_LABEL).css({marginTop: '10px'});
            } 
        } else {
            $(SEARCH_FORM).removeClass('fixed-search-bar');
            $(SEARCH_NAV).removeClass('fixed-search-bar');
            $(SEARCH_DROPDOWN_CONTENT).removeClass('fixed');
            $(FORM_CONTAINER).removeClass('form-backdrop');
            $(RESULTS + ' div:first-of-type').removeClass('mobile-results-adjust');
            $(USER_QUERY_LABEL).css({marginTop: ''});
        }
        
    });
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Resizes target text to make sure it fits inside of 
// its container.
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function dynamicQueryLabelFontSize(target, container) {
    var $target = $(target);
    var $container = $(container);
    var fontSizeChanged = 0;
    $target.css('font-size', '');
    $container.css('line-height', '');

    console.log($target.css('font-size'), $container.css('line-height'));
    while($target.height() > $container.height()) {
        $target.css('font-size', (parseInt($target.css('font-size').slice(0,-2) - 1)) + 'px');
        console.log('inSIDE');
        console.log($target.css('font-size'), $container.css('line-height'));
        fontSizeChanged++;
    }  
    if (fontSizeChanged) {
        $container.css('line-height', $target.css('font-size'));
    }
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Gives a smooth animation to page navigation bringing the 
// target element to the top of the window
// If truthy value is passed, extra offset height added
// accounts for fixed search bar height;
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function smoothScroll(target, fixed) {
    var fixed_offset = fixed ? 30 : 0;
    $('body, html').animate({
        scrollTop: $(target).offset().top + fixed_offset
    }, 800);
}



//================================================================================
// API handlers
//================================================================================

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Handler to make YouTube API search method calls and
// makes calls to store and display search results
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function searchYoutubeHandler() { 
   if(state._4k_filter) {
        _4kVideoHandler(state.user_query);
    } else {
        var quality = state.hd_filter ? 'high' : 'any';
        searchYouTube(state.user_query, quality, 'any', 'relevance', function(resp) {
            state.search_results = resp;
            console.log(resp);
            $(USER_QUERY_LABEL).removeClass('hidden');
            $(USER_QUERY).text(state.user_query);
            if (state.hd_filter) {
                $(RESULTS_TYPE).text('HD');
            } else {
                $(RESULTS_TYPE).empty();
            }
            showUserQuery();
            resetPageNumber();
            displayResults(resp);
            dynamicQueryLabelFontSize(SEARCH_RESULTS_SPAN, USER_QUERY_LABEL);
        }, 50);
    }
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Handles API calls for prev / next page tokens
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function searchByPageTokenHandler(pageToken) {
    var query = state.user_query;
    var quality = 'any';
    
    if (state.live_browse) {
        searchLiveVideosToken('live', pageToken, state.currentLiveCategory, function(resp) {
            state.search_results = resp;
            // debugger;
            console.log(resp);
            displayResults(resp);
        }, 50);
    } else {
        if (state.hd_filter) {
            quality = 'high';
        } else if (state._4k_filter) {
            query = `${state.user_query} 4K`;
            quality = 'high';
        } else if (state._4k_browse) {
            query = '4K';
            quality = 'high';
        }
        searchYouTubePageToken(query, quality, 'any', 'relevance', pageToken, function(resp) {
                state.search_results = resp;
                // smoothScroll('main');
                displayResults(resp);
        }, 50);
    }
}


// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Handles all API calls for live broadcast content
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function liveVideoHandler(category_id) {
    searchLiveVideos('live', category_id, function(resp) {
        state.search_results = resp;
        resetPageNumber();
        console.log(resp);
        displayResults(resp);
    }, 50);
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Handles any API calls for 4K quality footage. If no
// query is given, defaults to popular general 4K videos
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function _4kVideoHandler(query) {
    var q = arguments.length > 0 ? `${query} 4K` : '4K';
    searchYouTube(q, 'high', 'any',  'relevance', function(resp) {
        state.search_results = resp;
        $(USER_QUERY_LABEL).removeClass('hidden');
        $(RESULTS_TYPE).text('4K');
        if(q.length > 2) {
            $(USER_QUERY).text(query);
            showUserQuery();
        }
        resetPageNumber();
        displayResults(resp);
        dynamicQueryLabelFontSize(SEARCH_RESULTS_SPAN, USER_QUERY_LABEL);
    }, 50);
}


//================================================================================
// API Calls
//================================================================================

var YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/';

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Searches YouTube data API by search term given by user
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function searchYouTube(searchTerm, quality, type, order, callback, maxResults) {
    if(arguments.length == 1) {
        callback = printToConsole;
        maxResults = 50;
    } else if (arguments.length == 4) {
        maxResults = 50;
    }
    var SEARCH_URL = YOUTUBE_BASE_URL + 'search/';
    var query = {
        key: 'AIzaSyCtbQ7eOypMc7OKBSGFs46aIL6Ozmmeygw',
        part: 'snippet',
        q: searchTerm,
        type: 'video',
        videoDefinition: quality, //any,high,standard
        videoType: type,          //any,episode,movie
        order: order,
        maxResults: maxResults
    };
    $.getJSON(SEARCH_URL, query, callback);
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Searches YouTube data API by page token to fetch
// previous and next pages in search results data
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function searchYouTubePageToken(searchTerm, quality, type, order, 
                                pageToken, callback, maxResults) {
    if(arguments.length == 1) {
        callback = printToConsole;
        maxResults = 50;
    } else if (arguments.length == 4) {
        maxResults = 50;
    }
    var SEARCH_URL = YOUTUBE_BASE_URL + 'search/';
    var query = {
        key: 'AIzaSyCtbQ7eOypMc7OKBSGFs46aIL6Ozmmeygw',
        part: 'snippet',
        q: searchTerm,
        type: 'video',
        videoDefinition: quality, //any,high,standard
        videoType: type,          //any,episode,movie
        order: order,
        pageToken: pageToken,
        maxResults: maxResults
    };
    $.getJSON(SEARCH_URL, query, callback);
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Searches YouTube data API for live broadcast videos
// based on video category ID's
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function searchLiveVideos(status, category_id, callback, maxResults) {
    if(arguments.length == 2) {
        callback = printToConsole;
        maxResults = 25;
    } else if (arguments.length == 3) {
        maxResults = 25;
    }
    var SEARCH_URL = YOUTUBE_BASE_URL + 'search/';
    var query = {
        key: 'AIzaSyCtbQ7eOypMc7OKBSGFs46aIL6Ozmmeygw',
        part: 'snippet',
        type: 'video',
        eventType: status, // completed,live,upcoming
        // order: 'viewCount',
        maxResults: maxResults
    };
    // ;
    if (category_id != 'all') {
        query.videoCategoryId = category_id;
    }
    $.getJSON(SEARCH_URL, query, callback);
}

function searchLiveVideosToken(status, pageToken, category_id, callback, maxResults) {
    if(arguments.length == 3) {
        callback = printToConsole;
        maxResults = 25;
    } else if (arguments.length == 4) {
        maxResults = 25;
    }
    var SEARCH_URL = YOUTUBE_BASE_URL + 'search/';
    var query = {
        key: 'AIzaSyCtbQ7eOypMc7OKBSGFs46aIL6Ozmmeygw',
        part: 'snippet',
        type: 'video',
        eventType: status, // completed,live,upcoming
        pageToken: pageToken,
        maxResults: maxResults
    };
    // ;
    if (category_id != 'all') {
        query.videoCategoryId = category_id;
    }
    $.getJSON(SEARCH_URL, query, callback);
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Searches YouTube data API for most popular videos
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function searchPopularVideos() {
    var SEARCH_URL = YOUTUBE_BASE_URL + 'videos/';
    var query = {
        key: 'AIzaSyCtbQ7eOypMc7OKBSGFs46aIL6Ozmmeygw',
        part: 'snippet',
        chart: 'mostPopular'
    };
    $.getJSON(SEARCH_URL, query, printToConsole);
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Searches YouTube data API by video ID number
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function searchVideoById(video_ID, callback) {
    if(arguments.length == 1) {
        callback = printToConsole;
    } 
    var VIDEOS_URL = YOUTUBE_BASE_URL + 'videos';
    var query = {
        key: 'AIzaSyCtbQ7eOypMc7OKBSGFs46aIL6Ozmmeygw',
        part: 'snippet,contentDetails',
        id: video_ID
    };
    $.getJSON(VIDEOS_URL, query, callback);
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Makes calls to Internet Video Archive API 
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function internetVideoArchive() {
    // var ivaUrl = 'https://ee.iva-api.com/Movies/1';
    var ivaUrl = 'https://ee.iva-api.com/Videos/GetVideo/1';
    var dt = new Date();
    dt.setMonth(11);
    var stamp = dt.toISOString();
    ;
    // var ivaUrl = 'https://ee.iva-api.com/ExternalIds/ImdbMovie';
    var query = {
        // Skip: 0,
        // Take: 30,
        Format: 'mp4',
        Expires: stamp,
        format: 'json',
        'subscription-key': '66319ae0cd76409cb63e30a70eaad1c2'
    };
    $.getJSON(ivaUrl, query, function(resp) {
        console.log('IVA', resp)
    });
}



//================================================================================
// Event Listeners
//================================================================================

//
//
function scrollToSearchBar() {
    $(EXPLORE).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        smoothScroll('main');
        $(QUERY).focus();
    });
}

//
//
function scrollToTop() {
    $(TOP).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        smoothScroll('.banner');
    });
}
    
//
//
function searchFormSubmit() {
    $(SEARCH_FORM).on('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        smoothScroll('main', true);
        state.user_query = $(QUERY).val();
        $(QUERY).val('');
        state._4k_browse = false;
        state.live_browse = false;
        searchYoutubeHandler();
    });
}




//
//
function getNextPageClick() {
    $(NEXT_PAGE_BTN).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (state.search_results.hasOwnProperty('nextPageToken')) {
            searchByPageTokenHandler(state.search_results.nextPageToken);
            $(PREV_PAGE_BTN).removeClass('toggled');
            $(PAGE_NUM_WRAP).removeClass('hidden');
            $(PAGE_NUM).text(++state.currentPageNum);
            // debugger;
            // smoothScroll('main', true);
            if($(this).hasClass('bottom')) {
                console.log('bottom');
                smoothScroll('main', true);
            } else {
                console.log('top');
            }
        } else {
            $(NEXT_PAGE_BTN).addClass('toggled');
        }
    });
}

//
//
function getPrevPageClick() {
    $(PREV_PAGE_BTN).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (state.search_results.hasOwnProperty('prevPageToken')) {
            searchByPageTokenHandler(state.search_results.prevPageToken);
            $(PAGE_NUM).text(--state.currentPageNum);
            state.currentPageNum == 1 ? $(PREV_PAGE_BTN).addClass('toggled') : null;
            if($(this).hasClass('bottom')) {
                smoothScroll('main', true);
            } 
        } else {
            $(PREV_PAGE_BTN).addClass('toggled');
        }
    });
}

//
//
function hdVideoFilterCheck() {
    $(HD_CHECKBOX).on('change', function(e) {
        // alert('hd checked!');
        // ;
        e.preventDefault();
        e.stopPropagation();
        state.hd_filter = this.checked ? true : false;
    });
}

//
//
function _4kVideoFilterCheck() {
    $(_4K_CHECKBOX).on('change', function(e) {
        e.preventDefault();
        e.stopPropagation();
        state._4k_filter = this.checked ? true : false;
    });
}

//
//
function allowOnlyOneCheckbox() {
    $('input[type="checkbox"').on('change', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.checked) {
            $('input[type="checkbox"').not(this).prop('checked', false);
            var state_filter = $('input[type="checkbox"').not(this).attr('data-state-id');
            if (state_filter == "_4k_filter") {
                state._4k_filter = false;
            } else {
                state.hd_filter = false;
            }
        }
    });
}

//
//
function playVideoLightboxClick() {
    $('body').on('click', VIDEO_THUMBNAIL, function(e) {
        e.preventDefault();
        hideMinimizeIcon();
        openLightbox($(this), $(this).attr('data-index'));
        // return false;
    });
}

//
//
function enlargeVideoClick() {
    $(ENLARGE_BTN).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        state.currentlyEnlarged = true;
        hideEnlargeIcon();
        setVideoDimensions(state.currentlyEnlarged);
        minimizeCarousel();
        $('label.slide-label').css('font-size', '10px');
        $(CHANNEL_OUTER_WRAP).css('margin-top', '5px');
    });
}

//
//
function minimizeVideoClick() {
    $(MINIMIZE_BTN).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        state.currentlyEnlarged = false;
        hideMinimizeIcon();
        setVideoDimensions();
        enlargeCarousel();
        $('label.slide-label').css('font-size', '');
        $(CHANNEL_OUTER_WRAP).css('margin-top', '');
    });
}

//
//
function lightboxCarouselVideoClick() {
    $(LIGHTBOX).on('click', '.slick-slide', function(e) {
        e.preventDefault();
        e.stopPropagation();
        updateCurrentVideo($(this).children(VIDEO_THUMBNAIL));
    });
}

//
//
function closeLightboxClick() {
    $(document).on('click', MODAL_FILTER + ', ' + TIMES_ICON, function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target == $(MODAL_FILTER)[0] || e.target == $(TIMES_ICON)[0]) {
            unslickCarousel();
            closeLightbox();
            state.currentlyEnlarged = false;
        }
    });
}

//
//
//
function titleClick() {
    $(TITLE).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        location.reload();
    });
}

//
//
//
function missionStatementClick() {
    $(MISSION).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        smoothScroll('.banner');
        $(SLOGAN).addClass('hidden');
        $(MISSION_STATEMENT).removeClass('hidden');
        $(DROPDOWN_CONTENT).removeClass('show-nav');
    });
}


//
//
function liveVideoClick() {
    live_channels.forEach(function(channel) {
        $(channel.selector).on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            state.mobile ? smoothScroll('main') : smoothScroll('main', true);
            showBrowseVideos();
            $(USER_QUERY_LABEL).css('line-height', '');
            $(BROWSE_VIDEOS_SPAN).text(channel.text);
            $(USER_QUERY).empty();
            $(USER_QUERY_WRAP).addClass("hidden");
            state.live_browse = true;
            state._4k_browse = false;
            state.currentLiveCategory = channel.category;
            liveVideoHandler(channel.category);
            $(DROPDOWN_CONTENT).removeClass('show-nav');
            $(SEARCH_DROPDOWN_CONTENT).removeClass('show-nav');
        });
    });
}

//
//
function _4kVideoClick() {
    $(_4K_NAV_ITEM).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        state.mobile ? smoothScroll('main') : smoothScroll('main', true);
        showBrowseVideos();
        $(USER_QUERY_LABEL).css('line-height', '');
        $(BROWSE_VIDEOS_SPAN).text('Browse 4K Videos');
        $(USER_QUERY).empty();
        $(USER_QUERY_WRAP).addClass("hidden");
        state._4k_browse = true;
        state.live_browse = false;
        _4kVideoHandler();
        $(DROPDOWN_CONTENT).removeClass('show-nav');
        $(SEARCH_DROPDOWN_CONTENT).removeClass('show-nav');
    });
}

function mobileNavClicks() {
   $(HEADER_NAV).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        $(DROPDOWN_CONTENT).toggleClass('show-nav');
        return false;
    });

    $(SEARCH_NAV).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        $(SEARCH_DROPDOWN_CONTENT).toggleClass('show-nav');
        return false;
    });

    // $(window).on('', function(e) {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     if (e.target != SEARCH_DROPDOWN_CONTENT) {
    //         $(SEARCH_DROPDOWN_CONTENT).css('display', '');
    //     }
    //     return false;
    // });
}

//
//
function slickEvents() {
    // On edge hit
    $('.responsive').on('edge', function(event, slick, direction){
        console.log('edge was hit')
    });
}


//================================================================================
// Event groups
//===============================================================================

function navEventListeners() {
    mobileNavClicks();
    titleClick();
    _4kVideoClick();
    liveVideoClick();
    missionStatementClick();
}

function searchEventListeners() {
    searchFormSubmit();
    fixedSearchBar();
    dynamicQueryLabelFontSize();
    hdVideoFilterCheck();
    _4kVideoFilterCheck();
    allowOnlyOneCheckbox();
    getNextPageClick();
    getPrevPageClick();
}

function utilitiesEventListeners() {
    scrollToSearchBar();
    scrollToTop();
    checkSizeHandler();
}

function lightboxEventListeners() {
    playVideoLightboxClick();
    lightboxCarouselVideoClick();
    closeLightboxClick();
    enlargeVideoClick();
    minimizeVideoClick();
}


//================================================================================
// Entry Point
//================================================================================
$(function() {
    navEventListeners();
    utilitiesEventListeners();
    searchEventListeners();
    lightboxEventListeners();

    searchVideoById('LY19rHKAaAg');

    searchLiveVideosToken('live', "CGQQAA", 10, printToConsole, 50);
});
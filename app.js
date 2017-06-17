'use strict';

var state = {
    user_query: '',
    hd_filter: false,
    _4k_filter: false,
    currentlyEnlarged: false,
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
var LIVE = '.live';
var _4K_NAV_ITEM = '.nav-4k'

var FORM_CONTAINER = '#form-container';
var SEARCH_CONTAINER = '#search-container';
var SEARCH_FORM = '.search-form';
var HD_CHECKBOX = '#hd-checkbox';
var _4K_CHECKBOX = '#4k-checkbox';
var QUERY = '#query';
var USER_QUERY_LABEL = '#query-label';
var USER_QUERY = '.user-query';
var RESULTS_TYPE = '#results-type';
var SEARCH_RESULTS_SPAN = '#search-results-span';
var BROWSE_VIDEOS_SPAN = '#browse-videos-span';
var RESULTS = '.results';
var VIDEO_THUMBNAIL = '.video-thumbnail';
var PAGE_CONTROLS_CONTAINER = '.page-controls-container';

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
//================================================================================
// Display user search results to screen
//================================================================================

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
    $(RESULTS).empty().append(videos.join(''));
    $(PAGE_CONTROLS_CONTAINER).removeClass('hidden');
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
function openLightbox(video_img, index) {
    $(LIGHTBOX).removeClass('hidden');
    updateCurrentVideo(video_img);
    loadCarousel(index);
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

function setVideoDimensions(enlarge) {
    var width = '';
    var height = '';
    if (state._4k_filter || enlarge || state.currentlyEnlarged) {
        width = '1024px';
        height = '576px';
        $(NEW_SEARCH_TIMES_LABEL).addClass('hidden');
        $(FRAME_CONTAINER).addClass('wide');
        $(TIMES_ICON).addClass('hd-4k');
        $(RESULT_CAROUSEL).addClass('hd-4k');
        $(TIMES_ICON).addClass('hd-4k');
    } else {
        $(NEW_SEARCH_TIMES_LABEL).removeClass('hidden');
        $(FRAME_CONTAINER).removeClass('wide');
        $(TIMES_ICON).removeClass('hd-4k');
    }
    $(FRAME).css({
        width: width,
        height: height
    });
}

//
//
//
function closeLightbox() {
    $(FRAME).attr('src', ''); //$(FRAME).attr('src').slice(0, -1) + '0'
    $(LIGHTBOX).addClass('hidden');
}

//
//
//
function hideMinimizeIcon() {
    $(ENLARGE_BTN).removeClass('hidden');
    $(MINIMIZE_BTN).addClass('hidden');
    $('label[for="minimize"]').addClass('hidden');
    $('label[for="enlarge"]').removeClass('hidden');
}

//
//
//
function hideEnlargeIcon() {
    $(ENLARGE_BTN).addClass('hidden');
    $('label[for="enlarge"]').addClass('hidden');
    $('label[for="minimize"]').removeClass('hidden');
}

//
//
//
function showUserQuery() {
    $(USER_QUERY_LABEL).removeClass('hidden');
    $(SEARCH_RESULTS_SPAN).removeClass("hidden");
    $(BROWSE_VIDEOS_SPAN).addClass('hidden');
}

//
//
//
function showBrowseVideos() {
    $(USER_QUERY_LABEL).removeClass('hidden');
    $(SEARCH_RESULTS_SPAN).addClass("hidden");
    $(BROWSE_VIDEOS_SPAN).removeClass('hidden');
}

//================================================================================
// Slick functions
//================================================================================

//
//
//
function loadCarousel(index) {
    $(RESULT_CAROUSEL).html(state.thumbnails.join(''));
    initLightboxCarousel(index);
}

//
//
//
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
        focusOnSelect: true,
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

//
//
//
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
                // $(USER_QUERY_LABEL).css({marginTop: '10px'});
            } 
        } else {
            $(SEARCH_FORM).removeClass('fixed-search-bar');
            $(FORM_CONTAINER).removeClass('form-backdrop');
            $(USER_QUERY_LABEL).css({marginTop: ''});
        }
        
    });
}

//
//
//
function smoothScroll(target) {
    $('body, html').animate({
        scrollTop: $(target).offset().top
    }, 800);
}

//
//
//
function responsiveIframes() {
    var $iframes = $('iframe');
    $iframes.each(function() {
        $(this).data('ratio', this.height / this.width)
               .removeAttr('width')
               .removeAttr('height');
    });

    $(window).resize(function() {
        $iframes.each(function() {
            var width = $(this).parent().width();
            $(this).width(width)
                   .height(width * $(this).data('ratio'));
        });
    }).resize();
}

//================================================================================
// API handlers
//================================================================================

//
//
//
function searchYoutubeHandler() { 
    var query = state._4k_filter ? `${state.user_query} 4k` : state.user_query;
    var quality = state.hd_filter ? 'high' : 'any'
    searchYouTube(query, quality, 'any', 'relevance', function(resp) {
        state.search_results = resp.items;
        console.log(resp);
        $(USER_QUERY_LABEL).removeClass('hidden');
        $(USER_QUERY).text(state.user_query);
        if (state._4k_filter) {
            $(RESULTS_TYPE).text('4K');
        } else if (state.hd_filter) {
            $(RESULTS_TYPE).text('HD');
        } else {
            $(RESULTS_TYPE).empty();
        }
        showUserQuery();
        displayResults(resp);
    }, 20);
}

//
//
//
function liveVideoHandler() {
    searchLiveVideos('live', function(resp) {
        state.search_results = resp.items;
        displayResults(resp);
    }, 50);
}

//
//
//
function _4kVideoHandler() {
    searchYouTube('4K', 'high', 'any',  'relevance', function(resp) {
        state.search_results = resp.items;
        $(USER_QUERY_LABEL).removeClass('hidden');
        $(RESULTS_TYPE).text('4K');
        displayResults(resp);
    }, 50);
}


//================================================================================
// API Calls
//================================================================================

var YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/';

//
//
//
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

//
//
//
function searchLiveVideos(status, callback, maxResults) {
    if(arguments.length == 1) {
        callback = printToConsole;
        maxResults = 25;
    } else if (arguments.length == 2) {
        maxResults = 25;
    }
    var SEARCH_URL = YOUTUBE_BASE_URL + 'search/';
    var query = {
        key: 'AIzaSyCtbQ7eOypMc7OKBSGFs46aIL6Ozmmeygw',
        part: 'snippet',
        type: 'video',
        eventType: status, // completed,live,upcoming
        // order: 'viewCount',
        videoCategoryId: '10',
        maxResults: maxResults
    };
    $.getJSON(SEARCH_URL, query, callback);
}

//
//
//
function searchPopularVideos() {
    var SEARCH_URL = YOUTUBE_BASE_URL + 'videos/';
    var query = {
        key: 'AIzaSyCtbQ7eOypMc7OKBSGFs46aIL6Ozmmeygw',
        part: 'snippet',
        chart: 'mostPopular'
    };
    $.getJSON(SEARCH_URL, query, printToConsole);
}

//
//
//
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

//
//
//
function internetVideoArchive() {
    // var ivaUrl = 'https://ee.iva-api.com/Movies/1';
    var ivaUrl = 'https://ee.iva-api.com/Videos/GetVideo/1';
    var dt = new Date();
    dt.setMonth(11);
    var stamp = dt.toISOString();
    debugger;
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
        $(QUERY).val('');
        searchYoutubeHandler();
    });
}

function hdVideoFilterCheck() {
    $(HD_CHECKBOX).on('change', function(e) {
        e.preventDefault();
        state.hd_filter = this.checked ? true : false;
    });
}

function _4kVideoFilterCheck() {
    $(_4K_CHECKBOX).on('change', function(e) {
        e.preventDefault();
        state._4k_filter = this.checked ? true : false;
    });
}

function allowOnlyOneCheckbox() {
    $('input[type="checkbox"').on('change', function(e) {
        e.preventDefault();
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

function playVideoLightboxClick() {
    $(RESULTS).on('click', VIDEO_THUMBNAIL, function(e) {
        e.preventDefault();
        hideMinimizeIcon();
        openLightbox($(this), $(this).attr('data-index'));
    });
}

function enlargeVideoClick() {
    $(ENLARGE_BTN).on('click', function(e) {
        e.preventDefault();
        state.currentlyEnlarged = true;
        hideEnlargeIcon();
        setVideoDimensions(state.currentlyEnlarged);
    });
}

function minimizeVideoClick() {
    $(MINIMIZE_BTN).on('click', function(e) {
        e.preventDefault();
        state.currentlyEnlarged = false;
        hideMinimizeIcon();
        setVideoDimensions();
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
            state.currentlyEnlarged = false;
        }
    });
}

function liveVideoClick() {
    $(LIVE).on('click', function(e) {
        e.preventDefault();
        smoothScroll('main');
        showBrowseVideos();
        $(BROWSE_VIDEOS_SPAN).text('Browse Live Videos');
        liveVideoHandler();
    });
}

function _4kVideoClick() {
    $(_4K_NAV_ITEM).on('click', function(e) {
        e.preventDefault();
        smoothScroll('main');
        showBrowseVideos();
        $(BROWSE_VIDEOS_SPAN).text('Browse 4K Videos');
        _4kVideoHandler();
    });
}

function getNextPage() {
    // Implement for each api call
    // make sure maxResults and offset is correct for Each api call
}

function getPrevPage() {
    // Implement for each api call
    // make sure maxResults and offset is correct for Each api call
}

function slickEvents() {
    // On edge hit
    $('.responsive').on('edge', function(event, slick, direction){
        console.log('edge was hit')
    });
}

//================================================================================
// Event groups
//===============================================================================

function searchEventListeners() {
    searchFormSubmit();
    fixedSearchBar();
    liveVideoClick();
    _4kVideoClick();
    hdVideoFilterCheck();
    _4kVideoFilterCheck();
    allowOnlyOneCheckbox();
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
    utilitiesEventListeners();
    searchEventListeners();
    lightboxEventListeners();


    slickEvents();
    // initLightboxCarousel();
    searchVideoById('EkBalQOxLgg');
    // internetVideoArchive();
});
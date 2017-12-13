var category_ids = { 
    film_animation: 1,
    auto_vehicles: 2,
    music: 10,
    pets_animals: 15,
    sports: 17,
    short_movies: 18,
    travel_events: 19,
    gaming: 20,
    blogging: 21,
    people_blogs: 22,
    comedy: 23,
    entertainment: 24,
    news_politics: 25,
    howTo_style: 26,
    edu: 27,
    science_tech: 28,
    movies: 30,
    anime_animation: 31,
    action_adventure: 32,
    classics: 33,
    docu: 35,
    drama: 36,
    family: 37,
    horror: 39,
    sci_fi_fantasy: 40,
    thriller: 41,
    shorts: 42,
    shows: 43,
    trailers: 44
}

var live_channels = [
    {
        selector: '.live',
        text: 'Live Channels',
        category: 'all'
    },
    {
        selector: '.live-all',
        text: 'Live Channels',
        category: 'all'
    },
    {
        selector: '.live-music',
        text: 'Live Music Channels',
        category: category_ids.music
    },
    {
        selector: '.live-gaming',
        text: 'Live Gaming Channels',
        category: category_ids.gaming
    },
    {
        selector: '.live-sports',
        text: 'Live Sports Channels',
        category: category_ids.sports
    },
    {
        selector: '.live-animals',
        text: 'Live Animal Channels',
        category: category_ids.pets_animals
    },
    {
        selector: '.live-animation',
        text: 'Live Animation Channels',
        category: category_ids.film_animation
    },
    {
        selector: '.live-science',
        text: 'Live Science/Tech Channels',
        category: category_ids.science_tech
    },
    {
        selector: '.live-travel',
        text: 'Live Travel Channels',
        category: category_ids.travel_events
    },
]


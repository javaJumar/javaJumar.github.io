const eventbriteKey = '4CMGDQLH3H24Q4O62ZR7';
const eventbriteUrl = 'https://www.eventbriteapi.com/v3';
let map;

//get the list of events from Eventbrite API endpoint
function getEvents(interest, zipCode) {
    const endpoint =
        `${eventbriteUrl}/events/search/?q=${interest}&location.address=${zipCode}&location.within=50mi&expand=organizer,venue`;
    const options = {
        url: endpoint,
        headers: {
            'Authorization': `Bearer ${eventbriteKey}`
        }
    }
    // this gets the data from Eventbrite's endpoint
    $.get(options).done(response => {
        console.log(response);
        const events = response.events;
        const newLat = response.location.latitude;
        const newLng = response.location.longitude;
        centerMap(+newLat, +newLng);
        const infowindow = new google.maps.InfoWindow({ maxWidth: 130 });
        if (events.length === 0) {
            $('.no-event').show();
        } else {
            events.map(event => {
                createMarker(event, infowindow);
            })
            $('.click-event').show();
            $('#events').show();
        }
        events.map(event => {
            createMarker(event, infowindow);
        })
    }).fail(error => {
        console.log(error)
    })
}

//this creates the event information in the left container
function createEventTemplate(event) {
    console.log(event);
    const startTime = event.start.local;
    const endTime = event.end.local;
    const newStartTime = moment(startTime).format('LLLL');
    const newEndTime = moment(endTime).format('LLLL');
    const eventLink = event.url;
    const logoUrl = event.logo ? event.logo.original.url : '';
    const logo = event.logo ? `<img class='event-pic' src='${logoUrl}' alt='event photo'>` : '';
    const content = `<div class='event-container'>
            <a id='home-screen' href='index.html'>Home/Search Again</a>
            <a action="action" onclick="window.history.go(-1); return false;" type="button" value="Back" id='back-to-map' class='back-button'>Back to Map Results</a>
            <div>${logo}</div>
            <p class ='event-heading'>${event.name.text}:</p> 
            <p class='times'>${newStartTime} to ${newEndTime}</p>
            <p class='event-description'>${event.description.text}:
            <a class='event-link' href='${eventLink}?token=4CMGDQLH3H24Q4O62ZR7' target="_blank">Event Link</a></p>
            </div>`;
    return content;
}

function createMarker(event, infowindow) {
    const { venue, url, name } = event;
    console.log(name);
    const { latitude, longitude } = venue;
    const position = { lat: +latitude, lng: +longitude }
    console.log(position);
    const template = createEventTemplate(event);
    let marker = new google.maps.Marker({
        position,
        url,
        map
    });
    const content = `<div class = 'marker-info >
        <p class='marker-title'>"${name.text}"</p>
        <a class='marker-link' href='${url}' target="_blank">Here's a link to the event!<a />
    </div>`
    if (isMobile()) {
        closeEvents();
    }
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker);
        infowindow.setContent(content);
        console.log('marker');
        $('#event-detail').html(template);
        if (isMobile()) {
            console.log('open events');
            openEvents();
            $('#back-to-map').click(function () {
                console.log('click');
                closeEvents();
            })
        }
    });
    google.maps.event.addListener(map, 'click', function () {
        infowindow.close();
    });
}


function openEvents() {
    $('#events').show();
    $('#back-to-map').removeClass('back-button');
}

function closeEvents() {
    $('#events').hide();
}

function isMobile() {
    return $(window).width() < 960;
}

function centerMap(newLat, newLng) {
    var settings = {
        zoom: 11,
        center: { lat: newLat, lng: newLng },
        gestureHandling: 'greedy',
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    map = new google.maps.Map(document.getElementById('map'), settings);
}

function initMap() {
    //this is the Map options
    var settings = {
        zoom: 10,
        center: { lat: 34.052235, lng: -118.243683 },
        gestureHandling: 'greedy',
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    //renders Map on the browser
    map = new google.maps.Map(document.getElementById('map'), settings);
    let geocoder = new google.maps.Geocoder();
    document.getElementById('submit').addEventListener('click', function () {
    });

    //this is to set the marker on the Map itself
    var marker = new google.maps.Marker({
        position: { lat: 33.745571, lng: -117.867836 },
        map: map
    });
}

function renderResults() {
    $('header').remove();
    $('.tagline').remove();
    $('form').remove();
    $('#map').show();
    if (!isMobile) {
        $('#events').show();
    }
}

// //calling Init 
function main() {
    onSubmit();
    $('#back').click(closeEvents);
}

function onSubmit() {
    $('form').submit(event => {
        event.preventDefault();
        console.log(event);
        const interest = $('#interest').val();
        const zipCode = $('#zipCode').val();
        $('form').find('#interest').val("");
        $('form').find('#zipCode').val("");
        $('#events').removeClass('hidden-element');
        $('#maps').removeClass('hidden-element');
        renderResults();
        getEvents(interest, zipCode);
    })
}

main();
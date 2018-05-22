const eventbriteKey = '4CMGDQLH3H24Q4O62ZR7';
const eventbriteUrl = 'https://www.eventbriteapi.com/v3';
let map;

//get the list of events from Eventbrite API endpoint
function getEvents(interest, zipCode) {
    const endpoint =
        `${eventbriteUrl}/events/search/?q=${interest}&location.address=${zipCode}&location.within=30mi&expand=organizer,venue`;
    const options = {
        url: endpoint,
        headers: {
            'Authorization': `Bearer ${eventbriteKey}`
        }
    }
    // this gets the data from Eventbrite's endpoint
    $.get(options).done(response => {
        const events = response.events;
        const newLat = response.location.latitude;
        const newLng = response.location.longitude;
        centerMap(+newLat, +newLng);
        const infowindow = new google.maps.InfoWindow({ maxWidth: 130 });
        //there are no returned results, this page will show
        if (events.length === 0) {
            $('#events').show();
            $('.no-event').show();
            //if there are results, google markers will show where the event will take place
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

//this creates the event information in the events container
function createEventTemplate(event) {
    const startTime = event.start.local;
    const endTime = event.end.local;
    const newStartTime = moment(startTime).format('LLLL');
    const newEndTime = moment(endTime).format('LLLL');
    const eventLink = event.url;
    const logoUrl = event.logo ? event.logo.original.url : '';
    const logo = event.logo ? `<img class='event-pic' src='${logoUrl}' alt='event photo'>` : '';
    const content = `<section role='region' class='event-container'>
            <a id='home-screen' href='index.html'>Search Again</a><br>
            <p action="action" onclick="window.history.go(-1); return false;" type="button" value="Back" id='back-to-map' class='back-button'>Back to Map Results</p><br>
            <div>${logo}</div>
            <p class ='event-heading'>${event.name.text}:</p> 
            <p class='times'>${newStartTime} to ${newEndTime}</p>
            <p class='event-description'>${event.description.text}:
            <a class='event-link' href='${eventLink}?token=4CMGDQLH3H24Q4O62ZR7' target="_blank">Event Link</a></p>
            </section>`;
    return content;
}

//this creates the google maps markers using the eventbrite API data 
function createMarker(event, infowindow) {
    const { venue, url, name } = event;
    const { latitude, longitude } = venue;
    const position = { lat: +latitude, lng: +longitude }
    const template = createEventTemplate(event);
    let marker = new google.maps.Marker({
        position,
        url,
        map
    });
    const content = `<section role='region' class = 'marker-info >
        <p class='marker-title'>"${name.text}"</p>
        <a class='marker-link' href='${url}' target="_blank">Here's a link to the event!<a />
    </section>`
    if (isMobile()) {
        closeEvents();
    }
    //this is what happens when you click on a marker, and screen size matters 
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker);
        infowindow.setContent(content);
        $('#event-detail').prop('hidden', false).html(template);
        if (isMobile()) {
            openEvents();
            $('#back-to-map').click(function () {
                closeEvents();
            })
        }
    });
    google.maps.event.addListener(map, 'click', function () {
        infowindow.close();
    });
}

//this function shows the events container, and hides the back to map button
function openEvents() {
    $('#events').show();
    $('#back-to-map').removeClass('back-button');
}

//this function hides the events container 
function closeEvents() {
    $('#events').hide();
}

//this function dictates what will happen is the resolution is below 960px
function isMobile() {
    return $(window).width() < 960;
}

//this populates and centers google maps with the coordinates from eventbrite
function centerMap(newLat, newLng) {
    var settings = {
        zoom: 10,
        center: { lat: newLat, lng: newLng },
        gestureHandling: 'greedy',
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    map = new google.maps.Map(document.getElementById('map'), settings);
}

//this populates the initial google maps. This is the default center of the map
function initMap() {
    //this is the Map options
    var settings = {
        zoom: 10,
        center: { lat: 34.052235, lng: -118.243683 },
        gestureHandling: 'greedy',
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }

    $('#map').prop('hidden', false);
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

//this is how the browser will render results 
function renderResults() {
    $('header').remove();
    $('.tagline').remove();
    $('form').remove();
    $('#map').show();
    if (!isMobile) {
        $('#events').show();
    }
}

function main() {
    onSubmit();
    $('#back').click(closeEvents);
}

//what happens when you click on the search button
function onSubmit() {
    $('form').submit(event => {
        event.preventDefault();
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

// complete
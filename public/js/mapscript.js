
const socket = io();

var map = L.map('map').setView([47.567, 9.671], 3);
const out1 = document.getElementById('output');
const btn1 = document.getElementById('btn');
var username = getQueryParms('username');
var markers = []
var lines = []
var anchor;

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//On Click Marker
var marker;
var isMarker = false;
var canplace = true;

function onMapClick(e){
    if(!canplace){
        return
    }
    
    if(marker){
        marker.remove();
    }
    marker = new L.marker([e.latlng.lat,e.latlng.lng]).addTo(map);
    isMarker=true;
    
    
}



map.on('click', onMapClick);
//

btn1.addEventListener('click', postInfo);





function getQueryParms(param){
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}



function postInfo(){

    var retstring;

    if(isMarker){
        retstring = username + ": " + marker.getLatLng().lat + ", " + marker.getLatLng().lng;
        out1.innerHTML = retstring;
        btn1.disabled = true;
        canplace = false;

    }else{return}

    
   socket.emit('postU',retstring);


}

socket.on('isOpenO',(isOp)=>{
    if(canplace){
        btn1.disabled = !isOp;
    }
})

socket.on('fullResetC',()=>{
    location.reload();
})

socket.on('reveal', (marks)=>{
    if(marker){marker.remove()}
    canplace = false;
    anchor = new L.marker([marks.aanchor.lat,marks.aanchor.lng],{icon: donIcon}).addTo(map);
    for(let i = 0;i<marks.mmarkers.length;i++){
        
        var rmarker = new L.marker([marks.mmarkers[i].llat,marks.mmarkers[i].llng]).addTo(map);
        markers.push({mmarker:rmarker, nname:marks.mmarkers[i].lname});
    }

    for(let i = 0;i<markers.length;i++){
        linkMarkers(markers[i].mmarker,markers[i].nname)
    }
    

})

var donIcon = L.icon({
    iconUrl: 'map-marker.png',
    shadowUrl: '',

    iconSize:     [30, 47], 
    shadowSize:   [50, 64], 
    iconAnchor:   [15, 50], 
    shadowAnchor: [4, 62],  
    popupAnchor:  [-3, -76] 
});

function linkMarkers(marker,name){
    if(anchor){
        var dist = map.distance(anchor.getLatLng(),marker.getLatLng());
        var distStr = Math.trunc(dist)/1000 + 'km';

    marker.bindPopup(name + '\n'+distStr);

    var pl = L.polyline([anchor.getLatLng(), marker.getLatLng()]).addTo(map)
        lines.push(pl)


    }
}
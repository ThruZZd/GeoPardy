const socket = io();
var map = L.map('map').setView([47.567, 9.671], 3);
const out1 = document.getElementById('output');
const btnOpen = document.getElementById('btnFetch')
const btnReset = document.getElementById('btnReset')
const anchorTxt = document.getElementById('anchorTxt')
const acnhorBtn = document.getElementById('anchorBtn')
const revealBtn = document.getElementById('revealBtn')
const win = document.getElementById('win')
var markers = []
var lines = []
var anchor
var winner
var isOpen = true;
var revealed = false;

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);




acnhorBtn.addEventListener('click', setAnchor);
btnOpen.addEventListener('click', changeOpen);
btnReset.addEventListener('click', resetAll);
revealBtn.addEventListener('click', reveal);


function reveal(){
    if(revealed){return}
    if(!anchor || markers.length==0){return}
    if(isOpen){
        changeOpen();
    }

    var anchorRet = anchor.getLatLng();
    var markersRet = [];

    for(let i = 0;i<markers.length;i++){
        var mob = markers[i].pplObj;
        markersRet.push(mob);
    }



    var revObj = {aanchor:anchorRet,mmarkers:markersRet};

    socket.emit('revealA',revObj);

    revealed = true;

}

function resetAll(){
    revealed = false;
    if(!isOpen){
        changeOpen();
    }

    

    for(let i = 0;i<lines.length;i++){
        lines[i].remove();
    }

    lines = [];

    for(let i = 0;i<markers.length;i++){
        markers[i].mmarker.remove();
    }

    markers = [];

    if(anchor){
        anchor.remove();
    }

    anchor = null;

    win.innerHTML = "";
    winner = null;

    socket.emit('fullReset');
}

function changeOpen(){
    if(revealed){return}
    isOpen = !isOpen;
    socket.emit('isOpenI', isOpen);

    if(isOpen){
        btnOpen.value = "Close";
    }else{
        btnOpen.value = "Open";
    }
}

function setAnchor(){
    if(revealed){return}
    if(!anchorTxt.value == ''){
        if(anchor){
            anchor.remove()
        }
        var splitT = anchorTxt.value.split(',')
        anchor = new L.marker([splitT[0],splitT[1]],{icon: donIcon}).addTo(map)

        for(let i = 0;i<lines.length;i++){
            lines[i].remove();
        }

        lines = [];

        for(let i = 0;i<markers.length;i++){
            linkMarkers(markers[i].mmarker,markers[i].pplObj)
        }

    }
}


socket.on('adminMarker', (minfo)=>{

    console.log(minfo);
    var plObj = buildLoc(minfo);
    var marker = new L.marker([plObj.llat, plObj.llng]).addTo(map);

    linkMarkers(marker,plObj);
    markers.push({mmarker:marker,pplObj:plObj});
    

})


function linkMarkers(marker,plObj){
    if(anchor){
        var dist = map.distance(anchor.getLatLng(),marker.getLatLng());
        var distStr = Math.trunc(dist)/1000 + 'km';

    marker.bindPopup(plObj.lname + '\n'+distStr);

    var pl = L.polyline([anchor.getLatLng(), marker.getLatLng()]).addTo(map)
        lines.push(pl)

    if(!winner){
        winner = {name:plObj.lname, distanz:dist}
    }else if(dist < winner.distanz){
        winner = {name:plObj.lname, distanz:dist}
    }

    win.innerHTML = 'Sieg: '+winner.name

    }else{
        marker.bindPopup(plObj.lname);
    }
}







function removeAllMarkers(){
    win.innerHTML=''
    winner = null
    for(let i=0;i<markers.length;i++){
        markers[i].mmarker.remove();
    }

    for(let i=0;i<lines.length;i++){
        lines[i].remove();
    }
}



function buildLoc(retString){

var compString = retString.replaceAll(' ','')
var name = compString.split(':')[0]
var lalo = compString.split(':')[1].split(',')
var lat = lalo[0]
var lng = lalo[1]

return {lname:name,llat:lat,llng:lng}


}

var donIcon = L.icon({
    iconUrl: 'map-marker.png',
    shadowUrl: '',

    iconSize:     [30, 47], 
    shadowSize:   [50, 64], 
    iconAnchor:   [15, 50], 
    shadowAnchor: [4, 62],  
    popupAnchor:  [-3, -76] 
});
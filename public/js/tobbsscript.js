const socket = io();

const searchSelectUser = document.getElementById('user-select');
const addSelectUser = document.getElementById('new-card-user');
const searchSelectCard = document.getElementById('card-ids');
const searchSelectCardField = document.getElementById('card-id');
const addSelectCard = document.getElementById('new-card-ids');
const addSelectCardField = document.getElementById('new-card-id');
const addAmount = document.getElementById('card-amount');
const showDups = document.getElementById('show-duplicates');



socket.on('setupNames', (sinfo)=>{
    const namesArray = sinfo.map(item => item.name);
    var emptyopt = document.createElement('option');
    emptyopt.innerHTML = "Alle";
    searchSelectUser.appendChild(emptyopt);

    for(let i=0;i<namesArray.length;i++){
        var opt = document.createElement('option');
        opt.innerHTML = namesArray[i];
        var opt2 = document.createElement('option');
        opt2.innerHTML = namesArray[i];
        searchSelectUser.appendChild(opt);
        addSelectUser.appendChild(opt2);
    }

    
})

socket.on('setupCards', (cinfo)=>{
    const cardArray = cinfo.map(item=>item.heftid);

    for(let i=0;i<cardArray.length;i++){
        var opt = document.createElement('option');
        opt.value = cardArray[i];
        searchSelectCard.appendChild(opt);

    }


})

socket.on('setupAddCards', (cAddInfo)=>{
    const cardAddArrayHI = cAddInfo.map(item=>item.heftid);
    const cardAddArraySP = cAddInfo.map(item=>item.special);

    for(let i = 0;i<cardAddArrayHI.length;i++){
        var opt = document.createElement('option');
        opt.value = cardAddArrayHI[i]+","+cardAddArraySP[i];
        addSelectCard.appendChild(opt);

    }
})

function searchCards(){
    const user = searchSelectUser.value;
    const enteredValue = searchSelectCardField.value;
    const dataListOptions = Array.from(searchSelectCard.options).map(option => option.value);
    const checked = showDups.checked;
    var hid = "";
    
    if (dataListOptions.includes(enteredValue) || enteredValue === "") {
        hid=enteredValue;
    }

    socket.emit('requestSearch', {user:user,heftid:hid,onlydups:checked});


}

socket.on('searchResult', (result) => {
    const resultsBox = document.getElementById('results-box');
    resultsBox.innerHTML = ''; // Clear previous content
    
    if (result.length === 0) {
        resultsBox.innerHTML = '<p>No results found</p>';
        return;
    }

    // Create table element
    const table = document.createElement('table');
    table.classList.add('results-table');

    // Create table header
    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Name', 'Anzahl', 'Heftid', 'Name_on', 'Special'].forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    // Create table body
    const tableBody = document.createElement('tbody');
    result.forEach(item => {
        const row = document.createElement('tr');
        Object.values(item).forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        });
        tableBody.appendChild(row);
    });
    table.appendChild(tableBody);

    // Append table to results-box
    resultsBox.appendChild(table);
});


//Search Logic


function addNewCard(){
    const user = addSelectUser.value;
    const enteredValue = addSelectCardField.value;
    const dataListOptions = Array.from(addSelectCard.options).map(option => option.value);
    const anz = addAmount.value;
    var hid = "";
    
    if (dataListOptions.includes(enteredValue)) {
        hid=enteredValue;
    }

    if(hid===""){
        window.alert("Bitte Karte auswählen!");
        return;
    }
    
    const cInf = hid.split(',');

    
    socket.emit('requestAdd', {user:user,heftid:cInf[0],special: cInf[1],anzahl:anz});
}





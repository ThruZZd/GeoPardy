

const textfeld = document.getElementById('userrd');
const btnrd = document.getElementById('btnrd');

btnrd.addEventListener('click', btCl);

function btCl(){

    if(textfeld.value != ''){
        var username = textfeld.value;
        window.location.href = 'map.html?username='+encodeURIComponent(username);
        
    }


}
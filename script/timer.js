var countDownDate = new Date("Oct 28, 2022 18:00:00").getTime();

function updateCountDown() {
    var currentDate = new Date().getTime();

    var distance = countDownDate - currentDate;
    if (distance <= 0){
        distance = 0;
    }

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById("timer").innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

    if (distance <= 0) {
        clearInterval(x);
        // document.getElementById("timer").innerHTML = "EXPIRED";
    }
}

updateCountDown()
var x = setInterval(updateCountDown, 1000);
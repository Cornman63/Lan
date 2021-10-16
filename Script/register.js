api_url = "https://lan.gettime.ga/"

function send_API_request(url){
    var send_API_request_response;

    function reqListener () {
        send_API_request_response = JSON.parse(this.responseText);
    }

    let r = new XMLHttpRequest();
    r.addEventListener("load", reqListener);
    r.open("GET", url, false);
    r.send();

    return send_API_request_response;
}

function sendBookingRequest(){
    document.forms['booking-form']['name']

    let name_ =  document.forms['booking-form']['name']
    let tel_ =  document.forms['booking-form']['telefon-nummer']
    let bordnummer_ =  document.forms['booking-form']['bordnummer']
    let error_text = document.getElementById('error-text')

    let field_items = [
        name_,
        tel_,
        bordnummer_
    ]

    field_items.forEach(e => {
        e.style.backgroundColor = (e.value == "") ? "red" : ""
    });

    if (
        name_.value == "" ||
        tel_.value == "" ||
        bordnummer_.value == ""
        ){
            error_text.innerHTML = "Fyll i alla fält innan du skickar in"
            error_text.style.color = "red"
            return
    }

    error_text.innerHTML = "Din ansökan är skickad"
    error_text.style.color = "green"

    let url = new URL(api_url + 'book');
    url.search = new URLSearchParams({
        name: name_.value,
        seatNumber: bordnummer_.value,
        phoneNumber: tel_.value
    });
    let response = send_API_request(url.toString())

    // let response = send_API_request(`http://127.0.0.1:5000/book?name=${encodeURIComponent()}&seatNumber=${encodeURIComponent(bordnummer_.value)}`)

    if (response[0] != 0){
        error_text.innerHTML = response[1]
        error_text.style.color = "red"
    }
    else{
        refreshBookingTable()
    }
    
};

function updateBooking(){
    booking = send_API_request(api_url + "readBooked")
}

function createTable(){
    let dest = document.getElementsByClassName('booking-map')[0]

    try {
        document.querySelector("div.tables").remove()
    } catch (error){}

    let main_div = document.createElement("div")
    main_div.classList.add("tables")

    let index = 0;

    for (let i = 0; i < 4; i++) {
        let section_div = document.createElement("div")
        section_div.classList.add("section")

        for (let i2 = 0; i2 < 2; i2++) {
            let row_ul = document.createElement("ul")
            row_ul.classList.add("row")

            for (let i3 = 0; i3 < 8; i3++) {
                index += 1

                let li = document.createElement("li")
                li.title = booking[index]

                let a = document.createElement("a")
                if (booking[index] != ""){
                    a.classList.add("taken")
                }
                a.innerHTML = index
                a.onclick = function() {
                    document.querySelector(`#bordnummer > option[value="${this.innerHTML}"]`).selected = true;
                    // document.querySelector("div.container").scrollIntoView();
                }
                
                li.appendChild(a)
                row_ul.appendChild(li)
            }

            section_div.appendChild(row_ul)   
        }

        main_div.appendChild(section_div)
    }

    dest.appendChild(main_div)
}

function updateSeatDropdown(){
    let dropdown_numbers = document.getElementById('bordnummer')

    document.querySelectorAll('div.booking-map > div.tables a:not(.taken)').forEach(e => {
        let option = document.createElement("option")
        
        option.value = e.innerHTML.trim()
        option.innerText = e.innerHTML.trim()

        dropdown_numbers.appendChild(option)
    });
}

function refreshBookingTable(){
    updateBooking()
    createTable()
    updateSeatDropdown()
    update_spaces_left_span()
}

function update_spaces_left_span(){
    let total_spaces = Object.keys(booking).length
    let spaces_booked = 0

    Object.keys(booking).forEach(i => {
        if (booking[i] != ""){
            spaces_booked += 1
        }
    })
    try {
        document.getElementById("spaces-left-span").innerText = `${spaces_booked}/${total_spaces}` 
    } catch (error) {}
    
}

var booking = {}

refreshBookingTable()



document.querySelector("div.booking-form > button.book-button").onclick = sendBookingRequest;
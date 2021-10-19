var loaded_pages_cache = {};
var load_document_default_file_name = "home.html";
var load_document_default_dest = document.getElementsByClassName('body-container')[0];
var uri_parameters = new URLSearchParams(window.location.search);

// If `fn` is null, then it will try to load a default template ("default.html")
// If `ignore_same_page` is true, then it will load the page, even if the last reported loaded page is the same as the current request.
async function load_document(fn, dest, ignore_same_page=false){
    let replacement_html = null;
    let load_to_top = false;

    if (fn != null && fn.slice(-1) == "#"){
        fn = fn.slice(0, -1);
        load_to_top = true;
    }
    if (fn == load_document_default_file_name || fn == "null"){fn = null;}
    if (dest == undefined || dest == null){dest = load_document_default_dest;}

    // Step 1: Check if it should load in the first place.
    let container_loaded = dest.getElementsByClassName(`page-${fn}`)[0]
    if (container_loaded && container_loaded.style.display != "none"){
        if (!ignore_same_page){
            console.log("Same page, ignoring request");
            return;
        }
        console.log("Was same page, but ignore_same_page is true")
    }

    // Step 2: Make a new request
    if (replacement_html == null){

        let response = await fetch((fn == null) ? load_document_default_file_name : fn)

        if (response.status === 200){
            let data = await response.text()
            replacement_html = data;
        }
        
    }

    // Final step: Switch out data
    if (replacement_html != null){
        // Hide all pages
        document.querySelectorAll(".page").forEach(e => {
            e.style.display = "none"
        })

        // Display the selected page or create it
        if (container_loaded){
            container_loaded.style.display = ""
        }
        else{
            let dest2 = document.createElement("div")
            dest2.classList.add("page", "page-" + fn)
    
            dest2.innerHTML = replacement_html
            dest.appendChild(dest2)

            // Run scripts
            Array.from(dest.querySelectorAll(".run-after-load:not(.done)")).forEach(i => {
                if (i.getAttribute("src")){
                    let loaded_script = document.head.querySelector(`script[src="${i.getAttribute("src")}"]`);
                    if (loaded_script){
                        if (i.innerHTML){
                            eval(i.innerHTML);
                        }
                    }
                    else{
                        var script = document.createElement('script');
                        script.src = i.getAttribute("src");
                        document.head.appendChild(script)

                        if (i.innerHTML){
                            script.onload = function(){
                                eval(i.innerHTML);
                            }
                        }
                    }
                }
                else{
                    if (i.innerHTML){
                        eval(i.innerHTML);
                    }
                }

                i.classList.add("done")
            });
        }

        // Update URL
        history.pushState({},null,
            (fn == null) ? window.location.pathname : `?d=${fn}`
        );
        
        // Update navbars
        document.querySelectorAll(".nav-item[fn]").forEach(e => {
            e.classList.remove("nav-item-highlighted")
        })
        document.querySelector(`.nav-item[fn="${fn}"]`).classList.add("nav-item-highlighted")

        document.querySelectorAll(".menu-item[fn]").forEach(e => {
            e.classList.remove("menu-item-highlighted")
        })
        document.querySelector(`.menu-item[fn="${fn}"]`).classList.add("menu-item-highlighted")

        return 0;
    }

    return -1;
};


load_document(uri_parameters.get("d"), null, true)

window.addEventListener('popstate', function(event) {
    load_document(new URLSearchParams(window.location.search).get("d"))
}, false);

document.querySelectorAll('div.nav-item').forEach(e => {
    if (e.getAttribute("fn")){
        e.onclick = function(){
            load_document(e.getAttribute("fn"), document.getElementsByClassName("body-container")[0], true) 
        }
    }
})

document.querySelectorAll('div.menu-item').forEach(e => {
    if (e.getAttribute("fn")){
        e.onclick = function(){
            load_document(e.getAttribute("fn"), document.getElementsByClassName("body-container")[0], true);
            document.querySelector('.current-nav-item').innerHTML = e.innerHTML;
            togglePhoneMenu()
        }
    }
})
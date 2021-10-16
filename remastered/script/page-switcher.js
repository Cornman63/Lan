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
    if (dest.getAttribute("loaded") == `${fn}`){

        if (!ignore_same_page){
            console.log("Same page, ignoring request");
            return;
        }
        console.log("Was same page, but ignore_same_page is true")
    }

    // Step 2: Check cache.
    if (`${fn}` in loaded_pages_cache){
        
        console.log("Using cache!");
        replacement_html = loaded_pages_cache[`${fn}`];
    }
    
    // Step 3: Make a new request
    if (replacement_html == null){

        let response = await fetch((fn == null) ? load_document_default_file_name : fn)

        if (response.status === 200){
            let data = await response.text()
            replacement_html = data;
        }
        
    }

    // Final step: Switch out data
    if (replacement_html != null){
        // Replace content
        dest.innerHTML = replacement_html;

        // Fix classes and "loaded" property
        if (dest.getAttribute("loaded") != null){
            dest.classList.remove(`document-${dest.getAttribute("loaded")}`)
        }
        dest.classList.add(`document-${fn}`)
        dest.setAttribute("loaded", `${fn}`);

        // Save to cache
        loaded_pages_cache[`${fn}`] = replacement_html;

        // Update URL
        history.pushState({},null,
            (fn == null) ? window.location.pathname : `?d=${fn}`
        );
        
        document.querySelectorAll(".nav-item[fn]").forEach(e => {
            e.classList.remove("nav-item-highlighted")
        })
        document.querySelector(`.nav-item[fn="${fn}"]`).classList.add("nav-item-highlighted")

        document.querySelectorAll(".menu-item[fn]").forEach(e => {
            e.classList.remove("menu-item-highlighted")
        })
        document.querySelector(`.menu-item[fn="${fn}"]`).classList.add("menu-item-highlighted")

        Array.from(dest.getElementsByClassName("run-after-load")).forEach(i => {
            eval(i.innerHTML);
        });

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
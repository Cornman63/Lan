function generate_images(dest, images){
    dest = document.querySelector(dest);
    images.forEach(e => {
        let image_object = document.createElement("img");

        image_object.src = e;
        image_object.alt = e;
        image_object.classList.add("lan-pictures")

        dest.appendChild(image_object)
    });
}
// document.addEventListener("DOMContentLoaded", function () {
//     const preloader = document.querySelector(".preloader");
//     const preloaderImage = document.querySelector(".preloader-image");
//     const content = document.querySelector("body");

//     // Set the image source to your desired image
//     preloaderImage.src = "images 5.jpg";

//     // Show preloader
//     preloader.style.opacity = "1";
//     preloader.style.visibility = "visible";

//     // Zoom in the image when the page loads
//     preloaderImage.style.transform = "scale(3)";

//     // Hide the preloader and reveal content after it completes
//     setTimeout(function () {
//         preloader.style.opacity = "0";
//         preloader.style.visibility = "hidden";

//         // Make body content visible
//         content.style.visibility = "visible";
//     }, 1000); // Adjust the time duration of the preloader as needed
// });

let searchForm = document.querySelector('.search-from');

document.querySelector('#search-btn').onclick = () => {
    searchForm.classList.toggle('active');
    login.classList.remove('active');
    nav.classList.remove('active');
}

let login = document.querySelector('.login-form');

document.querySelector('#login-btn').onclick = () => {
    login.classList.toggle('active');
    searchForm.classList.remove('active');
    nav.classList.remove('active');
}
let nav= document.querySelector('.navbar');

document.querySelector('#menu-btn').onclick = () => {

    nav.classList.toggle('active');
    login.classList.remove('active');
    searchForm.classList.remove('active');
}


window.onscroll = () => {
    login.classList.remove('active');
    searchForm.classList.remove('active');
    nav.classList.remove('active');
}


var swiper = new Swiper(".product-silder", {
    loop:true,
    spaceBetween: 20,
    autoplay: {
        delay:3500,
        disableOnInteraction: false,
    },
    centeredS1ides :true,

    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1020: {
        slidesPerView: 3,
      },
    },
  });




  
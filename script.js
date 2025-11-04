const links = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
    const fromTop = window.scrollY;

    links.forEach(link => {
        const section = document.querySelector(link.hash);
        if (
            section.offsetTop <= fromTop + 100 &&
            section.offsetTop + section.offsetHeight > fromTop + 100
        ) {
            link.style.color = "#FF4081";
        } else {
            link.style.color = "#E6E6E6";
        }
    });
});

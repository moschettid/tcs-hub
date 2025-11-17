// Determine base path based on current location
function getBasePath() {
  const path = window.location.pathname;
  return path.includes("/pages/") ? "../" : "./";
}

// Set current year in footer
document.addEventListener("DOMContentLoaded", () => {
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});

// Set active navigation link
function setActiveNav() {
  const currentPage = window.location.pathname;

  if (currentPage.includes("materials")) {
    document.getElementById("nav-materials")?.classList.add("active");
  } else if (currentPage.includes("events")) {
    document.getElementById("nav-events")?.classList.add("active");
  } else if (currentPage.includes("schools")) {
    document.getElementById("nav-schools")?.classList.add("active");
  } else if (currentPage.includes("conferences")) {
    document.getElementById("nav-conferences")?.classList.add("active");
  } else if (currentPage === "/" || currentPage.includes("index.html")) {
    document.getElementById("nav-home")?.classList.add("active");
  }
}

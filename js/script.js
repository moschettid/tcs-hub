// Load component from external file
async function loadComponent(elementId, filePath) {
  try {
    const element = document.getElementById(elementId);
    if (!element) return;

    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const html = await response.text();
    element.innerHTML = html;
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
  }
}

// Determine base path based on current location
function getBasePath() {
  // All files are now in root, so always use './'
  return "./";
}

// Set active navigation link
function setActiveNav() {
  const currentPage = window.location.pathname;

  if (currentPage.includes("materials")) {
    document.getElementById("nav-materials")?.classList.add("active");
  } else if (currentPage.includes("schools")) {
    document.getElementById("nav-schools")?.classList.add("active");
  } else if (currentPage.includes("conferences")) {
    document.getElementById("nav-conferences")?.classList.add("active");
  } else if (
    currentPage === "/" ||
    currentPage === "/index.html" ||
    currentPage.endsWith("/")
  ) {
    document.getElementById("nav-home")?.classList.add("active");
  }
}

// Set current year in footer
function setCurrentYear() {
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// Initialize page components
document.addEventListener("DOMContentLoaded", async () => {
  const basePath = getBasePath();

  // Load header and footer
  await loadComponent("header", `${basePath}includes/header.html`);
  await loadComponent("footer-content", `${basePath}includes/footer.html`);

  // Set year and active nav after components load
  setTimeout(() => {
    setCurrentYear();
    setActiveNav();
  }, 50);
});

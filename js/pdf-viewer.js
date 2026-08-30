/* ============================================================
   WELCOME BOOK - carosello di pagine responsive
   Le pagine sono immagini generate dal PDF: nessun iframe,
   worker o visualizzatore PDF del browser.
   ============================================================ */

document.querySelectorAll(".pdf-viewer").forEach(initPageCarousel);

function initPageCarousel(viewer) {
  const stage = viewer.querySelector("[data-pdf-stage]");
  const pageImage = viewer.querySelector("[data-pdf-page]");
  const message = viewer.querySelector("[data-pdf-message]");
  const previousButton = viewer.querySelector("[data-pdf-prev]");
  const nextButton = viewer.querySelector("[data-pdf-next]");
  const currentElement = viewer.querySelector("[data-pdf-current]");
  const totalElement = viewer.querySelector("[data-pdf-total]");

  const pageBase = viewer.dataset.pageBase;
  const totalPages = Number.parseInt(viewer.dataset.totalPages, 10);

  if (!pageBase || !Number.isInteger(totalPages) || totalPages < 1) {
    showError("Configurazione del visualizzatore non valida.");
    return;
  }

  let currentPage = 1;
  let loadRequest = 0;

  function pageUrl(pageNumber) {
    return pageBase + String(pageNumber).padStart(2, "0") + ".jpg";
  }

  function updateControls() {
    currentElement.textContent = currentPage;
    totalElement.textContent = totalPages;
    previousButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;

    pageImage.alt =
      "Pagina " +
      currentPage +
      " di " +
      totalPages +
      " del Welcome Book di Casa Timone";
  }

  function showError(text) {
    stage.classList.remove("is-loading");
    stage.setAttribute("aria-busy", "false");
    message.hidden = false;
    message.textContent = text;
  }

  function preloadAdjacentPages() {
    [currentPage - 1, currentPage + 1].forEach(function (pageNumber) {
      if (pageNumber < 1 || pageNumber > totalPages) return;
      const preloadImage = new Image();
      preloadImage.src = pageUrl(pageNumber);
    });
  }

  function goToPage(newPage) {
    const validPage = Math.min(Math.max(newPage, 1), totalPages);

    if (validPage === currentPage) return;

    currentPage = validPage;
    updateControls();

    const requestNumber = ++loadRequest;
    const nextImage = new Image();

    stage.classList.add("is-loading");
    stage.setAttribute("aria-busy", "true");
    message.hidden = true;

    nextImage.onload = function () {
      if (requestNumber !== loadRequest) return;

      pageImage.src = nextImage.src;
      stage.classList.remove("is-loading");
      stage.setAttribute("aria-busy", "false");
      preloadAdjacentPages();
    };

    nextImage.onerror = function () {
      if (requestNumber !== loadRequest) return;
      showError("Impossibile caricare la pagina " + currentPage + ".");
    };

    nextImage.src = pageUrl(currentPage);
  }

  previousButton.addEventListener("click", function () {
    goToPage(currentPage - 1);
  });

  nextButton.addEventListener("click", function () {
    goToPage(currentPage + 1);
  });

  stage.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPage(currentPage - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToPage(currentPage + 1);
    }
  });

  let startX = null;
  let startY = null;
  let activePointer = null;

  stage.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    activePointer = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    stage.classList.add("is-dragging");

    if (stage.setPointerCapture) {
      stage.setPointerCapture(event.pointerId);
    }
  });

  stage.addEventListener("pointermove", function (event) {
    if (startX === null || event.pointerId !== activePointer) return;

    const differenceX = event.clientX - startX;
    const differenceY = event.clientY - startY;

    if (Math.abs(differenceX) > Math.abs(differenceY)) {
      const limitedMovement = Math.max(-90, Math.min(90, differenceX));
      pageImage.style.transform = "translateX(" + limitedMovement + "px)";
      pageImage.style.opacity = String(
        Math.max(0.58, 1 - Math.abs(limitedMovement) / 220)
      );
    }
  });

  stage.addEventListener("pointerup", function (event) {
    if (startX === null || event.pointerId !== activePointer) return;

    const differenceX = event.clientX - startX;
    const differenceY = event.clientY - startY;

    resetSwipeAppearance();

    const isHorizontalSwipe =
      Math.abs(differenceX) >= 55 &&
      Math.abs(differenceX) > Math.abs(differenceY) * 1.2;

    if (!isHorizontalSwipe) return;

    if (differenceX < 0) {
      goToPage(currentPage + 1);
    } else {
      goToPage(currentPage - 1);
    }
  });

  stage.addEventListener("pointercancel", resetSwipeAppearance);

  function resetSwipeAppearance() {
    startX = null;
    startY = null;
    activePointer = null;
    stage.classList.remove("is-dragging");
    pageImage.style.transform = "";
    pageImage.style.opacity = "";
  }

  updateControls();
  stage.setAttribute("aria-busy", "false");
  preloadAdjacentPages();
}

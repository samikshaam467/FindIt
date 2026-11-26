/**
 * FindIt – Campus Lost & Found Portal
 * Pure Vanilla JavaScript with LocalStorage persistence.
 */

const STORAGE_KEY = "findit_campus_items_v1";

// Sample campus items shown on first visit
const SAMPLE_ITEMS = [
  {
    id: "sample-1",
    name: "Silver MacBook USB-C Charger",
    category: "Electronics",
    description:
      "67W white/silver USB-C power adapter with a braided cable and a small purple tape wrap near the plug.",
    location: "Main Library, 2nd Floor Study Tables",
    date: "2026-11-24",
    contact: "maya.patel@campus.edu",
    status: "found"
  },
  {
    id: "sample-2",
    name: "Student ID Card (Jordan Lee)",
    category: "ID & Cards",
    description:
      "Campus student ID inside a clear plastic lanyard sleeve with a blue shuttle pass behind it.",
    location: "Student Union Cafeteria",
    date: "2026-11-25",
    contact: "union-desk@campus.edu",
    status: "found"
  },
  {
    id: "sample-3",
    name: "Navy Blue Hydro Flask 32oz",
    category: "Bags & Accessories",
    description:
      "Matte navy stainless steel water bottle covered in computer science club and mountain stickers.",
    location: "Engineering Building, Room 105",
    date: "2026-11-23",
    contact: "liam.gomez@campus.edu",
    status: "lost"
  },
  {
    id: "sample-4",
    name: "Calculus Early Transcendentals Textbook",
    category: "Books & Notes",
    description:
      "Hardcover 9th edition with yellow sticky tabs on chapters 4 and 5 and my name written inside the cover.",
    location: "Science Hall Lobby Benches",
    date: "2026-11-22",
    contact: "(555) 390-4412",
    status: "lost"
  },
  {
    id: "sample-5",
    name: "Black Keychain with Brass Dorm Key",
    category: "Keys & Wallets",
    description:
      "Two silver keys and one brass key on a black carabiner with a small purple campus tag.",
    location: "North Quad Bike Racks",
    date: "2026-11-21",
    contact: "campus-safety@campus.edu",
    status: "found"
  },
  {
    id: "sample-6",
    name: "Wireless Noise-Canceling Headphones",
    category: "Electronics",
    description:
      "Matte black over-ear headphones inside a dark gray hard zip case. Returned after verification.",
    location: "Recreation Center Locker Room",
    date: "2026-11-19",
    contact: "noah.kim@campus.edu",
    status: "resolved"
  },
  {
    id: "sample-7",
    name: "Graphing Calculator TI-84 Plus",
    category: "Electronics",
    description:
      "Black graphing calculator with protective slide cover. Has initials 'S.R.' scratched faintly on the back.",
    location: "Math Building, Lecture Hall B",
    date: "2026-11-25",
    contact: "sofia.rodriguez@campus.edu",
    status: "lost"
  }
];

// Application state
let items = [];
let activeModalItemId = null;
let pendingAction = null; // "resolve" or "delete"

// DOM Elements
const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");
const navLinks = document.querySelectorAll(".nav-link");

const heroSearchForm = document.getElementById("hero-search-form");
const heroSearchInput = document.getElementById("hero-search-input");
const btnReportLost = document.getElementById("btn-report-lost");
const btnReportFound = document.getElementById("btn-report-found");

const statLostEl = document.getElementById("stat-lost");
const statFoundEl = document.getElementById("stat-found");
const statResolvedEl = document.getElementById("stat-resolved");
const statCards = document.querySelectorAll(".stat-card");

const browseSearchInput = document.getElementById("browse-search");
const filterStatusSelect = document.getElementById("filter-status");
const filterCategorySelect = document.getElementById("filter-category");
const clearFiltersBtn = document.getElementById("clear-filters-btn");
const emptyResetBtn = document.getElementById("empty-reset-btn");
const resultsCountEl = document.getElementById("results-count");
const itemsGrid = document.getElementById("items-grid");
const emptyState = document.getElementById("empty-state");

const reportForm = document.getElementById("report-form");
const formSuccessEl = document.getElementById("form-success");
const formSuccessTextEl = document.getElementById("form-success-text");
const viewReportedBtn = document.getElementById("view-reported-btn");
const formResetBtn = document.getElementById("form-reset-btn");
const itemDateInput = document.getElementById("item-date");

const itemModal = document.getElementById("item-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalStatusBadge = document.getElementById("modal-status-badge");
const modalCategoryBadge = document.getElementById("modal-category-badge");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalLocation = document.getElementById("modal-location");
const modalDate = document.getElementById("modal-date");
const modalContact = document.getElementById("modal-contact");
const modalResolveBtn = document.getElementById("modal-resolve-btn");
const modalDeleteBtn = document.getElementById("modal-delete-btn");
const modalConfirmBox = document.getElementById("modal-confirm-box");
const confirmMessageEl = document.getElementById("confirm-message");
const confirmYesBtn = document.getElementById("confirm-yes-btn");
const confirmNoBtn = document.getElementById("confirm-no-btn");

const toastEl = document.getElementById("toast");

/* ==========================================================================
   LocalStorage Helpers
   ========================================================================== */

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      items = [...SAMPLE_ITEMS];
      saveItems();
    } else {
      const parsed = JSON.parse(saved);
      items = Array.isArray(parsed) ? parsed : [...SAMPLE_ITEMS];
    }
  } catch (error) {
    console.error("Failed to load items from LocalStorage:", error);
    items = [...SAMPLE_ITEMS];
  }
}

function saveItems() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save items to LocalStorage:", error);
    showToast("Could not save changes to browser storage.");
  }
}

/* ==========================================================================
   Utility Helpers
   ========================================================================== */

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "Unknown date";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(dateObj.getTime())) return dateStr;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatStatusLabel(status) {
  if (status === "lost") return "Lost";
  if (status === "found") return "Found";
  if (status === "resolved") return "Resolved";
  return "Item";
}

function getBadgeClass(status) {
  if (status === "lost") return "badge badge-lost";
  if (status === "found") return "badge badge-found";
  return "badge badge-resolved";
}

let toastTimer = null;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.add("hidden");
  }, 3200);
}

/* ==========================================================================
   Rendering: Statistics & Item Cards
   ========================================================================== */

function updateStats() {
  const lostCount = items.filter((item) => item.status === "lost").length;
  const foundCount = items.filter((item) => item.status === "found").length;
  const resolvedCount = items.filter((item) => item.status === "resolved").length;

  statLostEl.textContent = String(lostCount);
  statFoundEl.textContent = String(foundCount);
  statResolvedEl.textContent = String(resolvedCount);
}

function getFilteredItems() {
  const searchTerm = browseSearchInput.value.trim().toLowerCase();
  const statusFilter = filterStatusSelect.value;
  const categoryFilter = filterCategorySelect.value;

  return items.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });
}

function createItemCard(item) {
  const card = document.createElement("article");
  card.className = "item-card";

  // Top badges row
  const cardTop = document.createElement("div");
  cardTop.className = "card-top";

  const statusBadge = document.createElement("span");
  statusBadge.className = getBadgeClass(item.status);
  statusBadge.textContent = formatStatusLabel(item.status);

  const categoryChip = document.createElement("span");
  categoryChip.className = "category-chip";
  categoryChip.textContent = item.category;

  cardTop.append(statusBadge, categoryChip);

  // Title & description (using textContent safely prevents HTML injection)
  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = item.name;

  const description = document.createElement("p");
  description.className = "card-description";
  description.textContent = item.description;

  // Location & date metadata
  const meta = document.createElement("div");
  meta.className = "card-meta";

  const locationRow = document.createElement("span");
  const locationLabel = document.createElement("strong");
  locationLabel.textContent = "Location: ";
  locationRow.append(locationLabel, document.createTextNode(item.location));

  const dateRow = document.createElement("span");
  const dateLabel = document.createElement("strong");
  dateLabel.textContent = "Date: ";
  dateRow.append(dateLabel, document.createTextNode(formatDisplayDate(item.date)));

  meta.append(locationRow, dateRow);

  // Action button
  const footer = document.createElement("div");
  footer.className = "card-footer";

  const detailsBtn = document.createElement("button");
  detailsBtn.type = "button";
  detailsBtn.className = "btn btn-secondary btn-small";
  detailsBtn.textContent = "View Details";
  detailsBtn.addEventListener("click", () => openItemModal(item.id));

  footer.appendChild(detailsBtn);
  card.append(cardTop, title, description, meta, footer);
  return card;
}

function renderItems() {
  const filtered = getFilteredItems();
  itemsGrid.innerHTML = "";

  const itemWord = filtered.length === 1 ? "item" : "items";
  resultsCountEl.textContent = `Showing ${filtered.length} ${itemWord}`;

  if (filtered.length === 0) {
    itemsGrid.classList.add("hidden");
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  itemsGrid.classList.remove("hidden");

  const fragment = document.createDocumentFragment();
  filtered.forEach((item) => {
    fragment.appendChild(createItemCard(item));
  });
  itemsGrid.appendChild(fragment);
}

function refreshUI() {
  updateStats();
  renderItems();
}

/* ==========================================================================
   Navigation & Quick Actions
   ========================================================================== */

function closeMobileNav() {
  mainNav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}

navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
    closeMobileNav();
  });
});

function jumpToReportForm(preselectedStatus) {
  const radio = reportForm.querySelector(`input[name="status"][value="${preselectedStatus}"]`);
  if (radio) {
    radio.checked = true;
  }
  document.getElementById("report").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => {
    document.getElementById("item-name").focus();
  }, 350);
}

btnReportLost.addEventListener("click", () => jumpToReportForm("lost"));
btnReportFound.addEventListener("click", () => jumpToReportForm("found"));

heroSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  browseSearchInput.value = heroSearchInput.value;
  filterStatusSelect.value = "all";
  filterCategorySelect.value = "all";
  renderItems();
  document.getElementById("browse").scrollIntoView({ behavior: "smooth" });
});

statCards.forEach((card) => {
  card.addEventListener("click", () => {
    const statusToFilter = card.getAttribute("data-stat-filter");
    filterStatusSelect.value = statusToFilter;
    filterCategorySelect.value = "all";
    browseSearchInput.value = "";
    renderItems();
    document.getElementById("browse").scrollIntoView({ behavior: "smooth" });
  });
});

/* ==========================================================================
   Search & Filters
   ========================================================================== */

function resetAllFilters() {
  browseSearchInput.value = "";
  heroSearchInput.value = "";
  filterStatusSelect.value = "all";
  filterCategorySelect.value = "all";
  renderItems();
}

browseSearchInput.addEventListener("input", renderItems);
filterStatusSelect.addEventListener("change", renderItems);
filterCategorySelect.addEventListener("change", renderItems);
clearFiltersBtn.addEventListener("click", resetAllFilters);
emptyResetBtn.addEventListener("click", resetAllFilters);

/* ==========================================================================
   Report Form Validation & Submission
   ========================================================================== */

function setFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(errorId);
  if (field) {
    field.classList.toggle("input-error", Boolean(message));
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function clearFormErrors() {
  setFieldError("item-name", "error-name", "");
  setFieldError("item-category", "error-category", "");
  setFieldError("item-location", "error-location", "");
  setFieldError("item-date", "error-date", "");
  setFieldError("item-description", "error-description", "");
  setFieldError("item-contact", "error-contact", "");
  document.getElementById("error-status").textContent = "";
}

function validateReportForm() {
  clearFormErrors();
  let isValid = true;

  const statusInput = reportForm.querySelector('input[name="status"]:checked');
  const name = document.getElementById("item-name").value.trim();
  const category = document.getElementById("item-category").value;
  const location = document.getElementById("item-location").value.trim();
  const date = itemDateInput.value;
  const description = document.getElementById("item-description").value.trim();
  const contact = document.getElementById("item-contact").value.trim();

  if (!statusInput) {
    document.getElementById("error-status").textContent = "Please choose Lost or Found.";
    isValid = false;
  }

  if (name.length < 2) {
    setFieldError("item-name", "error-name", "Please enter an item name (at least 2 characters).");
    isValid = false;
  }

  if (!category) {
    setFieldError("item-category", "error-category", "Please select a category.");
    isValid = false;
  }

  if (location.length < 2) {
    setFieldError("item-location", "error-location", "Please enter the campus location.");
    isValid = false;
  }

  if (!date) {
    setFieldError("item-date", "error-date", "Please select a date.");
    isValid = false;
  } else if (date > getTodayString()) {
    setFieldError("item-date", "error-date", "Date cannot be in the future.");
    isValid = false;
  }

  if (description.length < 10) {
    setFieldError(
      "item-description",
      "error-description",
      "Please enter a brief description (at least 10 characters)."
    );
    isValid = false;
  }

  // Accept email, phone number (7+ digits), or campus handle (3+ chars)
  const hasEmailOrPhone = /@/.test(contact) || /\d{7,}/.test(contact.replace(/\D/g, ""));
  if (contact.length < 5 || !hasEmailOrPhone) {
    setFieldError(
      "item-contact",
      "error-contact",
      "Please enter a valid email address or phone number."
    );
    isValid = false;
  }

  if (!isValid) return null;

  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    category,
    location,
    date,
    description,
    contact,
    status: statusInput.value
  };
}

reportForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formSuccessEl.classList.add("hidden");

  const newItem = validateReportForm();
  if (!newItem) return;

  items.unshift(newItem);
  saveItems();
  refreshUI();

  reportForm.reset();
  itemDateInput.value = getTodayString();
  formSuccessTextEl.textContent = `"${newItem.name}" has been posted as a ${newItem.status} item.`;
  formSuccessEl.classList.remove("hidden");
  showToast("Item report saved!");
});

formResetBtn.addEventListener("click", () => {
  clearFormErrors();
  formSuccessEl.classList.add("hidden");
  setTimeout(() => {
    itemDateInput.value = getTodayString();
  }, 0);
});

viewReportedBtn.addEventListener("click", () => {
  resetAllFilters();
  document.getElementById("browse").scrollIntoView({ behavior: "smooth" });
});

/* ==========================================================================
   Item Details Modal & Resolve / Delete Confirmations
   ========================================================================== */

function resetConfirmBox() {
  pendingAction = null;
  modalConfirmBox.classList.add("hidden");
  confirmMessageEl.textContent = "";
}

function openItemModal(itemId) {
  const item = items.find((entry) => entry.id === itemId);
  if (!item) return;

  activeModalItemId = itemId;
  resetConfirmBox();

  modalStatusBadge.className = getBadgeClass(item.status);
  modalStatusBadge.textContent = formatStatusLabel(item.status);
  modalCategoryBadge.textContent = item.category;

  modalTitle.textContent = item.name;
  modalDescription.textContent = item.description;
  modalLocation.textContent = item.location;
  modalDate.textContent = formatDisplayDate(item.date);
  modalContact.textContent = item.contact;

  // Hide "Mark as Resolved" if already resolved
  modalResolveBtn.classList.toggle("hidden", item.status === "resolved");

  itemModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  modalCloseBtn.focus();
}

function closeItemModal() {
  activeModalItemId = null;
  resetConfirmBox();
  itemModal.classList.add("hidden");
  document.body.style.overflow = "";
}

modalCloseBtn.addEventListener("click", closeItemModal);

itemModal.addEventListener("click", (event) => {
  if (event.target === itemModal) {
    closeItemModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !itemModal.classList.contains("hidden")) {
    closeItemModal();
  }
});

modalResolveBtn.addEventListener("click", () => {
  pendingAction = "resolve";
  confirmMessageEl.textContent =
    "Are you sure you want to mark this item as resolved? This updates its status to returned/claimed.";
  modalConfirmBox.classList.remove("hidden");
});

modalDeleteBtn.addEventListener("click", () => {
  pendingAction = "delete";
  confirmMessageEl.textContent =
    "Are you sure you want to permanently delete this report? This action cannot be undone.";
  modalConfirmBox.classList.remove("hidden");
});

confirmNoBtn.addEventListener("click", resetConfirmBox);

confirmYesBtn.addEventListener("click", () => {
  if (!activeModalItemId || !pendingAction) return;

  if (pendingAction === "resolve") {
    const target = items.find((item) => item.id === activeModalItemId);
    if (target) {
      target.status = "resolved";
      saveItems();
      refreshUI();
      openItemModal(target.id);
      showToast(`"${target.name}" marked as resolved.`);
    }
  } else if (pendingAction === "delete") {
    const target = items.find((item) => item.id === activeModalItemId);
    items = items.filter((item) => item.id !== activeModalItemId);
    saveItems();
    refreshUI();
    closeItemModal();
    if (target) {
      showToast(`Deleted "${target.name}".`);
    }
  }
});

/* ==========================================================================
   Initial Boot
   ========================================================================== */

function init() {
  loadItems();
  const today = getTodayString();
  itemDateInput.value = today;
  itemDateInput.max = today;
  refreshUI();
}

init();

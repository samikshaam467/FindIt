# FindIt – Campus Lost & Found Portal

A clean, beginner-friendly, and responsive **Campus Lost & Found Portal** built with **HTML5**, **CSS3**, **Vanilla JavaScript**, and browser **LocalStorage**—no frameworks or backend required.

## Features

- **Home & Live Statistics:** Welcome hero section with quick search, Lost/Found report buttons, and live counters for **Lost**, **Found**, and **Resolved** items.
- **Browse & Filter Items:** Responsive item cards displaying item name, category, description, campus location, date, and status. Includes real-time search by name, status & category filters, and a friendly empty state.
- **Report an Item:** Validated form to report lost or found items with item name, category, campus location, date, description, and contact information.
- **Item Details & Status Management:** Modal view showing complete item and contact information, with confirmation prompts before marking an item as **Resolved** or **Deleting** a report.
- **Persistent Data:** Pre-loaded with 7 realistic sample campus items and automatically saves all additions, resolutions, and deletions in `localStorage`.

## Tech Stack

- **HTML5** (Semantic markup & accessible forms/modals)
- **CSS3** (Custom properties, CSS Grid/Flexbox, responsive design with Navy Blue, White, and Soft Purple palette)
- **Vanilla JavaScript** (DOM manipulation, input validation, `localStorage` persistence)

## Project Structure

```text
findit-campus-lost-found/
├── index.html   # Main HTML structure and item details modal
├── style.css    # Responsive styles, theme colors, and animations
├── script.js    # App logic, sample data, validation, and LocalStorage
├── README.md    # Project documentation
└── .gitignore   # Ignored editor/OS files
```

## How to Run Locally

1. Clone or download this repository.
2. Open the project folder and double-click `index.html` to launch it directly in your browser—or open it with the **Live Server** extension in VS Code.

# Simple Vector Tools

A minimalist pixel-themed drawing app built with p5.js. Simple, clean, and retro — for making quick shape-based art directly in the browser.

## Features

- **10 tools**: select, arc, circle, ellipse, line, point, quad, rect, square, triangle
- **Layer management**: reorder, select, delete layers
- **Image import**: from local file or direct image URL
- **Live properties**: color, position (x/y), arc angles and mode
- **Transform on canvas**: drag, rotate, scale with handles
- **Keyboard shortcuts**: `V` for select, `Delete`/`Backspace` to remove selected
- **Pixel2 aesthetic**: sharp corners, phosphor green accent (#33ff66), IBM Plex Mono + Silkscreen fonts

## Structure

```
├── index.html      # Markup
├── css/style.css   # Pixel2 theme
└── js/app.js       # Canvas + UI logic
```

No build step. Pure HTML/CSS/JS + p5.js from CDN.

## Usage

Open `index.html` in any modern browser, or visit the live GitHub Pages deployment.


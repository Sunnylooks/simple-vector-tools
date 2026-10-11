// p5 studio — pixel edition
// Canvas logic + UI wiring

let p5Canvas;
let shapes = [];
let currentTool = 'select';
let selectedShape = null;
let shapeCounters = {};

let interactionState = 'none';
let dragOffset = { x: 0, y: 0 };
let initialAngle = 0;
let initialRotation = 0;
let initialDist = 0;
let initialScale = 1;
let hoveredHandle = null;

const toolBtns = document.querySelectorAll('.tool-btn');
const layersList = document.getElementById('layersList');
const btnUp = document.getElementById('btnLayerUp');
const btnDown = document.getElementById('btnLayerDown');
const btnDel = document.getElementById('btnDelete');
const imgUpload = document.getElementById('imageUpload');
const urlBtn = document.getElementById('urlImageBtn');
const dynamicProperties = document.getElementById('dynamicProperties');
const mediaHint = document.getElementById('mediaHint');
const urlInputRow = document.getElementById('urlInputRow');
const urlInput = document.getElementById('urlInput');

const TOOL_ICONS = {
  arc: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="7" y="2" width="2" height="2"/><rect x="5" y="4" width="4" height="2"/><rect x="2" y="8" width="2" height="2"/><rect x="7" y="8" width="2" height="4"/><rect x="4" y="12" width="8" height="2"/></svg>',
  circle: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="6" y="2" width="4" height="2"/><rect x="2" y="6" width="2" height="4"/><rect x="12" y="6" width="2" height="4"/><rect x="6" y="12" width="4" height="2"/></svg>',
  ellipse: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="4" y="3" width="8" height="2"/><rect x="2" y="5" width="2" height="6"/><rect x="12" y="5" width="2" height="6"/><rect x="4" y="11" width="8" height="2"/></svg>',
  line: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="12" width="2" height="2"/><rect x="4" y="10" width="2" height="2"/><rect x="6" y="8" width="2" height="2"/><rect x="8" y="6" width="2" height="2"/><rect x="10" y="4" width="2" height="2"/><rect x="12" y="2" width="2" height="2"/></svg>',
  point: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="6" y="6" width="4" height="4"/></svg>',
  quad: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="6" y="2" width="4" height="2"/><rect x="12" y="6" width="2" height="4"/><rect x="6" y="12" width="4" height="2"/><rect x="2" y="6" width="2" height="4"/></svg>',
  rect: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="3" width="12" height="2"/><rect x="2" y="11" width="12" height="2"/><rect x="2" y="3" width="2" height="10"/><rect x="12" y="3" width="2" height="10"/></svg>',
  square: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="4" y="4" width="8" height="2"/><rect x="4" y="10" width="8" height="2"/><rect x="4" y="4" width="2" height="8"/><rect x="10" y="4" width="2" height="8"/></svg>',
  triangle: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="7" y="2" width="2" height="2"/><rect x="5" y="4" width="6" height="2"/><rect x="2" y="8" width="4" height="2"/><rect x="10" y="8" width="4" height="2"/><rect x="2" y="12" width="12" height="2"/></svg>',
  image: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="3" width="12" height="2"/><rect x="2" y="11" width="12" height="2"/><rect x="2" y="3" width="2" height="10"/><rect x="12" y="3" width="2" height="10"/><rect x="5" y="7" width="6" height="2"/></svg>',
};

class CanvasShape {
  constructor(type, x, y) {
    this.id = Date.now() + Math.random().toString(36).slice(2, 11);
    this.type = type;

    shapeCounters[type] = (shapeCounters[type] || 0) + 1;
    this.name = `${type.charAt(0).toUpperCase() + type.slice(1)} ${shapeCounters[type]}`;

    this.x = x;
    this.y = y;
    this.w = 120;
    this.h = 120;
    this.rotation = 0;
    this.scale = 1;
    this.color = '#33ff66';
    this.img = null;
    this.arcStart = 0;
    this.arcEnd = 270;
    this.arcMode = 'PIE';
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    scale(this.scale);

    if (this.type !== 'image' && this.type !== 'point' && this.type !== 'line') {
      fill(this.color);
      noStroke();
    } else if (this.type === 'point' || this.type === 'line') {
      stroke(this.color);
      strokeWeight(4 / this.scale);
    }

    rectMode(CENTER);
    ellipseMode(CENTER);

    switch (this.type) {
      case 'arc': {
        const mode = this.arcMode === 'CHORD' ? CHORD : this.arcMode === 'OPEN' ? OPEN : PIE;
        arc(0, 0, this.w, this.h, radians(this.arcStart), radians(this.arcEnd), mode);
        break;
      }
      case 'circle':
        circle(0, 0, this.w);
        break;
      case 'ellipse':
        ellipse(0, 0, this.w, this.h);
        break;
      case 'line':
        line(-this.w / 2, -this.h / 2, this.w / 2, this.h / 2);
        break;
      case 'point':
        strokeWeight(8 / this.scale);
        point(0, 0);
        break;
      case 'quad':
        quad(-this.w / 2, -this.h / 2, this.w / 2, -this.h / 2.5, this.w / 2.5, this.h / 2, -this.w / 2, this.h / 2);
        break;
      case 'rect':
        rect(0, 0, this.w, this.h);
        break;
      case 'square':
        square(0, 0, this.w);
        break;
      case 'triangle':
        triangle(0, -this.h / 2, -this.w / 2, this.h / 2, this.w / 2, this.h / 2);
        break;
      case 'image':
        if (this.img) {
          imageMode(CENTER);
          image(this.img, 0, 0, this.w, this.h);
        }
        break;
    }
    pop();
  }

  contains(mx, my) {
    const dx = mx - this.x;
    const dy = my - this.y;
    const cosA = Math.cos(-this.rotation);
    const sinA = Math.sin(-this.rotation);
    const localX = (dx * cosA - dy * sinA) / this.scale;
    const localY = (dx * sinA + dy * cosA) / this.scale;

    if (this.type === 'point') return dist(0, 0, localX, localY) < 15;
    return (localX >= -this.w / 2 && localX <= this.w / 2 && localY >= -this.h / 2 && localY <= this.h / 2);
  }
}

function setup() {
  const container = document.getElementById('p5-container');
  p5Canvas = createCanvas(container.clientWidth, container.clientHeight);
  p5Canvas.parent('p5-container');
  updateUI();
}

function windowResized() {
  const container = document.getElementById('p5-container');
  resizeCanvas(container.clientWidth, container.clientHeight);
}

function draw() {
  clear();
  for (const shape of shapes) shape.draw();

  if (selectedShape && currentTool === 'select') {
    drawSelection(selectedShape);
    updateHoverState(selectedShape);
  } else {
    cursor(CROSS);
  }
}

function drawSelection(shape) {
  push();
  translate(shape.x, shape.y);
  rotate(shape.rotation);

  const hw = (shape.w / 2) * shape.scale + 6;
  const hh = (shape.h / 2) * shape.scale + 6;

  noFill();
  stroke('#33ff66');
  strokeWeight(1);
  rectMode(CENTER);
  rect(0, 0, hw * 2, hh * 2);

  fill('#33ff66');
  noStroke();
  const hs = 8;
  rect(-hw - hs / 2, -hh - hs / 2, hs, hs);
  rect(hw - hs / 2, -hh - hs / 2, hs, hs);
  rect(-hw - hs / 2, hh - hs / 2, hs, hs);
  rect(hw - hs / 2, hh - hs / 2, hs, hs);

  stroke('#33ff66');
  strokeWeight(1);
  line(0, -hh, 0, -hh - 20);
  fill('#33ff66');
  circle(0, -hh - 25, 10);
  pop();
}

function updateHoverState(shape) {
  if (interactionState !== 'none') return;
  hoveredHandle = null;

  const m = getLocalMouse(shape);
  const hw = (shape.w / 2) * shape.scale + 6;
  const hh = (shape.h / 2) * shape.scale + 6;
  const hs = 12;

  if (dist(m.x, m.y, 0, -hh - 25) < hs) hoveredHandle = 'rot';
  else if (abs(m.x + hw) < hs && abs(m.y + hh) < hs) hoveredHandle = 'tl';
  else if (abs(m.x - hw) < hs && abs(m.y + hh) < hs) hoveredHandle = 'tr';
  else if (abs(m.x + hw) < hs && abs(m.y - hh) < hs) hoveredHandle = 'bl';
  else if (abs(m.x - hw) < hs && abs(m.y - hh) < hs) hoveredHandle = 'br';

  if (hoveredHandle === 'rot') cursor(HAND);
  else if (hoveredHandle === 'tl' || hoveredHandle === 'br') cursor('nwse-resize');
  else if (hoveredHandle === 'tr' || hoveredHandle === 'bl') cursor('nesw-resize');
  else cursor(ARROW);
}

function getLocalMouse(shape) {
  const dx = mouseX - shape.x;
  const dy = mouseY - shape.y;
  const cosA = Math.cos(-shape.rotation);
  const sinA = Math.sin(-shape.rotation);
  return { x: dx * cosA - dy * sinA, y: dx * sinA + dy * cosA };
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;

  if (currentTool === 'select') {
    if (selectedShape && hoveredHandle) {
      if (hoveredHandle === 'rot') {
        interactionState = 'rotate';
        initialAngle = atan2(mouseY - selectedShape.y, mouseX - selectedShape.x);
        initialRotation = selectedShape.rotation;
      } else {
        interactionState = 'scale';
        initialDist = dist(mouseX, mouseY, selectedShape.x, selectedShape.y);
        initialScale = selectedShape.scale;
      }
      return;
    }

    let clicked = null;
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (shapes[i].contains(mouseX, mouseY)) {
        clicked = shapes[i];
        break;
      }
    }

    selectShape(clicked);

    if (clicked) {
      interactionState = 'drag';
      dragOffset.x = clicked.x - mouseX;
      dragOffset.y = clicked.y - mouseY;
    }
  } else {
    const s = new CanvasShape(currentTool, mouseX, mouseY);
    const lastColor = document.getElementById('propColor');
    if (lastColor) s.color = lastColor.value;

    shapes.push(s);
    setTool('select');
    selectShape(s);
    updateUI();
  }
}

function mouseDragged() {
  if (!selectedShape || interactionState === 'none') return;

  if (interactionState === 'drag') {
    selectedShape.x = mouseX + dragOffset.x;
    selectedShape.y = mouseY + dragOffset.y;
  } else if (interactionState === 'rotate') {
    const cur = atan2(mouseY - selectedShape.y, mouseX - selectedShape.x);
    selectedShape.rotation = initialRotation + (cur - initialAngle);
  } else if (interactionState === 'scale') {
    const cur = dist(mouseX, mouseY, selectedShape.x, selectedShape.y);
    if (initialDist > 0) {
      const ratio = cur / initialDist;
      selectedShape.scale = constrain(initialScale * ratio, 0.1, 10);
    }
  }
}

function mouseReleased() {
  if (interactionState !== 'none' && selectedShape) {
    // refresh property inputs to match final transform values
    updatePropertiesPanel();
  }
  interactionState = 'none';
}

// ============ UI ============

function updatePropertiesPanel() {
  dynamicProperties.innerHTML = '';

  if (!selectedShape) {
    dynamicProperties.innerHTML = '<div class="props-empty">nothing selected</div>';
    return;
  }

  if (selectedShape.type !== 'image') {
    dynamicProperties.innerHTML += `
      <div class="prop-row">
        <span class="prop-label">color</span>
        <input type="color" id="propColor" value="${selectedShape.color}">
      </div>
    `;
  }

  if (selectedShape.type === 'arc') {
    dynamicProperties.innerHTML += `
      <div class="prop-slider-block">
        <div class="prop-slider-head">
          <span class="prop-label">start angle</span>
          <span class="prop-val" id="valStart">${selectedShape.arcStart}&deg;</span>
        </div>
        <input type="range" id="propArcStart" min="0" max="360" value="${selectedShape.arcStart}">
      </div>
      <div class="prop-slider-block">
        <div class="prop-slider-head">
          <span class="prop-label">end angle</span>
          <span class="prop-val" id="valEnd">${selectedShape.arcEnd}&deg;</span>
        </div>
        <input type="range" id="propArcEnd" min="0" max="360" value="${selectedShape.arcEnd}">
      </div>
      <div class="prop-row">
        <span class="prop-label">arc mode</span>
        <select id="propArcMode">
          <option value="PIE" ${selectedShape.arcMode === 'PIE' ? 'selected' : ''}>PIE</option>
          <option value="CHORD" ${selectedShape.arcMode === 'CHORD' ? 'selected' : ''}>CHORD</option>
          <option value="OPEN" ${selectedShape.arcMode === 'OPEN' ? 'selected' : ''}>OPEN</option>
        </select>
      </div>
    `;
  }

  // Transform — position + size (editable)
  const showH = ['ellipse', 'rect', 'arc', 'quad', 'image', 'line'].includes(selectedShape.type);
  dynamicProperties.innerHTML += `
    <div class="prop-row">
      <span class="prop-label">x</span>
      <input type="number" id="propX" value="${Math.round(selectedShape.x)}">
    </div>
    <div class="prop-row">
      <span class="prop-label">y</span>
      <input type="number" id="propY" value="${Math.round(selectedShape.y)}">
    </div>
    <div class="prop-row">
      <span class="prop-label">w</span>
      <input type="number" id="propW" value="${Math.round(selectedShape.w)}" min="1">
    </div>
    ${showH ? `<div class="prop-row">
      <span class="prop-label">h</span>
      <input type="number" id="propH" value="${Math.round(selectedShape.h)}" min="1">
    </div>` : ''}
  `;

  setTimeout(() => {
    const colorInp = document.getElementById('propColor');
    if (colorInp) {
      colorInp.addEventListener('input', (e) => {
        selectedShape.color = e.target.value;
      });
    }

    // Number inputs: position + size
    const bindNum = (id, apply) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', (e) => {
        const v = parseFloat(e.target.value);
        if (!isNaN(v)) apply(v);
      });
    };
    bindNum('propX', (v) => { selectedShape.x = v; });
    bindNum('propY', (v) => { selectedShape.y = v; });
    bindNum('propW', (v) => { selectedShape.w = Math.max(1, v); });
    bindNum('propH', (v) => { selectedShape.h = Math.max(1, v); });

    if (selectedShape.type === 'arc') {
      const startInp = document.getElementById('propArcStart');
      const endInp = document.getElementById('propArcEnd');
      const modeSel = document.getElementById('propArcMode');
      const valStart = document.getElementById('valStart');
      const valEnd = document.getElementById('valEnd');

      startInp.addEventListener('input', (e) => {
        selectedShape.arcStart = parseInt(e.target.value, 10);
        valStart.textContent = `${e.target.value}\u00B0`;
      });
      endInp.addEventListener('input', (e) => {
        selectedShape.arcEnd = parseInt(e.target.value, 10);
        valEnd.textContent = `${e.target.value}\u00B0`;
      });
      modeSel.addEventListener('change', (e) => {
        selectedShape.arcMode = e.target.value;
      });
    }
  }, 0);
}

function setTool(tool) {
  currentTool = tool;
  toolBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tool === tool);
  });
  if (tool !== 'select') selectShape(null);
}

function selectShape(shape) {
  selectedShape = shape;
  const has = !!shape;
  btnUp.disabled = !has;
  btnDown.disabled = !has;
  btnDel.disabled = !has;
  updatePropertiesPanel();
  renderLayers();
}

function updateUI() {
  updatePropertiesPanel();
  renderLayers();
}

function renderLayers() {
  layersList.innerHTML = '';

  if (shapes.length === 0) {
    layersList.innerHTML = '<div class="layers-empty">no elements</div>';
    return;
  }

  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    const item = document.createElement('div');
    const isActive = shape === selectedShape;
    item.className = `layer-item${isActive ? ' active' : ''}`;
    item.innerHTML = `${TOOL_ICONS[shape.type] || TOOL_ICONS.rect}<span class="layer-name">${shape.name}</span>`;
    item.addEventListener('click', () => {
      setTool('select');
      selectShape(shape);
    });
    layersList.appendChild(item);
  }
}

// ============ events ============

toolBtns.forEach((btn) => {
  btn.addEventListener('click', () => setTool(btn.dataset.tool));
});

btnDel.addEventListener('click', () => {
  if (selectedShape) {
    shapes = shapes.filter((s) => s !== selectedShape);
    selectShape(null);
    updateUI();
  }
});

function reorder(dir) {
  if (!selectedShape) return;
  const idx = shapes.indexOf(selectedShape);
  if (dir === 1 && idx < shapes.length - 1) {
    [shapes[idx], shapes[idx + 1]] = [shapes[idx + 1], shapes[idx]];
  } else if (dir === -1 && idx > 0) {
    [shapes[idx], shapes[idx - 1]] = [shapes[idx - 1], shapes[idx]];
  }
  updateUI();
}
btnUp.addEventListener('click', () => reorder(1));
btnDown.addEventListener('click', () => reorder(-1));

function addImageShape(img) {
  const s = new CanvasShape('image', width / 2, height / 2);
  const aspect = img.width / img.height;
  if (img.width > 200) { s.w = 200; s.h = 200 / aspect; }
  else { s.w = img.width; s.h = img.height; }

  s.img = img;
  shapes.push(s);
  setTool('select');
  selectShape(s);
  updateUI();
}

imgUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      loadImage(ev.target.result, addImageShape);
    };
    reader.readAsDataURL(file);
  }
  e.target.value = '';
});

urlBtn.addEventListener('click', () => {
  const isOpen = !urlInputRow.hidden;
  if (isOpen) {
    // toggle off
    urlInputRow.hidden = true;
    urlInput.value = '';
    mediaHint.textContent = '';
    mediaHint.classList.remove('error');
    return;
  }
  urlInputRow.hidden = false;
  urlInput.focus();
});

function loadImageFromUrl() {
  const url = urlInput.value.trim();
  if (!url) {
    mediaHint.textContent = 'enter a url first';
    mediaHint.classList.add('error');
    return;
  }
  mediaHint.textContent = 'loading...';
  mediaHint.classList.remove('error');
  loadImage(
    url,
    (img) => {
      addImageShape(img);
      mediaHint.textContent = '';
      urlInputRow.hidden = true;
      urlInput.value = '';
    },
    () => {
      mediaHint.textContent = 'failed - use a direct image link (ends .jpg/.png)';
      mediaHint.classList.add('error');
    }
  );
}

urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    loadImageFromUrl();
  } else if (e.key === 'Escape') {
    urlInputRow.hidden = true;
    urlInput.value = '';
    mediaHint.textContent = '';
    mediaHint.classList.remove('error');
  }
});

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  if (e.key === 'v' || e.key === 'V') setTool('select');
  if (e.key === 'Backspace' || e.key === 'Delete') {
    if (selectedShape) {
      shapes = shapes.filter((s) => s !== selectedShape);
      selectShape(null);
      updateUI();
    }
  }
});

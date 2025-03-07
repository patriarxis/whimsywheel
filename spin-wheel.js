const PRIZE_MODES = {
  default: "default",
  grandPrize: "grand-prize",
  tryAgain: "try-again",
};

const prizeBgColors = {
  [PRIZE_MODES.default]: "#e7e7e7",
  [PRIZE_MODES.grandPrize]: "#e90037",
  [PRIZE_MODES.tryAgain]: "#464342",
};

const prizeColors = {
  [PRIZE_MODES.default]: "#464342",
  [PRIZE_MODES.grandPrize]: "white",
  [PRIZE_MODES.tryAgain]: "white",
};

const availablePrizes = [
  {
    name: "SUV",
    type: "suv",
    image: "./assets/images/prizes/suv.webp",
    wheelImage: "./assets/images/wheel-prizes/suv.webp",
    probability: "00.1",
    mode: PRIZE_MODES.grandPrize,
    active: true,
  },
  {
    name: "Try Again",
    type: "try-again",
    image: "./assets/images/prizes/try-again.webp",
    wheelImage: "./assets/images/wheel-prizes/try-again.webp",
    probability: "50",
    mode: PRIZE_MODES.tryAgain,
    active: true,
  },
  {
    name: "Tote Bag",
    type: "tote-bag",
    image: "./assets/images/prizes/tote-bag.webp",
    wheelImage: "./assets/images/wheel-prizes/tote-bag.webp",
    probability: "5",
    mode: PRIZE_MODES.default,
    active: true,
  },
  {
    name: "Keychain",
    type: "keychain",
    image: "./assets/images/prizes/keychain.webp",
    wheelImage: "./assets/images/wheel-prizes/keychain.webp",
    probability: "70",
    mode: PRIZE_MODES.default,
    active: true,
  },
  {
    name: "Tickets",
    type: "tickets",
    image: "./assets/images/prizes/tickets.webp",
    wheelImage: "./assets/images/wheel-prizes/tickets.webp",
    probability: "15",
    mode: PRIZE_MODES.default,
    active: true,
  },
  {
    name: "OSFP Gifts",
    type: "osfp-gifts",
    image: "./assets/images/prizes/olympiacos-gifts.webp",
    wheelImage: "./assets/images/wheel-prizes/olympiacos-gifts.webp",
    probability: "10",
    mode: PRIZE_MODES.default,
    active: true,
  },
  {
    name: "Mystery",
    type: "mystery",
    image: "./assets/images/prizes/mystery-box.webp",
    wheelImage: "./assets/images/wheel-prizes/mystery-box.webp",
    probability: "5",
    mode: PRIZE_MODES.default,
    active: true,
  },
  {
    name: "Cup",
    type: "cup",
    image: "./assets/images/prizes/cup.webp",
    wheelImage: "./assets/images/wheel-prizes/cup.webp",
    probability: "10",
    mode: PRIZE_MODES.default,
    active: true,
  },
  {
    name: "Air Freshener",
    type: "air-freshener",
    image: "./assets/images/prizes/air-freshener.webp",
    wheelImage: "./assets/images/wheel-prizes/air-freshener.webp",
    probability: "10",
    mode: PRIZE_MODES.default,
    active: true,
  },
  {
    name: "Voucher",
    type: "voucher",
    image: "./assets/images/prizes/voucher.webp",
    wheelImage: "./assets/images/wheel-prizes/voucher.webp",
    probability: "10",
    mode: PRIZE_MODES.default,
    active: true,
  },
];

let prizes = availablePrizes.map((prize, index) => ({
  id: index + 1,
  name: prize.name,
  type: prize.type,
  image: prize.image,
  wheelImage: prize.wheelImage,
  probability: prize.probability,
  mode: prize.mode,
  active: prize.active,
}));

/* Sound Manager Class */
class SoundManager {
  constructor() {
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.sounds = {};
    this.soundUrls = {
      buttonHover:
        "https://hub.flexcar.gr/hubfs/Landing%20Pages/Spin%20Wheel/Sounds/button-hover.wav",
      buttonPressed:
        "https://hub.flexcar.gr/hubfs/Landing%20Pages/Spin%20Wheel/Sounds/button-pressed.wav",
      spinButtonPressed:
        "https://hub.flexcar.gr/hubfs/Landing%20Pages/Spin%20Wheel/Sounds/spin-button-pressed.wav",
      spinWheel:
        "https://hub.flexcar.gr/hubfs/Landing%20Pages/Spin%20Wheel/Sounds/spin-wheel.wav",
      win: "https://hub.flexcar.gr/hubfs/Landing%20Pages/Spin%20Wheel/Sounds/win.wav",
      lose: "https://hub.flexcar.gr/hubfs/Landing%20Pages/Spin%20Wheel/Sounds/lose.wav",
      prizeHover:
        "https://hub.flexcar.gr/hubfs/Landing%20Pages/Spin%20Wheel/Sounds/prize-toggle.wav",
      prizePressed:
        "https://hub.flexcar.gr/hubfs/Landing%20Pages/Spin%20Wheel/Sounds/prize-pressed.wav",
      prizeToggle:
        "https://hub.flexcar.gr/hubfs/Landing%20Pages/Spin%20Wheel/Sounds/prize-toggle.wav",
      prizeDrag:
        "https://hub.flexcar.gr/hubfs/Landing%20Pages/Spin%20Wheel/Sounds/prize-drag.wav",
    };
  }

  async loadSound(key, url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds[key] = audioBuffer;
    } catch (error) {
      console.error(`Error loading sound ${key}:`, error);
    }
  }

  async initializeSounds() {
    const loadPromises = Object.entries(this.soundUrls).map(([key, url]) =>
      this.loadSound(key, url)
    );
    await Promise.all(loadPromises);
  }

  play(soundKey, volume = 0.7) {
    if (!this.sounds[soundKey]) return;

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = this.sounds[soundKey];
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);
  }
}

let tempPrizes = [];
const soundManager = new SoundManager();
const expirationDays = 7;

addEventListener("DOMContentLoaded", () => {
  const storedPrizes = getStoredPrizes();

  if (storedPrizes) {
    prizes = storedPrizes;
  }

  pacman = document.querySelector(".pacman");
  const animationDuration = getComputedStyle(pacman).getPropertyValue(
    "--pacman-animation-duration"
  );
  animationDurationMs = parseFloat(animationDuration) * 1000;

  drawWheel();
  window.addEventListener("resize", fitStageIntoParentContainer);
  renderPacman();
  initializeButtonSounds();
});

function getStoredPrizes() {
  const storedData = localStorage.getItem("prizes");

  if (storedData) {
    const parsedData = JSON.parse(storedData);
    const now = new Date().getTime();

    if (now < parsedData.expiry) {
      return parsedData.value;
    } else {
      localStorage.removeItem("prizes");
      return null;
    }
  }

  return null;
}

function initializeButtonSounds() {
  const initializeSounds = () => {
    soundManager.initializeSounds();
    document.removeEventListener("click", initializeSounds);
    document.removeEventListener("touchstart", initializeSounds);
  };

  document.addEventListener("click", initializeSounds);
  document.addEventListener("touchstart", initializeSounds);

  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!button.disabled) {
        soundManager.play("buttonPressed");
      }
    });

    button.addEventListener("mouseover", () => {
      if (!button.disabled) {
        soundManager.play("buttonHover");
      }
    });
  });
}

function initializePrizeSounds(prizeElement) {
  prizeElement.addEventListener("mouseenter", () => {
    soundManager.play("prizeHover");
  });

  const checkbox = prizeElement.querySelector(".checkbox");
  checkbox.addEventListener("change", () => {
    soundManager.play("prizeToggle");
  });

  const colorButton = prizeElement.querySelector(".prize-color");
  colorButton.addEventListener("click", () => {
    soundManager.play("prizePressed");
  });
}

/* Backdrop */

function createModalBackdrop(closeFunction, zIndex) {
  const body = document.querySelector("body");
  const backdrop = document.createElement("div");

  backdrop.classList.add("backdrop");
  backdrop.style.zIndex = zIndex;

  body.appendChild(backdrop);
  body.classList.add("no-scroll");

  requestAnimationFrame(() => {
    backdrop.classList.add("active");
  });

  backdrop.addEventListener("click", () => {
    closeFunction();
    removeModalBackdrop(backdrop);
  });

  return backdrop;
}

function removeModalBackdrop(backdrop) {
  if (backdrop) {
    backdrop.classList.remove("active");
    setTimeout(() => {
      backdrop.remove();
    }, 200);
  }
}

/* Spin Wheel */

let radius = 1000;
let sceneWidth = radius * 2;
let sceneHeight = radius * 2;
let stage;
let wheelGroup;
let layer;
let isSpinning = false;
let rotation = 0;

function createCurvedText(text, radius, options = {}) {
  const {
    fontSize = 24,
    fontStyle = "800",
    fill = "000",
    startAngle = 0,
    verticalAlign = "middle",
  } = options;

  const group = new Konva.Group();

  // Create a single text path to wrap the text
  const textPath = new Konva.TextPath({
    x: 0,
    y: 0,
    text: text,
    fontSize: fontSize,
    fontStyle: fontStyle,
    fill: fill,
    data: `M-${radius},0 A${radius},${radius} 0 0,1 ${radius},0`,
    align: "center",
    verticalAlign: verticalAlign,
    rotation: startAngle + 90,
  });

  group.add(textPath);

  return group;
}

function drawWheel() {
  stage = new Konva.Stage({
    container: "wheel-stage",
    width: sceneWidth,
    height: sceneHeight,
  });

  layer = new Konva.Layer();
  stage.add(layer);

  wheelGroup = new Konva.Group({
    x: sceneWidth / 2,
    y: sceneHeight / 2,
  });
  layer.add(wheelGroup);

  const activePrizes = prizes.filter((prize) => prize.active);
  const sectorAngle = 360 / activePrizes.length;

  activePrizes.forEach((prize, index) => {
    const angle = sectorAngle * index;

    const sectorGroup = new Konva.Group({
      rotation: angle,
    });

    const wedge = new Konva.Wedge({
      angle: sectorAngle,
      radius: radius,
      fill: prizeBgColors[prize.mode],
      stroke: "#b5b3b3",
      strokeWidth: 1,
    });

    const textRadius = radius * 0.9;
    const imageRadius = radius * 0.6;

    const bisectorAngle = sectorAngle / 2;

    const imageX = imageRadius * Math.cos((bisectorAngle * Math.PI) / 180);
    const imageY = imageRadius * Math.sin((bisectorAngle * Math.PI) / 180);

    const text = createCurvedText(prize.name, textRadius, {
      fontSize: 48,
      fontStyle: "800",
      fill: prizeColors[prize.mode],
      startAngle: sectorAngle / 2,
      verticalAlign: "middle",
    });

    const imageObj = new Image();
    imageObj.onload = function () {
      const imageSize = radius * 0.38;
      const image = new Konva.Image({
        image: imageObj,
        width: imageSize,
        height: imageSize * 1.4,
        x: imageX,
        y: imageY,
        offsetX: imageSize / 2,
        offsetY: imageSize / 2 + 40,
        rotation: sectorAngle / 2 + 90,
      });

      sectorGroup.add(image);
      layer.batchDraw();
    };

    imageObj.src = prize.wheelImage;

    sectorGroup.add(wedge, text);
    wheelGroup.add(sectorGroup);
  });

  const outerCircle = new Konva.Circle({
    x: 0,
    y: 0,
    radius: radius,
    stroke: "#b5b3b3",
    strokeWidth: 2,
  });
  wheelGroup.add(outerCircle);

  fitStageIntoParentContainer();

  return { stage, wheelGroup };
}

function enableSpinButton() {
  const button = document.querySelector(".spin-button");
  button.disabled = false;
}

function disableSpinButton() {
  const button = document.querySelector(".spin-button");
  button.disabled = true;
}

function fitStageIntoParentContainer() {
  var container = document.querySelector("#wheel-stage");
  var containerWidth = container.offsetWidth;
  var scale = containerWidth / sceneWidth;

  stage.width(sceneWidth * scale);
  stage.height(sceneHeight * scale);
  stage.scale({ x: scale, y: scale });
}

function enableSpinButton() {
  const button = document.querySelector(".spin-button");
  button.disabled = false;
}

function disableSpinButton() {
  const button = document.querySelector(".spin-button");
  button.disabled = true;
}

function startArrowJiggle() {
  const arrow = document.querySelector(".wheel-arrow");
  let startTime = null;

  function jiggleAnimationStep(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    const totalDuration = 5000;
    const progress = Math.min(elapsed / totalDuration, 1);

    const decayFactor = Math.pow(1 - progress, 3);

    const maxBottomAngle = 35;
    const initialFrequency = 10;
    const finalFrequency = 1;

    const currentFrequency =
      initialFrequency * (1 - progress) + finalFrequency * progress;

    const bottomAngle =
      maxBottomAngle *
      decayFactor *
      Math.sin((currentFrequency * elapsed) / 50);

    arrow.style.transformOrigin = "top center";
    arrow.style.transform = `
      translateX(-50%) 
      rotate(${bottomAngle}deg)
    `;

    if (progress < 1) {
      requestAnimationFrame(jiggleAnimationStep);
    } else {
      arrow.style.transform = `translateX(-50%) rotate(0deg)`;
    }
  }

  requestAnimationFrame(jiggleAnimationStep);
}

function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;

  soundManager.play("spinButtonPressed");
  disableSpinButton();
  startArrowJiggle();

  soundManager.play("spinWheel");

  const selectedPrize = selectPrizeByProbability();
  const targetRotation = calculateTargetRotation(selectedPrize);

  const spinDuration = 5100;
  const startRotation = rotation;
  const startTime = Date.now();

  function animate() {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min(elapsedTime / spinDuration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    rotation = startRotation + targetRotation * easeProgress;
    wheelGroup.rotation(rotation);
    layer.batchDraw();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;

      enableSpinButton();

      if (selectedPrize.mode === PRIZE_MODES.tryAgain) {
        openTryAgainModal(selectedPrize);
      } else {
        openWinningModal(selectedPrize);
      }
      rotation %= 360;
    }
  }

  animate();
}

/* Pacman */

let pacman;
let dots = [];
let animationDurationMs;

function renderPacman() {
  const dotsContainer = document.querySelector(".dots");

  for (let i = 0; i < 45; i++) {
    const dot = document.createElement("img");
    const index = i % prizes.length;

    dot.src = prizes[index].image;
    dot.alt = prizes[index].name;
    dot.classList.add("dot");

    dotsContainer.appendChild(dot);
    dots.push(dot);
  }

  animatePacman();

  setInterval(() => {
    animatePacman();
  }, animationDurationMs + 3000);
}

function animatePacman() {
  startPacmanAnimation(animationDurationMs);
  endPacmanAnimation(animationDurationMs);
}

function startPacmanAnimation() {
  pacman.classList.add("pacman-animation");
  checkCollisions(dots);
}

function endPacmanAnimation() {
  setTimeout(() => {
    pacman.classList.remove("pacman-animation");
    resetDots(dots);
  }, animationDurationMs);
}

function checkCollisions(dots) {
  let animationFrameId;

  function animateCollision() {
    const pacmanRect = pacman.getBoundingClientRect();

    dots.forEach((dot) => {
      if (!dot.classList.contains("eaten")) {
        const dotRect = dot.getBoundingClientRect();

        if (isColliding(pacmanRect, dotRect)) {
          dot.classList.add("eaten");
        }
      }
    });

    animationFrameId = requestAnimationFrame(animateCollision);
  }

  animateCollision();
}

function isColliding(rect1, rect2) {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

function resetDots(dots) {
  dots.forEach((dot, index) => {
    setTimeout(() => {
      dot.classList.remove("eaten");
    }, index * 100);
  });
}

/* Settings Menu */

let settingsModalBackdrop = null;
function openSettingsModal() {
  const settings = document.querySelector(".settings-menu");
  const settingsModal = settings.querySelector(".modal");

  requestAnimationFrame(() => {
    settings.dataset.state = "open";
    settings.style.zIndex = 1200;
    settingsModal.classList.add("fadeInUp");
  });

  settingsModalBackdrop = createModalBackdrop(closeSettingsModal, 1199);

  tempPrizes = JSON.parse(JSON.stringify(prizes));
  renderSettings();
}

function closeSettingsModal() {
  const settings = document.querySelector(".settings-menu");
  const settingsModal = settings.querySelector(".modal");

  settingsModal.classList.remove("fadeInUp");
  settingsModal.classList.add("fadeOutDown");
  setTimeout(() => {
    settingsModal.classList.remove("fadeOutDown");
    settings.dataset.state = "closed";
  }, 200);

  removeModalBackdrop(settingsModalBackdrop);
  settingsModalBackdrop = null;
}

function renderPrizes() {
  const prizesList = document.querySelector(".prizes");

  while (prizesList.firstChild) {
    prizesList.removeChild(prizesList.firstChild);
  }

  tempPrizes.forEach((prize) => {
    const prizeElement = createPrizeElement(prize);
    prizesList.appendChild(prizeElement);
  });
}

function createPrizeElement(prize) {
  const prizeElement = document.createElement("li");
  prizeElement.className = `prize-item ${
    prize.active ? "active" : "inactive"
  } ${prize.mode}`;
  prizeElement.setAttribute("data-id", prize.id);
  prizeElement.setAttribute("data-type", prize.type);

  const checkboxWrapper = document.createElement("div");
  checkboxWrapper.className = "prize-checkbox-wrapper";

  const checkboxLabel = document.createElement("label");
  checkboxLabel.className = "custom-checkbox";
  checkboxLabel.htmlFor = `prize-checkbox-${prize.id}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "checkbox";
  checkbox.checked = prize.active;
  checkbox.id = `prize-checkbox-${prize.id}`;
  checkbox.onchange = () => updatePrizeCheck(prize.id, checkbox.checked);

  const checkmark = document.createElement("span");
  checkmark.className = "checkmark";

  checkboxLabel.appendChild(checkbox);
  checkboxLabel.appendChild(checkmark);
  checkboxWrapper.appendChild(checkboxLabel);

  const nameWrapper = document.createElement("div");
  nameWrapper.className = "prize-name-wrapper";

  const nameSelect = document.createElement("select");
  nameSelect.className = "prize-name-select";
  nameSelect.id = `prize-type-select-${prize.id}`;
  nameSelect.name = `prize-type-${prize.id}`;

  availablePrizes.forEach((availablePrize) => {
    const option = document.createElement("option");
    option.value = availablePrize.type;
    option.textContent = availablePrize.name;

    if (availablePrize.type === prize.type) {
      option.selected = true;
    }

    nameSelect.appendChild(option);
  });

  nameSelect.onchange = (event) => {
    const selectedPrizeType = event.target.value;
    const defaultPrize = availablePrizes.find(
      (p) => p.type === selectedPrizeType
    );

    if (defaultPrize) {
      prize.name = defaultPrize.name;
      prize.type = defaultPrize.type;
      prize.image = defaultPrize.image;
      prize.probability = defaultPrize.probability;
      prize.mode = defaultPrize.mode;

      const probabilityInput = prizeElement.querySelector(".prize-probability");
      if (probabilityInput) {
        probabilityInput.value = defaultPrize.probability;
      }

      const prizeIndex = tempPrizes.findIndex((p) => p.id === prize.id);

      if (prizeIndex !== -1) {
        tempPrizes[prizeIndex] = {
          ...defaultPrize,
          id: prize.id,
          active: prize.active,
        };
      }

      prizeElement.setAttribute("data-type", defaultPrize.type);
    }

    renderSettings();
  };

  nameWrapper.appendChild(nameSelect);

  const probabilityWrapper = document.createElement("div");
  probabilityWrapper.className = "prize-probability-wrapper";

  const probabilityInput = document.createElement("input");
  probabilityInput.type = "number";
  probabilityInput.className = "prize-probability";
  probabilityInput.value = prize.probability;
  probabilityInput.id = `prize-probability-${prize.id}`;
  probabilityInput.name = `prize-probability-${prize.id}`;
  probabilityInput.setAttribute("list", "propabilityNumbers");
  probabilityInput.onchange = () =>
    updatePrizeProbability(prize.id, probabilityInput.value);

  probabilityWrapper.appendChild(probabilityInput);

  const colorWrapper = document.createElement("div");
  colorWrapper.className = "prize-color-wrapper";

  const colorButton = document.createElement("button");
  colorButton.className = "prize-color";
  colorButton.onclick = () => cycleMode(prize.id);

  colorWrapper.appendChild(colorButton);

  const rearrangeWrapper = document.createElement("div");
  rearrangeWrapper.className = "prize-rearrange-wrapper";

  const rearrangeSpan = document.createElement("span");
  rearrangeSpan.className = "prize-rearrange";
  rearrangeSpan.textContent = "☰";

  rearrangeWrapper.appendChild(rearrangeSpan);

  const removeWrapper = document.createElement("div");
  removeWrapper.className = "prize-remove-wrapper";

  const removeButton = document.createElement("button");
  removeButton.className = "prize-remove-button";
  removeButton.textContent = "✕";
  removeButton.onclick = () => removePrize(prize.id);

  removeWrapper.appendChild(removeButton);

  prizeElement.appendChild(checkboxWrapper);
  prizeElement.appendChild(nameWrapper);
  prizeElement.appendChild(probabilityWrapper);
  prizeElement.appendChild(colorWrapper);
  prizeElement.appendChild(rearrangeWrapper);
  prizeElement.appendChild(removeWrapper);

  initializePrizeSounds(prizeElement);

  return prizeElement;
}

function cycleMode(prizeId) {
  const prizeIndex = tempPrizes.findIndex((p) => p.id === prizeId);
  const modes = Object.values(PRIZE_MODES);
  const currentModeIndex = modes.findIndex(
    (mode) => mode === tempPrizes[prizeIndex].mode
  );
  const nextModeIndex = (currentModeIndex + 1) % modes.length;
  tempPrizes[prizeIndex].mode = modes[nextModeIndex];

  updatePrizeMode(prizeId, tempPrizes[prizeIndex].mode);
}

function updatePrizeMode(prizeId, mode) {
  const prizeIndex = tempPrizes.findIndex((p) => p.id === prizeId);
  tempPrizes[prizeIndex].mode = mode;
  const prizeElement = document.querySelector(
    `.prize-item[data-id="${prizeId}"]`
  );
  prizeElement.className = `prize-item ${
    tempPrizes[prizeIndex].active ? "active" : "inactive"
  } ${mode}`;
}

function updatePrizeCheck(prizeId, checked) {
  const prizeIndex = tempPrizes.findIndex((p) => p.id === prizeId);
  tempPrizes[prizeIndex].active = checked;

  const prizeElement = document.querySelector(
    `.prize-item[data-id="${prizeId}"]`
  );
  if (checked) {
    enablePrize(prizeElement);
  } else {
    disablePrize(prizeElement);
  }
}

function enablePrize(prizeElement) {
  prizeElement.classList.add("active");
  prizeElement.classList.remove("inactive");
}

function disablePrize(prizeElement) {
  prizeElement.classList.remove("active");
  prizeElement.classList.add("inactive");
}

function updatePrizeProbability(prizeId, probability) {
  const prizeIndex = tempPrizes.findIndex((p) => p.id === prizeId);
  tempPrizes[prizeIndex].probability = probability;
}

function cancelSettings() {
  closeSettingsModal();
}

function applySettings() {
  prizes = JSON.parse(JSON.stringify(tempPrizes));

  const now = new Date();
  const expirationDate = new Date(
    now.getTime() + expirationDays * 24 * 60 * 60 * 1000
  );

  const dataToStore = {
    value: prizes,
    expiry: expirationDate.getTime(),
  };

  localStorage.setItem("prizes", JSON.stringify(dataToStore));
  closeSettingsModal();
  drawWheel();
  renderPacman();
}

let drake = {};

function enableDragAndDrop() {
  const settingsMenu = document.querySelector(".settings-menu");
  const settingsContent = settingsMenu.querySelector(".modal-content");
  const prizesList = settingsMenu.querySelector(".prizes");

  if (prizesList) {
    if (!drake.hasOwnProperty("containers")) {
      drake = dragula([prizesList], {
        moves: function (el, source, handle, sibling) {
          return handle.classList.contains("prize-rearrange");
        },
      });

      drake.on("drag", function (el) {
        console.log(tempPrizes);
        soundManager.play("prizeDrag");
        settingsContent.style.overflow = "hidden";
      });

      drake.on("drop", function (el) {
        soundManager.play("prizeDrag");
        const prizeElements = Array.from(
          prizesList.querySelectorAll(".prize-item")
        );

        const reorderedPrizes = [];
        prizeElements.forEach((element) => {
          const prizeId = parseInt(element.dataset.id, 10);
          const prize = tempPrizes.find((p) => p.id === prizeId);
          if (prize) {
            reorderedPrizes.push({ ...prize });
          }
        });

        tempPrizes = reorderedPrizes;
        console.log(tempPrizes)
        settingsContent.style.overflow = "auto";
      });

      drake.on("cancel", function (el) {
        settingsContent.style.overflow = "auto";
      });
    }
  }
}

function removePrize(prizeId) {
  if (tempPrizes.length <= 1) {
    alert("You must have at least one prize.");
    return;
  }

  tempPrizes = tempPrizes.filter((prize) => prize.id !== prizeId);

  renderSettings();
}

function addNewPrize() {
  const randomPrize =
    availablePrizes[Math.floor(Math.random() * availablePrizes.length)];

  const newPrize = {
    id:
      tempPrizes.length > 0 ? Math.max(...tempPrizes.map((p) => p.id)) + 1 : 1,
    name: randomPrize.name,
    type: randomPrize.type,
    image: randomPrize.image,
    wheelImage: randomPrize.wheelImage,
    probability: randomPrize.probability,
    mode: randomPrize.mode,
    active: true,
  };

  tempPrizes.push(newPrize);

  renderSettings();
}

function renderSettings() {
  renderPrizes();
  enableDragAndDrop();
}

/* Winning Modal */

let winningModalBackdrop = null;
function openWinningModal(prize) {
  const winningModalContainer = document.querySelector(".winning-modal");
  const winningModal = winningModalContainer.querySelector(".modal");
  winningModal.classList.add(prize.mode);

  requestAnimationFrame(() => {
    winningModalContainer.dataset.state = "open";
    winningModalContainer.style.zIndex = 1000;
    winningModalContainer.classList.add("fadeInUp");
  });

  renderWinningPrize(prize);
  soundManager.play("win");

  winningModalBackdrop = createModalBackdrop(closeWinningModal, 999);
}

function closeWinningModal() {
  const winningModalContainer = document.querySelector(".winning-modal");
  const winningModal = winningModalContainer.querySelector(".modal");

  winningModal.classList.remove("fadeInUp");
  winningModal.classList.add("fadeOutDown");
  setTimeout(() => {
    winningModalContainer.dataset.state = "closed";
    winningModal.classList.remove("fadeOutDown");
    winningModal.classList.remove(
      PRIZE_MODES.default,
      PRIZE_MODES.grandPrize,
      PRIZE_MODES.tryAgain
    );
  }, 200);

  removeModalBackdrop(winningModalBackdrop);
  winningModalBackdrop = null;
}

function renderWinningPrize(prize) {
  const info = document.querySelector(".winning-prize-info");

  while (info.firstChild) {
    info.removeChild(info.firstChild);
  }

  const prizeImg = document.querySelector(".winning-prize-img");
  prizeImg.src = prize.image;

  const prizeTitle = document.createElement("h2");
  prizeTitle.className = "winning-prize-name";
  prizeTitle.textContent = prize.name;

  info.append(prizeTitle);

  if (prize.description) {
    const prizeDescription = document.createElement("p");
    prizeDescription.className = "winning-prize-description";
    prizeDescription.textContent = prize.description;

    info.append(prizeDescription);
  }
}

/* Try Again Modal */

let tryAgainModalBackdrop = null;
function openTryAgainModal(prize) {
  const tryAgainModalContainer = document.querySelector(".try-again-modal");
  const tryAgainModal = tryAgainModalContainer.querySelector(".modal");
  tryAgainModal.classList.add(prize.mode);

  requestAnimationFrame(() => {
    tryAgainModalContainer.dataset.state = "open";
    tryAgainModalContainer.style.zIndex = 1100;
    tryAgainModal.classList.add("fadeInUp");
  });

  soundManager.play("lose");

  tryAgainModalBackdrop = createModalBackdrop(closeTryAgainModal, 1099);
}

function closeTryAgainModal() {
  const tryAgainModalContainer = document.querySelector(".try-again-modal");
  const tryAgainModal = tryAgainModalContainer.querySelector(".modal");

  tryAgainModal.classList.remove("fadeInUp");
  tryAgainModal.classList.add("fadeOutDown");
  setTimeout(() => {
    tryAgainModalContainer.dataset.state = "closed";
    tryAgainModal.classList.remove("fadeOutDown");
    tryAgainModal.classList.remove(
      PRIZE_MODES.default,
      PRIZE_MODES.grandPrize,
      PRIZE_MODES.tryAgain
    );
  }, 200);

  removeModalBackdrop(tryAgainModalBackdrop);
  tryAgainModalBackdrop = null;
}

/* Probability Weights */

function calculateTotalWeight() {
  return prizes
    .filter((prize) => prize.active)
    .reduce((sum, prize) => sum + parseFloat(prize.probability), 0);
}

function selectPrizeByProbability() {
  const activePrizes = prizes.filter((prize) => prize.active);
  const totalWeight = calculateTotalWeight();

  let random = Math.random() * totalWeight;

  for (const prize of activePrizes) {
    random -= parseFloat(prize.probability);
    if (random <= 0) {
      return prize;
    }
  }

  return activePrizes[activePrizes.length - 1];
}

function calculateTargetRotation(selectedPrize) {
  const activePrizes = prizes.filter((prize) => prize.active);
  const prizeIndex = activePrizes.findIndex((p) => p.id === selectedPrize.id);
  const sectorAngle = 360 / activePrizes.length;

  const baseRotation = sectorAngle * prizeIndex + sectorAngle / 2;
  const actualRotation = 360 - baseRotation - rotation;

  const maxOffset = sectorAngle * 0.9;
  const randomOffset = (Math.random() - 0.5) * maxOffset;

  const fullSpins = 5;
  const totalRotation = 360 * fullSpins + actualRotation + randomOffset;

  return totalRotation;
}

function validateProbabilities() {
  const totalWeight = calculateTotalWeight();
  const activePrizes = prizes.filter((prize) => prize.active);

  if (totalWeight === 0) {
    alert("Total probability cannot be 0. Please set valid probabilities.");
    return false;
  }

  if (activePrizes.some((prize) => parseFloat(prize.probability) < 0)) {
    alert("Probabilities cannot be negative.");
    return false;
  }

  return true;
}

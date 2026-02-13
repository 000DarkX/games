const state = [
    {},{},{},{}
];

const list = {
    "Jabra EVOLVE 20 MS (Vendor: 0b0e Product: 0300)": { // xbox one 
        button_0: "button_0",
        button_15: "button_15",
        button_14: "button_14"
    },
    "Xbox 360 Controller (XInput STANDARD GAMEPAD)": { // switch
        button_0: "button_0",
        button_15: "button_15",
        button_14: "button_14"
    }
}

export function inputTick(id, config) 
{
    if (config == undefined) {
        config ={
            axis0: "mouse_x",
            axis1: "mouse_y",
            button_0: "action_A",
            button_1: "action_B",
            button_13: "action_down",
            button_12: "action_up",
            button_15: "action_right",
            button_14: "action_left",
        };
    }
    const gamepads = navigator.getGamepads();
    const gamepad  = gamepads[id];
    if (gamepad == null) return false;
    
    //console.log(id, gamepad);
    if (Math.abs(gamepad.axes[0]) > 0.5) {
        dispatchEvent(new CustomEvent(config.axis0, {detail: {id, value: gamepad.axes[0]}}));
    }
    
    if (Math.abs(gamepad.axes[1]) > 0.5) {
        dispatchEvent(new CustomEvent(config.axis1, {detail: {id, value: gamepad.axes[1]}}));
    }

    for (let i = 0; i < gamepad.buttons.length; ++i) {
        if (gamepad.buttons[i].pressed) {
            let buttonMap = `button_${i}`;
            const l = list[gamepad.id];
            if (l) {
                buttonMap = l[buttonMap];
            }
            if (!(state[id][`button_${i}`])) {
                state[id][`button_${i}`] = null;
            }
            console.log(i);
            const time = gamepad.timestamp - (state[id][`button_${i}`]||0);
            state[id][`button_${i}`] = gamepad.timestamp;
            dispatchEvent(new CustomEvent(config[buttonMap], {detail: {id, buttonId: i, time, value: gamepad.buttons[i]}}));
        }
    }
}

export function simulateTab(reverse = false) {
  const event = new KeyboardEvent("keydown", {
    key: "Tab",
    code: "Tab",
    keyCode: 9,
    shiftKey: reverse, // Shift+Tab for reverse navigation
    bubbles: true,
    cancelable: true
  });

  document.activeElement.dispatchEvent(event);

  // If default behavior wasn't prevented, manually move focus
  if (!event.defaultPrevented) {
    const focusableElements = Array.from(
      document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.disabled && el.offsetParent !== null);

    const currentIndex = focusableElements.indexOf(document.activeElement);
    const nextIndex = reverse
      ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
      : (currentIndex + 1) % focusableElements.length;

    focusableElements[nextIndex]?.focus();
  }
}














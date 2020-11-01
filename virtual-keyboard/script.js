// [0] - en
// [1] - ru
// [2] - shift en
// [3] - shift ru
const keyLayout = [
  ['§', 'ё', '±'],
  ['1', '1', '!', '!'],
  ['2', '2', '@', '"'],
  ['3', '3', '#', '№'],
  ['4', '4', '$', ';'],
  ['5', '5', '%', '%'],
  ['6', '6', '^', ':'],
  ['7', '7', '&', '?'],
  ['8', '8', '*', '*'],
  ['9', '9', '(', '('],
  ['0', '0', ')', ')'],
  ['backspace', 'backspace'],
  ['language', 'language'],
  ['q', 'й', 'q', 'й'],
  ['w', 'ц', 'w', 'ц'],
  ['e', 'у', 'e', 'у'],
  ['r', 'к', 'r', 'к'],
  ['t', 'е', 't', 'е'],
  ['y', 'н', 'y', 'н'],
  ['u', 'г', 'u', 'г'],
  ['i', 'ш', 'i', 'ш'],
  ['o', 'щ', 'o', 'щ'],
  ['p', 'з', 'p', 'з'],
  ['[', 'х', '{', 'х'],
  [']', 'ъ', '}', 'ъ'],
  ['capsLock', 'capsLock'],
  ['a', 'ф', 'a', 'ф'],
  ['s', 'ы', 's', 'ы'],
  ['d', 'в', 'd', 'в'],
  ['f', 'а', 'f', 'а'],
  ['g', 'п', 'g', 'п'],
  ['h', 'р', 'h', 'р'],
  ['j', 'о', 'j', 'о'],
  ['k', 'л', 'k', 'л'],
  ['l', 'д', 'l', 'д'],
  [';', 'ж', ';', 'ж'],
  ["'", 'э', '"', 'э'],
  ['\\', '\\', '|', '/'],

  ['shift', 'shift'],
  ['z', 'я', 'z', 'я'],
  ['x', 'ч', 'x', 'ч'],
  ['c', 'с', 'c', 'с'],
  ['v', 'м', 'v', 'м'],
  ['b', 'и', 'b', 'и'],
  ['n', 'т', 'n', 'т'],
  ['m', 'ь', 'm', 'ь'],
  [',', 'б', '<', 'б'],
  ['.', 'ю', '>', 'ю'],
  ['/', '.', '?', ','],
  ['enter', 'enter'],
  ['done', 'done'],
  ['sound', 'sound'],
  ['space', 'space'],
  ['arrowLeft', 'arrowLeft'],
  ['arrowRight', 'arrowRight'],
  ['speech', 'speech'],
];

const Keyboard = {
  elements: {
    main: null,
    textAreaInput: null,
    keysContainer: null,
    keys: [],
    recognition: null,
  },

  eventHandlers: {
    oninput: null,
    onclose: null,
  },

  properties: {
    value: '',
    capsLock: false,
    shift: false,
    ru: false,
    sound: false,
    speech: false,
  },

  init() {
    //Create main elements
    this.elements.main = document.createElement('div');
    this.elements.keysContainer = document.createElement('div');

    //Setup main elements
    this.elements.main.classList.add('keyboard', 'keyboard--hidden');
    this.elements.keysContainer.classList.add('keyboard__keys');
    this.elements.keysContainer.appendChild(this._createKeys());

    this.elements.keys = this.elements.keysContainer.querySelectorAll(
      '.keyboard__key'
    );

    //Add to DOM
    this.elements.main.appendChild(this.elements.keysContainer);
    document.body.appendChild(this.elements.main);

    //Automatically use keyboard for elements with .use-keyboard-input
    this.elements.textAreaInput = document.querySelector('.use-keyboard-input');
    this.elements.textAreaInput.addEventListener('focus', () => {
      this.open(
        this.elements.textAreaInput.value,
        (currentValue, selectionEnd = null) => {
          this.elements.textAreaInput.value = currentValue;
          this.elements.textAreaInput.focus();
          if (selectionEnd !== null)
            this.elements.textAreaInput.setSelectionRange(
              selectionEnd,
              selectionEnd
            );
        }
      );
    });

    this._addPhysicalKeyboard();
    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this._initSpeechRecognition();
  },

  _initSpeechRecognition() {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    this.elements.recognition = recognition;

    recognition.addEventListener('result', (e) => {
      this.elements.textAreaInput.focus();
      const transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');

      this.elements.textAreaInput.value = this.properties.value + transcript;

      if (e.results[0].isFinal) {
        this.properties.value += transcript;
        this._triggerEvent('oninput');
      }
    });

    recognition.addEventListener('end', () => {
      if (this.properties.speech) this.elements.recognition.start();
    });
  },

  _addPhysicalKeyboard() {
    const isKeyLayoutContainKey = (keyLayoutPair, keyEvent) =>
      keyLayoutPair[0].toLowerCase() === keyEvent.toLowerCase() ||
      keyLayoutPair[1].toLowerCase() === keyEvent.toLowerCase() ||
      (keyEvent === ' ' && keyLayoutPair[0] === 'space');

    document.addEventListener('keydown', (event) => {
      const indexKey = keyLayout.findIndex((key) =>
        isKeyLayoutContainKey(key, event.key)
      );

      if (indexKey !== -1) {
        this.elements.keys[indexKey].classList.add('keyboard__key-active');
        switch (event.key) {
          case 'CapsLock':
            this._toggleCapsLock();
            this.elements.keys[indexKey].classList.toggle(
              'keyboard__key--active',
              this.properties.capsLock
            );
            break;
          case 'Shift':
            this._toggleShift();
            this.elements.keys[indexKey].classList.toggle(
              'keyboard__key--active',
              this.properties.shift
            );
            break;
        }
      }
    });

    document.addEventListener('keyup', (event) => {
      const indexKey = keyLayout.findIndex((key) =>
        isKeyLayoutContainKey(key, event.key)
      );

      if (indexKey !== -1) {
        this.elements.keys[indexKey].classList.remove('keyboard__key-active');
        this.properties.value = this.elements.textAreaInput.value;
        this._triggerEvent('oninput');

        switch (event.key) {
          case 'CapsLock':
            this._toggleCapsLock();
            this.elements.keys[indexKey].classList.toggle(
              'keyboard__key--active',
              this.properties.capsLock
            );
            break;
          case 'Shift':
            this._toggleShift();
            this.elements.keys[indexKey].classList.toggle(
              'keyboard__key--active',
              this.properties.shift
            );
            break;
        }
      }
    });
  },

  _createKeys() {
    const fragment = document.createDocumentFragment();

    // Creates HTML for an icon
    const createIconHTML = (icon_name) => {
      return `<i class="material-icons">${icon_name}</i>`;
    };

    keyLayout.forEach((keys) => {
      const key = keys[0];
      const keyElement = document.createElement('button');
      const insertLineBreak =
        ['backspace', ']', '\\', 'enter'].indexOf(key) !== -1;

      //Add attributes/classes
      keyElement.setAttribute('type', 'button');
      keyElement.classList.add('keyboard__key');

      switch (key) {
        case 'backspace':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = createIconHTML('backspace');
          keyElement.addEventListener('click', () => {
            this._playMusic(key);
            let currentIndex = this.elements.textAreaInput.selectionStart;
            let range = this.elements.textAreaInput.selectionEnd - currentIndex;
            if (range === 0) {
              currentIndex -= 1;
              range = 1;
            }
            let currentValue = this.properties.value.split('');

            if (currentIndex >= 0) {
              currentValue.splice(currentIndex, range);
              this.properties.value = currentValue.join('');
              this._triggerEvent('oninput', currentIndex);
            }
          });
          break;
        case 'language':
          keyElement.classList.add('keyboard__key--wide');
          const languageElement = document.createElement('span');
          languageElement.innerText = '-en';
          languageElement.classList.add('key-language');

          keyElement.innerHTML = createIconHTML('language');
          keyElement.appendChild(languageElement);
          keyElement.addEventListener('click', (e) => {
            this._changeLanguage();
            if (this.properties.ru) {
              this.elements.recognition.lang = 'ru-RU';
              e.currentTarget.lastElementChild.innerText = '-ru';
            } else {
              this.elements.recognition.lang = 'en-US';
              e.currentTarget.lastElementChild.innerText = '-en';
            }
          });
          break;
        case 'capsLock':
          keyElement.classList.add(
            'keyboard__key--wide',
            'keyboard__key--activatable'
          );
          keyElement.innerHTML = createIconHTML('keyboard_capslock');
          keyElement.addEventListener('click', () => {
            this._playMusic(key);
            this._toggleCapsLock();
            keyElement.classList.toggle(
              'keyboard__key--active',
              this.properties.capsLock
            );
          });
          break;
        case 'shift':
          keyElement.classList.add(
            'keyboard__key--wide',
            'keyboard__key--activatable'
          );
          keyElement.innerHTML = createIconHTML('keyboard_arrow_up');
          keyElement.addEventListener('click', () => {
            this._playMusic(key);
            this._toggleShift();
            keyElement.classList.toggle(
              'keyboard__key--active',
              this.properties.shift
            );
          });
          break;
        case 'enter':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = createIconHTML('keyboard_return');
          keyElement.addEventListener('click', () => {
            this._playMusic(key);
            const currentIndex = this.elements.textAreaInput.selectionStart;
            let currentValue = this.properties.value.split('');

            if (currentIndex >= 0) {
              currentValue.splice(currentIndex, 0, '\n');
              this.properties.value = currentValue.join('');
              this._triggerEvent('oninput', currentIndex + 1);
            }
          });
          break;
        case 'space':
          keyElement.classList.add('keyboard__key--extra-wide');
          keyElement.innerHTML = createIconHTML('space_bar');
          keyElement.addEventListener('click', () => {
            const currentIndex = this.elements.textAreaInput.selectionStart;
            let currentValue = this.properties.value.split('');

            if (currentIndex >= 0) {
              currentValue.splice(currentIndex, 0, ' ');
              this.properties.value = currentValue.join('');
              this._triggerEvent('oninput', currentIndex + 1);
            }
          });
          break;
        case 'done':
          keyElement.classList.add(
            'keyboard__key--wide',
            'keyboard__key--dark'
          );
          keyElement.innerHTML = createIconHTML('keyboard_hide');
          keyElement.addEventListener('click', () => {
            this.close();
            this._triggerEvent('onclose');
          });
          break;
        case 'arrowLeft':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = createIconHTML('keyboard_arrow_left');
          keyElement.addEventListener('click', () => {
            const currentIndex = this.elements.textAreaInput.selectionStart;
            if (currentIndex > 0) {
              this._triggerEvent('oninput', currentIndex - 1);
            } else {
              this._triggerEvent('oninput', currentIndex);
            }
          });
          break;
        case 'arrowRight':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = createIconHTML('keyboard_arrow_right');
          keyElement.addEventListener('click', () => {
            const currentIndex = this.elements.textAreaInput.selectionEnd;
            if (currentIndex < this.elements.textAreaInput.value.length) {
              this._triggerEvent('oninput', currentIndex + 1);
            } else {
              this._triggerEvent('oninput', currentIndex);
            }
          });
          break;
        case 'sound':
          keyElement.classList.add(
            'keyboard__key--wide',
            'keyboard__key--activatable'
          );
          keyElement.innerHTML = createIconHTML('audiotrack');
          keyElement.addEventListener('click', () => {
            this.properties.sound = !this.properties.sound;
            keyElement.classList.toggle(
              'keyboard__key--active',
              this.properties.sound
            );
          });
          break;
        case 'speech':
          keyElement.classList.add(
            'keyboard__key--wide',
            'keyboard__key--activatable'
          );
          keyElement.innerHTML = createIconHTML('mic');
          keyElement.addEventListener('click', () => {
            this._toggleSpeechRecognition();
            keyElement.classList.toggle(
              'keyboard__key--active',
              this.properties.speech
            );
          });
          break;
        default:
          keyElement.textContent = key.toLowerCase();
          keyElement.addEventListener('click', () => {
            if (this.properties.ru) this._playMusic('ru');
            else this._playMusic('en');

            const currentIndex = this.elements.textAreaInput.selectionStart;
            let currentValue = this.properties.value.split('');

            if (currentIndex >= 0) {
              currentValue.splice(currentIndex, 0, keyElement.textContent);
              this.properties.value = currentValue.join('');
              this._triggerEvent('oninput', currentIndex + 1);
            }
          });
          break;
      }

      fragment.appendChild(keyElement);

      if (insertLineBreak) {
        fragment.appendChild(document.createElement('br'));
      }
    });

    return fragment;
  },

  _playMusic(source) {
    if (!this.properties.sound) return;
    const audio = document.querySelector(`audio[data-key="${source}"]`);
    audio.currentTime = 0;
    audio.play();
  },

  _triggerEvent(handlerName, additionalProperty = null) {
    if (typeof this.eventHandlers[handlerName] == 'function') {
      this.eventHandlers[handlerName](
        this.properties.value,
        additionalProperty
      );
    }
  },

  _isUpperCase() {
    return this.properties.capsLock !== this.properties.shift;
  },

  _updateKeys() {
    let updateMode = 0;
    if (this.properties.ru && !this.properties.shift) updateMode = 1;
    else if (!this.properties.ru && this.properties.shift) updateMode = 2;
    else if (this.properties.ru && this.properties.shift) updateMode = 3;

    this.elements.keys.forEach((key, index) => {
      if (key.childElementCount === 0) {
        if (keyLayout[index][updateMode] !== undefined) {
          key.textContent = keyLayout[index][updateMode];
        }
        key.textContent = this._isUpperCase()
          ? key.textContent.toUpperCase()
          : key.textContent.toLowerCase();
      }
    });
  },

  _changeLanguage() {
    this.properties.ru = !this.properties.ru;
    this._updateKeys();
  },

  _toggleSpeechRecognition() {
    this.properties.speech = !this.properties.speech;
    if (this.properties.speech) this.elements.recognition.start();
    else this.elements.recognition.stop();
  },

  _toggleCapsLock() {
    this.properties.capsLock = !this.properties.capsLock;
    this._updateKeys();
  },

  _toggleShift() {
    this.properties.shift = !this.properties.shift;
    this._updateKeys();
  },

  open(initialValue, oninput, onclose) {
    this.properties.value = initialValue || '';
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.remove('keyboard--hidden');
  },

  close() {
    this.properties.value = '';
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.add('keyboard--hidden');
  },
};

window.addEventListener('DOMContentLoaded', function () {
  Keyboard.init();
});

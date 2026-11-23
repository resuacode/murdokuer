// Idioma de la interfaz: gallego por defecto, elegible desde la barra superior,
// recordado en el navegador y transmisible con ?lang= en los enlaces de cada caso.
import { DEFAULT_LOCALE, LOCALES, LOCALE_ORDER, dictionary } from './content.js';

export { DEFAULT_LOCALE, LOCALES, LOCALE_ORDER } from './content.js';

const STORAGE_KEY = 'murdokuer:idioma';

function readStored() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function store(code) {
  try { localStorage.setItem(STORAGE_KEY, code); } catch { /* sin almacenamiento */ }
}

function initialLocale() {
  const fromUrl = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('lang') : null;
  if (LOCALES[fromUrl]) {
    store(fromUrl);
    return fromUrl;
  }
  const stored = readStored();
  return LOCALES[stored] ? stored : DEFAULT_LOCALE;
}

let current = initialLocale();
const listeners = new Set();

export const locale = () => current;
export const dict = () => dictionary(current);

export function t(key, ...args) {
  const value = dictionary(current).ui[key] ?? LOCALES[DEFAULT_LOCALE].ui[key];
  if (value === undefined) {
    console.warn(`Falta la traducción: ${key}`);
    return key;
  }
  return typeof value === 'function' ? value(...args) : value;
}

// Aplica los textos de los elementos marcados en el HTML:
// data-i18n (texto), data-i18n-html (marcado propio de los diccionarios) y
// data-i18n-attr="aria-label:clave; title:clave".
export function translateDocument(root = document) {
  document.documentElement.lang = dictionary(current).htmlLang;
  for (const element of root.querySelectorAll('[data-i18n]')) element.textContent = t(element.dataset.i18n);
  for (const element of root.querySelectorAll('[data-i18n-html]')) element.innerHTML = t(element.dataset.i18nHtml);
  for (const element of root.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of element.dataset.i18nAttr.split(';')) {
      const [attribute, key] = pair.split(':').map((part) => part.trim());
      if (attribute && key) element.setAttribute(attribute, t(key));
    }
  }
}

export function onLocaleChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setLocale(code) {
  if (!LOCALES[code] || code === current) return;
  current = code;
  store(code);
  // Si la dirección lleva ?lang=, se mantiene coherente con la elección.
  const url = new URL(location.href);
  if (url.searchParams.has('lang')) {
    url.searchParams.set('lang', code);
    history.replaceState(history.state, '', url);
  }
  translateDocument();
  for (const listener of listeners) listener(code);
}

// Desplegable de idioma: cada opción aparece con su nombre en su propia lengua.
export function mountLanguagePicker(container) {
  const label = document.createElement('label');
  label.className = 'language-picker';
  const caption = document.createElement('span');
  caption.className = 'visually-hidden';
  caption.dataset.i18n = 'language';
  caption.textContent = t('language');
  const icon = document.createElement('span');
  icon.className = 'language-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '🌐';
  const select = document.createElement('select');
  select.id = 'language-select';
  for (const code of LOCALE_ORDER) {
    const option = document.createElement('option');
    option.value = code;
    option.lang = LOCALES[code].htmlLang;
    option.textContent = LOCALES[code].nativeName;
    select.append(option);
  }
  select.value = current;
  select.addEventListener('change', () => setLocale(select.value));
  onLocaleChange((code) => { select.value = code; });
  label.append(caption, icon, select);
  container.append(label);
  return select;
}

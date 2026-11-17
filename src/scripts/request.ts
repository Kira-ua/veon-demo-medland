// "Сторінка складає запит за вас": the plus buttons in #napryamy fill the letter in #pidbir.
// Copy is real (Clipboard API); without it the letter text is selected for manual copying. Nothing is sent anywhere.
import { contacts, letterText } from "../data/site";

const KEY = "medland-request";
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button[data-dir]"));
const order = buttons.map((b) => b.dataset.dir ?? "");
const dirsEl = document.querySelector<HTMLElement>("[data-letter-dirs]");
const emptyHtml = dirsEl?.innerHTML ?? "";
const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-req-count]"));
const counterNums = Array.from(document.querySelectorAll<HTMLElement>("[data-req-n]"));
const mail = document.querySelector<HTMLAnchorElement>("[data-mail]");
const status = document.querySelector<HTMLElement>("[data-copy-status]");
const copyBtn = document.querySelector<HTMLButtonElement>("[data-copy]");
const copyLabel = document.querySelector<HTMLElement>("[data-copy-label]");
const letter = document.querySelector<HTMLElement>("[data-letter]");

let selected: string[] = [];
try {
  const saved = JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
  if (Array.isArray(saved)) selected = saved.filter((s): s is string => typeof s === "string" && order.includes(s));
} catch { /* storage unavailable: start empty */ }

function render(added?: string) {
  const sorted = order.filter((d) => selected.includes(d));
  for (const b of buttons) {
    const on = selected.includes(b.dataset.dir ?? "");
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", `${on ? "Прибрати із запиту" : "Додати до запиту"}: ${b.dataset.dir}`);
    b.closest("li")?.classList.toggle("is-on", on);
  }
  if (dirsEl) {
    if (!sorted.length) dirsEl.innerHTML = emptyHtml;
    else {
      dirsEl.textContent = "";
      sorted.forEach((d, i) => {
        const s = document.createElement("span");
        s.className = "dir" + (d === added && !reduce ? " is-new" : "");
        s.textContent = d;
        dirsEl.append(s);
        if (i < sorted.length - 1) dirsEl.append(", ");
      });
    }
  }
  for (const c of counters) c.hidden = sorted.length === 0;
  for (const n of counterNums) {
    n.textContent = String(sorted.length);
    if (added !== undefined && !reduce) {
      n.classList.remove("is-bump");
      void n.offsetWidth;
      n.classList.add("is-bump");
    }
  }
  if (mail) {
    const q = `?subject=${encodeURIComponent("Запит на підбір обладнання")}&body=${encodeURIComponent(letterText(sorted))}`;
    mail.href = contacts.emailHref + q;
  }
  try { sessionStorage.setItem(KEY, JSON.stringify(sorted)); } catch { /* ignore */ }
}

for (const b of buttons) {
  b.addEventListener("click", () => {
    const d = b.dataset.dir ?? "";
    const on = selected.includes(d);
    selected = on ? selected.filter((s) => s !== d) : [...selected, d];
    render(on ? "" : d);
  });
}

function say(text: string) {
  if (status) status.textContent = text;
}

function selectLetter() {
  if (!letter) return;
  const range = document.createRange();
  range.selectNodeContents(letter);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
  letter.classList.add("is-selected");
}

async function copy(): Promise<boolean> {
  const text = letterText(order.filter((d) => selected.includes(d)));
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error("no clipboard");
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    selectLetter();
    say("Скопіюйте текст вручну: він виділений у листі зліва.");
    return false;
  }
}

let timer = 0;
copyBtn?.addEventListener("click", async () => {
  if (await copy()) {
    if (copyLabel) copyLabel.textContent = "Скопійовано ✓";
    say("Запит скопійовано. Вставте його в Telegram, Viber або e-mail.");
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (copyLabel) copyLabel.textContent = "Скопіювати запит";
    }, 2500);
  }
});

// Telegram and Viber cannot be prefilled: copy the letter first, then the link opens the chat as usual.
for (const a of document.querySelectorAll<HTMLAnchorElement>("[data-copy-open]")) {
  a.addEventListener("click", () => {
    void copy().then((ok) => { if (ok) say("Запит скопійовано: вставте його в чат."); });
  });
}

render();

// Facts for the MedLand homepage. Source: veon/client.json, veon/client-digest.md, ux/demo-home.md, design/concept.md.
// Nothing here may be invented: no numbers, reviews, certificates or prices.

export const SOON = "Розділ у розробці";

const address = "м. Одеса, вул. Боровського 1/16";

export const contacts = {
  phoneText: "+38 (098) 300-60-90",
  phoneHref: "tel:+380983006090",
  email: "medland.magazin@gmail.com",
  emailHref: "mailto:medland.magazin@gmail.com",
  telegram: "https://t.me/medland_olena",
  viber: "viber://chat?number=%2B380983006090",
  address,
  map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  hours: "Пн–Пт 10:00–17:00",
  weekend: "Сб–Нд вихідні",
  city: "м. Одеса",
};

export interface Direction {
  id: string;
  name: string;
  examples: string;
}

// 9 main directions (W-F006) with examples from company.business_lines.
export const directions: Direction[] = [
  { id: "napryam-endoskopiya", name: "Ендоскопічне обладнання", examples: "відеоендоскопічні системи, гнучкі ендоскопи, гнучкі цистоскопи, уретероскопи" },
  { id: "napryam-reanimatsiya", name: "Реанімаційне обладнання", examples: "апарати ШВЛ, дефібрилятори, монітори пацієнта, інфузійні насоси, наркозні апарати, білірубінометри" },
  { id: "napryam-khirurhiya", name: "Хірургічне обладнання", examples: "операційні столи, коагулятори, інсуфлятори" },
  { id: "napryam-lazerna-khirurhiya", name: "Лазерна хірургія", examples: "" },
  { id: "napryam-kardiolohiya", name: "Кардіологія", examples: "електрокардіографи" },
  { id: "napryam-medychne-svitlo", name: "Медичне світло", examples: "освітлювальна техніка" },
  { id: "napryam-lor", name: "ЛОР‑обладнання", examples: "отоскопи, ЛОР-ендоскопи, крісла пацієнта, ЛОР-комбайни" },
  { id: "napryam-laryngoskopy", name: "Ларингоскопи та відеоларингоскопи", examples: "" },
  { id: "napryam-oftalmolohiya", name: "Офтальмологія", examples: "" },
];

// "Також у каталозі" — the rest of the client's catalogue menu (ux/demo-home.md §5).
export const moreDirections = [
  "Урологічне обладнання",
  "Обладнання для неонатології",
  "Ортопедія і травматологія",
  "Іммобілізація",
  "Стоматологічне обладнання",
  "Фізіотерапія",
  "Лабораторне обладнання",
  "Стерилізація",
  "Голкоспалювачі",
  "Компресори",
  "Спірометри",
  "Термометри",
  "Медичні меблі",
  "Засоби захисту",
];

// W-F007; BEYOND is left out (brand page without products).
export const brands = ["Heaco", "Innovex", "Weseemed", "SAIKANG", "Cyber Force", "Invita", "BIOMED"];

export const letterFields = [
  "Заклад / спеціалізація",
  "Кількість",
  "Орієнтовний бюджет",
  "Місто доставки",
];

export const letterGreeting = "Добрий день! Потрібен підбір обладнання.";
export const letterEmpty = "відмітьте «+» у списку вище або напишіть у повідомленні";
export const letterInvoice = "Потрібен рахунок на заклад: так / ні";

export function letterText(selected: string[]): string {
  return [
    letterGreeting,
    `Напрями: ${selected.length ? selected.join(", ") : "…"}`,
    ...letterFields.map((f) => `${f}: …`),
    letterInvoice,
  ].join("\n");
}

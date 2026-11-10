import type { ArcTypeId, ConsoleSet, ElementId, ReactionId, RoleId } from "./types"

export const ELEMENTS: { id: ElementId; name: string; hint: string }[] = [
  { id: "cosmos", name: "Космос", hint: "Соседствует с Анимой и Лакшаной" },
  { id: "anima", name: "Анима", hint: "Соседствует с Космосом и Чарами" },
  { id: "incantation", name: "Чары", hint: "Соседствует с Анимой и Хаосом" },
  { id: "chaos", name: "Хаос", hint: "Соседствует с Чарами и Психеей" },
  { id: "psyche", name: "Психея", hint: "Соседствует с Хаосом и Лакшаной" },
  { id: "lakshana", name: "Лакшана", hint: "Соседствует с Психеей и Космосом" },
]

export const RING: ElementId[] = [
  "cosmos",
  "anima",
  "incantation",
  "chaos",
  "psyche",
  "lakshana",
]

export const ROLES: { id: RoleId; name: string; about: string }[] = [
  {
    id: "dps",
    name: "Урон",
    about: "Основной или дополнительный урон. В игре это ближе к роли Damage: персонаж, ради которого крутится окно на поле или который добивает из свапа.",
  },
  {
    id: "support",
    name: "Поддержка",
    about: "Атака отряда, контроль, энергия, группировка. Бафф часто живёт и когда персонаж уже ушёл с поля.",
  },
  {
    id: "survival",
    name: "Выживание",
    about: "Щит, лечение или перенос урона. На рельсах с боссом этот слот чаще нужен, чем в толпе.",
  },
]

export const ARC_TYPES: { id: ArcTypeId; name: string; about: string }[] = [
  {
    id: "plasma",
    name: "Плазма",
    about: "Агрессивные дуги под прямой урон и критические удары.",
  },
  {
    id: "solid",
    name: "Твёрдая",
    about: "Универсальные дуги: атака, урон по боссам, длинный бой.",
  },
  {
    id: "gas",
    name: "Газ",
    about: "Поддержка и утилита: баффы отряда, уклонение, ослабления.",
  },
  {
    id: "liquid",
    name: "Жидкая",
    about: "Пробитие, периодический урон, энергия и затяжной урон.",
  },
  {
    id: "synthesis",
    name: "Синтез",
    about: "Защита, здоровье, щиты и лечение.",
  },
]

export interface ReactionDef {
  id: ReactionId
  name: string
  kind: "duo" | "trio"
  elements: ElementId[]
  effect: string
  use: string
}

export const REACTIONS: ReactionDef[] = [
  {
    id: "blossom",
    name: "Цветение",
    kind: "duo",
    elements: ["cosmos", "anima"],
    effect:
      "Появляется бутон. Он выпускает тычинки, которые сами летят в цели и бьют по площади. Одновременно держатся несколько бутонов.",
    use: "Фоновый урон и деталь тройной реакции «Заряд».",
  },
  {
    id: "hexed",
    name: "Проклятие",
    kind: "duo",
    elements: ["anima", "incantation"],
    effect:
      "Дополнительный удар от урона Анимы и Чар, который цель уже получила за последние секунды.",
    use: "Сильнее после длинной серии, а не с первого касания.",
  },
  {
    id: "scorch",
    name: "Ожог",
    kind: "duo",
    elements: ["incantation", "chaos"],
    effect: "Горение примерно на 15 секунд. Долгое окно, в которое удобно вкладывать другие реакции.",
    use: "Периодический урон и половина «Раздора».",
  },
  {
    id: "nova",
    name: "Нова",
    kind: "duo",
    elements: ["chaos", "psyche"],
    effect: "Метка примерно на 5 секунд, затем сильный психический взрыв.",
    use: "Короткое окно урона и вторая половина «Раздора».",
  },
  {
    id: "stain",
    name: "Пятно",
    kind: "duo",
    elements: ["psyche", "lakshana"],
    effect: "Цель некоторое время получает больше урона Психеи и Лакшаны.",
    use: "Окно под взрыв лакшанского или психического урона.",
  },
  {
    id: "remora",
    name: "Ремора",
    kind: "duo",
    elements: ["lakshana", "cosmos"],
    effect:
      "Цель замедляется в движении и атаке. Эффект спадает и при повторных наложениях держится слабее.",
    use: "Контроль толпы и условие «Заряда». У части лакшанских персонажей свои усиления именно от Реморы.",
  },
  {
    id: "charge",
    name: "Заряд",
    kind: "trio",
    elements: ["cosmos", "anima", "lakshana"],
    effect:
      "Тычинка Цветения попадает в цель под Реморой и даёт активному персонажу энергию ульты.",
    use: "Длинный бой, где ульты нужно крутить часто. Удобно и в толпе, и на затяжном боссе.",
  },
  {
    id: "discord",
    name: "Раздор",
    kind: "trio",
    elements: ["incantation", "chaos", "psyche"],
    effect:
      "Ожог и Нова висят вместе. С цели снимается часть шкалы пробития — быстрый путь к сломанному состоянию.",
    use: "Боссы со шкалой пробития. Сначала долгое горение, затем Нова, пока Ожог ещё жив.",
  },
]

export const CONSOLES: ConsoleSet[] = [
  {
    id: "devils-blood",
    name: "Devil's Blood: Curse",
    nameRu: "Дьявольская кровь",
    role: "Урон, Психея",
    two: "Урон Психеи +10%.",
    four: "Урон +18%, а по целям под Новой или Пятном бонус растёт до +36%.",
    bestFor: ["fadia", "haniel", "aurelia", "blackbird"],
  },
  {
    id: "lost-radiance",
    name: "Lost Radiance",
    nameRu: "Утраченное сияние",
    role: "Урон, Космос",
    two: "Урон Космоса +10%.",
    four: "После ульты 20 секунд игнорирует 25% защиты. Эффект не складывается.",
    bestFor: ["esper-zero", "chiz", "shinku", "hotori"],
  },
  {
    id: "speedy-hedgehog",
    name: "Speedy Hedgehog",
    nameRu: "Быстрый ёж",
    role: "Поддержка",
    two: "Эффективность заряда +12%.",
    four: "После ульты носителя весь отряд на 20 секунд получает +15% атаки. От нескольких носителей не складывается.",
    bestFor: ["sakiri", "haniel", "iroi", "esper-zero"],
  },
  {
    id: "fireflies",
    name: "Fireflies and the Forest",
    nameRu: "Светлячки и лес",
    role: "Урон, Анима",
    two: "Урон Анимы +10%.",
    four: "До 7 стаков крит. урона по +8%, когда рядом получают урон Анимы. Стак 10 секунд, работает и вне поля.",
    bestFor: ["nanally", "jiuyuan", "mint"],
  },
  {
    id: "street-boxer",
    name: "Street Boxer",
    nameRu: "Уличный боксёр",
    role: "Урон, Лакшана",
    two: "Урон Лакшаны +10%.",
    four: "Крит. шанс +14%. Если отряд вызвал Ремору или Пятно, ещё +14% крит. шанса на 20 секунд.",
    bestFor: ["akane-rin", "hathor", "chaos", "skia"],
  },
  {
    id: "shadow-creed",
    name: "Shadow Creed",
    nameRu: "Теневой завет",
    role: "Универсальная атака",
    two: "Атака +10%.",
    four: "После навыка +25% атаки на 20 секунд. Не складывается.",
    bestFor: ["hathor", "mint", "jiuyuan"],
  },
  {
    id: "crimson-butterflies",
    name: "Crimson: Twin Butterflies",
    nameRu: "Багровые бабочки",
    role: "Урон, Чары",
    two: "Урон Чар +10%.",
    four: "До 6 стаков атаки по +6%, когда рядом получают урон Чар. Стак 10 секунд, работает вне поля.",
    bestFor: ["baicang", "zankou", "sakiri"],
  },
  {
    id: "diabolos",
    name: "Diabolos",
    nameRu: "Диаболос",
    role: "Урон, Хаос",
    two: "Урон Хаоса +10%.",
    four: "Игнор 12% сопротивления Хаосу. После участия в Нове или Ожоге игнор растёт до 24% на 20 секунд.",
    bestFor: ["lacrimosa", "daffodill"],
  },
  {
    id: "kingdoms-guard",
    name: "Kingdom's Guard",
    nameRu: "Стража королевства",
    role: "Щит",
    two: "Защита +15%.",
    four: "Прочность щитов +20%.",
    bestFor: ["adler", "fadia"],
  },
  {
    id: "tiny-adventure",
    name: "Tiny Big Adventure",
    nameRu: "Маленькое большое приключение",
    role: "Запас здоровья",
    two: null,
    four: "До 10 стаков +4% макс. здоровья за полученный удар, стак 10 секунд. Ульта сразу даёт 10 стаков. Эффект двух частей в открытой выгрузке не найден.",
    bestFor: ["fadia", "adler"],
  },
  {
    id: "quiet-manor",
    name: "Quiet Manor",
    nameRu: "Тихая усадьба",
    role: "Психический урон",
    two: "Психический урон +10%.",
    four: "До 3 стаков +12% психического урона за базовую атаку, стак 6 секунд.",
    bestFor: ["aurelia", "blackbird"],
  },
  {
    id: "theas-tavern",
    name: "Thea's Night Tavern",
    nameRu: "Ночная таверна Теи",
    role: "Лечение",
    two: "Здоровье +10%.",
    four: "Бонус лечения +20%.",
    bestFor: ["edgar", "iroi", "haniel"],
  },
]

export function elementName(id: ElementId): string {
  return ELEMENTS.find((e) => e.id === id)?.name ?? id
}

export function roleName(id: RoleId): string {
  return ROLES.find((r) => r.id === id)?.name ?? id
}

export function arcTypeName(id: ArcTypeId): string {
  return ARC_TYPES.find((a) => a.id === id)?.name ?? id
}

export function adjacent(a: ElementId, b: ElementId): boolean {
  const i = RING.indexOf(a)
  const j = RING.indexOf(b)
  const d = Math.abs(i - j)
  return d === 1 || d === 5
}

export type ElementId =
  | "cosmos"
  | "anima"
  | "incantation"
  | "chaos"
  | "psyche"
  | "lakshana"

export type ArcTypeId = "plasma" | "solid" | "gas" | "liquid" | "synthesis"

export type RoleId = "dps" | "support" | "survival"

export type Rarity = "S" | "A" | "B"

/**
 * Форма боя. Это не тир и не место в чужом списке.
 * Площадь, окно по одной цели, пробитие, свой периодический урон, сбор, лечение или щит, баф атаки, энергия отряда.
 */
export type Tag =
  | "aoe"
  | "boss"
  | "break"
  | "sustain"
  | "buffer"
  | "energy"
  | "dot"
  | "group"

/**
 * Особые правила четвёрки. Заполняется у нового персонажа вместе с тегами.
 * Пустой объект значит: персонаж сверен, отдельных правил нет.
 */
export interface Kit {
  /** Долго занимает поле. В одной четвёрке такой персонаж один. */
  field?: boolean
  /** Навык сразу заполняет шкалу цикла. */
  instant?: boolean
  /** Записывает чужой навык и повторяет его. */
  copy?: boolean
  /** Урон или энергия завязаны на Заряд с каждого попадания тычинок. */
  perHit?: boolean
  /** extend держит Ремору дольше, refresh вешает её заново. */
  remora?: "extend" | "refresh"
  /** Какая Ремора нужна его окну урона. */
  wantsRemora?: "extend" | "refresh"
  /** Усиление цикла растёт от числа чужих периодических уронов в четвёрке. */
  scalesWithDots?: boolean
}

export type ReactionId =
  | "blossom"
  | "hexed"
  | "scorch"
  | "nova"
  | "stain"
  | "remora"
  | "charge"
  | "discord"

/** Пассивка «усиление цикла»: работает от присутствия в четвёрке, даже при повторной стихии. */
export interface CycleEnhancement {
  reaction: ReactionId
  effect: string
  /** Насколько это усиление двигает выбор команды. Не множитель урона из клиента. */
  power: number
  /** Усиление не считается, пока в четвёрке нет пробития. */
  requiresBreak?: boolean
  /** Это усиление выключает Заряд с тычинок. Штраф, если в четвёрке есть perHit. */
  blocksPerHit?: boolean
}

export interface Awakening {
  level: number
  name: string
  effect: string
}

export interface Character {
  id: string
  name: string
  nameEn: string
  rarity: Rarity
  element: ElementId
  arcType: ArcTypeId
  /** false — тип дуги в открытых источниках расходится, в карточке это помечено */
  arcCertain: boolean
  role: RoleId
  status: "playable" | "soon"
  /** Внутренний вес для сортировки команд. Это не официальный тир урона. */
  weight: number
  summary: string
  traits: string[]
  tags: Tag[]
  /** Особые правила. Пустой объект — правила сверены, отдельных нет. */
  kit: Kit
  /** Усиления цикла. У части персонажей их больше одного. */
  cycles?: CycleEnhancement[]
  consoles: string[]
  arcs: string[]
  awakenings: Awakening[]
  /** Порядок прокачки, если он разобран в гайде. Иначе карточка показывает уровни как есть. */
  awakeningOrder?: number[]
}

export interface ArcWeapon {
  id: string
  name: string
  rarity: Rarity
  type: ArcTypeId
  atk: number
  substat: string
  effect: string
  forIds: string[]
}

export interface ConsoleSet {
  id: string
  name: string
  nameRu: string
  role: string
  two: string | null
  four: string | null
  bestFor: string[]
}

export interface MetaTeam {
  id: string
  title: string
  members: string[]
  blurb: string
}

export type FloorKind = "boss" | "mob"

export interface SuggestContext {
  floor: FloorKind | "general"
  boosted: ElementId[]
  onlyOwned: boolean
  owned: ReadonlySet<string>
}

export interface TeamPick {
  members: string[]
  score: number
  reasons: string[]
  reactions: string[]
  missing: string[]
}

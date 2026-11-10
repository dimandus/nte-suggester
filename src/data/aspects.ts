import type { Character, Tag } from "./types"

const TAG_LABEL: Record<Tag, string> = {
  aoe: "Площадь",
  boss: "Окно по одной цели",
  break: "Пробитие",
  dot: "Свой периодический урон",
  group: "Сбор",
  sustain: "Лечение или щит",
  buffer: "Баф атаки",
  energy: "Энергия отряда",
}

/** Человеческий список того, как персонаж стоит в четвёрке. Пустые правила не печатаются. */
export function aspectLines(character: Character): string[] {
  const lines = character.tags.map((tag) => TAG_LABEL[tag])
  const kit = character.kit
  if (kit.field) lines.push("Долго стоит на поле")
  if (kit.instant) lines.push("Навык сразу заполняет шкалу цикла")
  if (kit.copy) lines.push("Записывает и повторяет чужой навык")
  if (kit.perHit) lines.push("Кормится Зарядом с каждого попадания тычинок")
  if (kit.remora === "extend") lines.push("Держит Ремору дольше")
  if (kit.remora === "refresh") lines.push("Вешает Ремору заново")
  if (kit.wantsRemora === "extend") lines.push("Окну нужна долгая Ремора")
  if (kit.wantsRemora === "refresh") lines.push("Окну нужна Ремора, которую обновляют")
  if (kit.scalesWithDots) lines.push("Сильнее от чужого периодического урона")
  return lines
}

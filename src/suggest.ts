import { CHARACTERS, characterById } from "./data/characters"
import { META_TEAMS } from "./data/meta"
import { REACTIONS, adjacent, elementName } from "./data/game"
import type { Character, ElementId, FloorKind, SuggestContext, TeamPick } from "./data/types"

const ROLE_LABEL = { dps: "урон", support: "поддержка", survival: "выживание" }

function hasAll(elements: ElementId[], need: ElementId[]): boolean {
  return need.every((n) => elements.includes(n))
}

export function teamReactions(members: Character[]): string[] {
  const elements = [...new Set(members.map((m) => m.element))]
  return REACTIONS.filter((r) => hasAll(elements, r.elements)).map((r) => r.name)
}

function pairs(members: Character[]): number {
  let n = 0
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      if (adjacent(members[i].element, members[j].element)) n += 1
    }
  }
  return n
}

export function evaluate(ids: string[], ctx: SuggestContext): TeamPick {
  const members = ids
    .map((id) => characterById(id))
    .filter((c): c is Character => Boolean(c))
  const reasons: string[] = []
  let score = 0

  for (const m of members) score += m.weight

  const reactions = teamReactions(members)
  const duos = reactions.filter((name) => name !== "Заряд" && name !== "Раздор")
  const trios = reactions.filter((name) => name === "Заряд" || name === "Раздор")
  score += duos.length * 14 + trios.length * 28
  if (duos.length) reasons.push(`Реакции: ${reactions.join(", ")}.`)
  else reasons.push("Соседних стихий нет, циклы почти не запускаются.")

  if (ctx.floor === "boss" && reactions.includes("Раздор")) {
    score += 18
    reasons.push("Раздор быстрее снимает шкалу пробития босса.")
  }
  if (ctx.floor === "mob" && reactions.includes("Заряд")) {
    score += 16
    reasons.push("Заряд в толпе чаще кормит ульты.")
  }
  if (ctx.floor === "boss" && reactions.includes("Заряд")) score += 8

  const tagBonus = (tag: Character["tags"][number], each: number) => {
    const n = members.filter((m) => m.tags.includes(tag)).length
    score += n * each
    return n
  }
  if (ctx.floor === "boss") {
    tagBonus("boss", 5)
    if (tagBonus("break", 8)) reasons.push("В отряде есть пробитие.")
  }
  if (ctx.floor === "mob") {
    if (tagBonus("aoe", 7)) reasons.push("Есть площадные наборы под толпу.")
    tagBonus("group", 6)
  }
  if (ctx.floor !== "mob") tagBonus("dot", ctx.floor === "boss" ? 4 : 2)

  const boosted = ctx.boosted
  if (boosted.length) {
    const hit = members.filter((m) => boosted.includes(m.element))
    score += hit.length * 16
    const covered = boosted.filter((e) => members.some((m) => m.element === e))
    if (covered.length === boosted.length) {
      score += 20
      reasons.push(`Усиленные стихии закрыты: ${covered.map(elementName).join(" и ")}.`)
    } else if (covered.length === 0) {
      score -= 18
      reasons.push("Ни одна усиленная стихия этажа не закрыта.")
    } else {
      score += 6
      reasons.push(`Из усиленных стихий есть только ${covered.map(elementName).join(", ")}.`)
    }
  }

  const dps = members.filter((m) => m.role === "dps").length
  const support = members.filter((m) => m.role === "support").length
  const survival = members.filter((m) => m.role === "survival").length
  if (dps === 0) {
    score -= 50
    reasons.push("Нет персонажа урона.")
  }
  if (support) score += 10
  if (survival) score += ctx.floor === "boss" ? 14 : 6
  if (survival > 1) score -= 8
  if (ctx.floor === "boss" && survival === 0 && support === 0) {
    reasons.push("На боссе нет ни живучести, ни буфера — отряд хрупкий.")
    score -= 6
  }

  const carries = members.filter((member) => member.kit.field)
  if (carries.length > 1) {
    score -= 70 * (carries.length - 1)
    reasons.push(`На поле помещается один: ${carries.map((member) => member.name).join(" и ")} мешают друг другу.`)
  } else if (carries.length === 1) {
    reasons.push(`На поле: ${carries[0].name}.`)
  }

  const active = new Set(
    REACTIONS.filter((reaction) => hasAll([...new Set(members.map((m) => m.element))], reaction.elements)).map(
      (reaction) => reaction.id,
    ),
  )
  const enhancers = new Map<string, string[]>()
  for (const member of members) {
    for (const enhancement of member.cycles ?? []) {
      if (!active.has(enhancement.reaction)) continue
      if (enhancement.requiresBreak && !members.some((mate) => mate.id !== member.id && mate.tags.includes("break"))) {
        reasons.push(`«${REACTIONS.find((reaction) => reaction.id === enhancement.reaction)?.name ?? enhancement.reaction}» у ${member.name} бьёт по уже сломанной цели, а пробития в четвёрке нет.`)
        continue
      }
      if (enhancement.blocksPerHit && members.some((mate) => mate.kit.perHit)) {
        score -= 30
        const hurt = members.filter((mate) => mate.kit.perHit).map((mate) => mate.name)
        reasons.push(`${member.name} выключает Заряд с каждого попадания тычинок. ${hurt.join(" и ")} на этом теряют урон.`)
        continue
      }
      score += enhancement.power
      const names = enhancers.get(enhancement.reaction) ?? []
      names.push(member.name)
      enhancers.set(enhancement.reaction, names)
    }
  }
  for (const [reactionId, names] of enhancers) {
    const title = REACTIONS.find((reaction) => reaction.id === reactionId)?.name ?? reactionId
    reasons.push(
      names.length > 1
        ? `Усиление цикла «${title}» складывается: ${names.join(", ")}.`
        : `Усиление цикла «${title}»: ${names[0]}.`,
    )
  }

  const instants = members.filter((member) => member.kit.instant)
  if (active.has("charge") && instants.length) {
    score += 22
    reasons.push(`${instants.map((member) => member.name).join(" и ")} сразу заполняет шкалу цикла, без этого Заряд открывается медленно.`)
  }
  for (const member of members) {
    if (!member.kit.wantsRemora) continue
    const need = member.kit.wantsRemora
    const relevant = need === "refresh" ? active.has("charge") : active.has("remora") || active.has("charge")
    if (!relevant) continue
    const partner = members.find((mate) => mate.kit.remora === need)
    if (partner) {
      score += 18
      reasons.push(
        need === "refresh"
          ? `${partner.name} вешает Ремору заново, этого хватает на окно ${member.name}.`
          : `${partner.name} держит Ремору дольше, этого хватает на окно ${member.name}.`,
      )
    } else {
      score -= 20
      reasons.push(
        need === "refresh"
          ? `${member.name} без обновляемой Реморы: окно Заряда обрывается раньше.`
          : `${member.name} без долгой Реморы: урон в конце окна слабее.`,
      )
    }
  }
  for (const member of members) {
    if (!member.kit.scalesWithDots) continue
    const own = (member.cycles ?? []).some((enhancement) => active.has(enhancement.reaction))
    if (!own) continue
    const others = members.filter((mate) => mate.id !== member.id && mate.tags.includes("dot"))
    if (!others.length) continue
    score += others.length * 8
    reasons.push(`${member.name} сильнее от чужого периодического урона: ${others.map((mate) => mate.name).join(", ")}.`)
  }

  const counts = new Map<string, Character[]>()
  for (const member of members) {
    const list = counts.get(member.element) ?? []
    list.push(member)
    counts.set(member.element, list)
  }
  for (const group of counts.values()) {
    if (group.length < 3) continue
    const useful = group.filter((member) =>
      (member.cycles ?? []).some((enhancement) => active.has(enhancement.reaction)),
    ).length
    const wasted = group.length - Math.max(1, useful)
    if (wasted > 0) score -= wasted * 8
  }

  score += pairs(members)

  const missing = members.filter((m) => !ctx.owned.has(m.id)).map((m) => m.id)
  if (!ctx.onlyOwned) score += (members.length - missing.length) * 2

  const ordered = [...members].sort((a, b) => b.weight - a.weight || a.name.localeCompare(b.name, "ru"))
  return {
    members: ordered.map((m) => m.id),
    score,
    reasons,
    reactions,
    missing,
  }
}

function pool(ctx: SuggestContext): Character[] {
  return CHARACTERS.filter((c) => {
    if (c.status === "soon" && !ctx.owned.has(c.id)) return false
    if (ctx.onlyOwned && !ctx.owned.has(c.id)) return false
    return true
  })
}

function combinations<T>(items: T[], k: number): T[][] {
  const out: T[][] = []
  const cur: T[] = []
  const walk = (start: number) => {
    if (cur.length === k) {
      out.push([...cur])
      return
    }
    for (let i = start; i <= items.length - (k - cur.length); i++) {
      cur.push(items[i])
      walk(i + 1)
      cur.pop()
    }
  }
  if (k >= 0 && k <= items.length) walk(0)
  return out
}

export interface RoomSetup {
  floor: FloorKind
  boosted: ElementId[]
}

function tieKey(members: string[]): string {
  return [...members].sort().join("|")
}

export function suggestRails(
  rooms: RoomSetup[],
  base: { onlyOwned: boolean; owned: ReadonlySet<string> },
): { teams: (TeamPick | null)[]; note: string } {
  const empty = "Нужно восемь разных персонажей: по четыре в комнату, без повторов."
  const ownedNote = "В наличии меньше восьми персонажей. Отметьте состав или снимите фильтр."
  if (rooms.length < 2) return { teams: [], note: empty }
  const source = pool({
    floor: rooms[0].floor,
    boosted: [],
    onlyOwned: base.onlyOwned,
    owned: base.owned,
  })
  if (source.length < 8) {
    return { teams: [null, null], note: base.onlyOwned ? ownedNote : empty }
  }

  const index = new Map(source.map((character, bit) => [character.id, bit]))
  const groups = combinations(source, 4)
  const count = groups.length
  const masks = new Uint32Array(count)
  const scoreIn = new Float64Array(count)
  const scoreOut = new Float64Array(count)
  const incomingCtx: SuggestContext = {
    floor: rooms[0].floor,
    boosted: rooms[0].boosted,
    onlyOwned: base.onlyOwned,
    owned: base.owned,
  }
  const outgoingCtx: SuggestContext = {
    floor: rooms[1].floor,
    boosted: rooms[1].boosted,
    onlyOwned: base.onlyOwned,
    owned: base.owned,
  }
  const incomingPicks: TeamPick[] = new Array(count)
  const outgoingPicks: TeamPick[] = new Array(count)
  let maxOut = -Infinity
  for (let i = 0; i < count; i++) {
    const ids = groups[i].map((character) => character.id)
    let mask = 0
    for (const id of ids) mask |= 1 << (index.get(id) as number)
    masks[i] = mask
    const incoming = evaluate(ids, incomingCtx)
    const outgoing = evaluate(ids, outgoingCtx)
    incomingPicks[i] = incoming
    outgoingPicks[i] = outgoing
    scoreIn[i] = incoming.score
    scoreOut[i] = outgoing.score
    if (outgoing.score > maxOut) maxOut = outgoing.score
  }

  const lanes = new Uint8Array(count)
  for (let i = 0; i < count; i++) {
    let upper = 0
    for (const id of incomingPicks[i].members) {
      const element = characterById(id)?.element
      if (element === "cosmos" || element === "anima" || element === "lakshana") upper += 1
    }
    lanes[i] = upper >= 3 ? 1 : upper <= 1 ? 2 : 0
  }

  const pairAdjust = (left: number, right: number) => {
    if ((left === 1 && right === 2) || (left === 2 && right === 1)) return 36
    if (left === 1 && right === 1) return -28
    if (left === 2 && right === 2) return -16
    return 0
  }

  const order = Array.from({ length: count }, (_, i) => i).sort((a, b) => scoreIn[b] - scoreIn[a] || a - b)
  let bestSum = -Infinity
  let bestIn = 0
  let bestOut = 0
  for (const i of order) {
    if (scoreIn[i] + maxOut + 36 < bestSum) break
    const mask = masks[i]
    const baseScore = scoreIn[i]
    const laneIn = lanes[i]
    for (let j = 0; j < count; j++) {
      if (mask & masks[j]) continue
      const sum = baseScore + scoreOut[j] + pairAdjust(laneIn, lanes[j])
      if (sum > bestSum) {
        bestSum = sum
        bestIn = i
        bestOut = j
        continue
      }
      if (sum === bestSum) {
        const next = tieKey(incomingPicks[i].members) + tieKey(outgoingPicks[j].members)
        const prev = tieKey(incomingPicks[bestIn].members) + tieKey(outgoingPicks[bestOut].members)
        if (next < prev) {
          bestIn = i
          bestOut = j
        }
      }
    }
  }

  const split = pairAdjust(lanes[bestIn], lanes[bestOut])
  const splitNote =
    split > 0
      ? " Комнаты разошлись по разным половинам колеса: Заряд и Раздор не делят одних и тех же партнёров."
      : split < 0
        ? " Обе комнаты сидят на одной половине колеса: слабости этажа этого требуют."
        : ""
  return {
    teams: [incomingPicks[bestIn], outgoingPicks[bestOut]],
    note:
      "Персонаж занимает только одну комнату. В четвёрке один керри на поле. Пара выбрана по сумме обеих комнат." +
      splitNote,
  }
}

export interface FilledTeam {
  locked: (string | null)[]
  suggested: (string | null)[]
  pick: TeamPick | null
  note: string
}

export function suggestFill(locked: (string | null)[], ctx: SuggestContext): FilledTeam {
  const fixed = locked.map((id) => (id && characterById(id) ? id : null))
  const used = new Set(fixed.filter((id): id is string => Boolean(id)))
  if (used.size !== fixed.filter(Boolean).length) {
    return { locked: fixed, suggested: fixed, pick: null, note: "Один персонаж стоит в двух слотах." }
  }
  const need = 4 - used.size
  const source = pool(ctx).filter((c) => !used.has(c.id))
  if (need === 0) {
    const pick = evaluate([...used], ctx)
    return { locked: fixed, suggested: fixed, pick, note: "Все четыре слота заняты. Ниже — разбор этой четвёрки." }
  }
  if (source.length < need) {
    return {
      locked: fixed,
      suggested: fixed,
      pick: null,
      note: "Не хватает свободных персонажей, чтобы закрыть пустые слоты.",
    }
  }
  let best: TeamPick | null = null
  for (const extra of combinations(source, need)) {
    const pick = evaluate([...used, ...extra.map((c) => c.id)], ctx)
    if (!best || pick.score > best.score) best = pick
  }
  if (!best) return { locked: fixed, suggested: fixed, pick: null, note: "Вариант не нашёлся." }
  const rest = best.members.filter((id) => !used.has(id))
  const suggested = fixed.map((id) => {
    if (id) return id
    return rest.shift() ?? null
  })
  return {
    locked: fixed,
    suggested,
    pick: best,
    note: need === 4 ? "Слоты пустые, поэтому показана самая сильная четвёрка по общим правилам." : "Пустые слоты заполнены под уже выбранных.",
  }
}

export interface ListedTeam extends TeamPick {
  title: string
  blurb: string
}

export function listGlobal(ctx: SuggestContext): { teams: ListedTeam[]; note: string } {
  const general: SuggestContext = { ...ctx, floor: "general", boosted: [] }
  const curated: ListedTeam[] = META_TEAMS.map((team) => ({
    ...evaluate(team.members, general),
    title: team.title,
    blurb: team.blurb,
  }))
  if (!ctx.onlyOwned) {
    return {
      teams: curated,
      note: "Порядок — публичный верхний ряд конца версии 1.4, не пересчёт урона по вашему аккаунту.",
    }
  }
  const ready = curated.filter((team) => team.missing.length === 0)
  if (ready.length >= 5) {
    return { teams: ready.slice(0, 5), note: "Из верхней пятёрки оставлены только полные команды из наличия." }
  }
  const source = pool(ctx)
  if (source.length < 4) {
    return {
      teams: ready,
      note: "Полных команд из верхней пятёрки меньше пяти, а своих персонажей не хватает на новый расчёт.",
    }
  }
  const have = new Set(ready.map((team) => [...team.members].sort().join("|")))
  const extra = combinations(source, 4)
    .map((group) => evaluate(group.map((c) => c.id), general))
    .filter((team) => !have.has([...team.members].sort().join("|")))
    .sort((a, b) => b.score - a.score)
  const teams = [...ready]
  for (const team of extra) {
    if (teams.length >= 5) break
    teams.push({
      ...team,
      title: "Сборная из наличия",
      blurb: "Этой четвёрки нет в зафиксированной пятёрке. Она лучшая из того, что отмечено у вас.",
    })
  }
  return { teams, note: "Сначала полные команды из верхней пятёрки, затем лучшие четвёрки только из наличия." }
}

export function roleLine(id: string): string {
  const c = characterById(id)
  if (!c) return ""
  return ROLE_LABEL[c.role]
}

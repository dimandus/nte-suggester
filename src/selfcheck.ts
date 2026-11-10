import { listGlobal, suggestFill, suggestRails } from "./suggest"

export function runSelfCheck(): void {
  const owned = new Set<string>()
  const ctx = { floor: "general" as const, boosted: [], onlyOwned: false, owned }
  const rails = suggestRails(
    [
      { floor: "boss", boosted: ["lakshana", "cosmos"] },
      { floor: "mob", boosted: ["anima", "cosmos"] },
    ],
    { onlyOwned: false, owned },
  )
  if (rails.teams.length !== 2) throw new Error("Рельсы должны предлагать две комнаты")
  for (const team of rails.teams) {
    if (!team || new Set(team.members).size !== 4) throw new Error("В каждой комнате должно быть 4 разных персонажа")
  }
  const [incoming, outgoing] = rails.teams
  if (!incoming || !outgoing) throw new Error("Обе комнаты должны получить четвёрку")
  const overlap = incoming.members.filter((id) => outgoing.members.includes(id))
  if (overlap.length) throw new Error("Персонаж не может стоять в обеих комнатах")
  const carries = new Set(["nanally", "chiz", "shinku", "lacrimosa"])
  for (const team of rails.teams) {
    const onField = team?.members.filter((id) => carries.has(id)) ?? []
    if (onField.length > 1) throw new Error("В комнате два керри на одно поле")
  }
  if (!outgoing.reasons.some((reason) => reason.includes("Цветение"))) {
    throw new Error("Толпа Космос+Анима должна открывать Цветение")
  }

  const fill = suggestFill(["nanally", null, null, null], ctx)
  if (!fill.pick || !fill.pick.members.includes("nanally") || fill.pick.members.length !== 4) {
    throw new Error("Доборщик не сохранил выбранного персонажа")
  }

  const global = listGlobal(ctx)
  if (global.teams.length !== 5) throw new Error("Общих команд должно быть пять")

}

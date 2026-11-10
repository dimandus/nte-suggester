import { useMemo, useState } from "react"
import { ARCS } from "../data/arcs"
import { characterById } from "../data/characters"
import { ARC_TYPES, arcTypeName } from "../data/game"
import type { ArcTypeId, Rarity } from "../data/types"

export function Arcs() {
  const [query, setQuery] = useState("")
  const [type, setType] = useState<ArcTypeId | "all">("all")
  const [rarity, setRarity] = useState<Rarity | "all">("all")

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ARCS.filter((arc) => {
      if (type !== "all" && arc.type !== type) return false
      if (rarity !== "all" && arc.rarity !== rarity) return false
      if (!q) return true
      return `${arc.name} ${arc.effect}`.toLowerCase().includes(q)
    })
  }, [query, rarity, type])

  return (
    <section>
      <div className="filters">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Название или эффект"
          aria-label="Поиск дуги"
        />
        <select value={type} onChange={(event) => setType(event.target.value as ArcTypeId | "all")} aria-label="Тип дуги">
          <option value="all">Все типы</option>
          {ARC_TYPES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select value={rarity} onChange={(event) => setRarity(event.target.value as Rarity | "all")} aria-label="Ранг">
          <option value="all">Все ранги</option>
          <option value="S">S</option>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>
      </div>
      <p className="count">{list.length} дуг в базе. Имена английские: русские названия клиента сюда ещё не сверены.</p>
      <div className="arc-list">
        {list.map((arc) => (
          <article key={arc.id} className="arc">
            <header>
              <span className={`rarity r-${arc.rarity}`}>{arc.rarity}</span>
              <h3>{arc.name}</h3>
              <span>
                {arcTypeName(arc.type)} · АТК {arc.atk} · {arc.substat}
              </span>
            </header>
            <p>{arc.effect}</p>
            {arc.forIds.length > 0 && (
              <p className="muted">
                Кому смотреть в первую очередь:{" "}
                {arc.forIds.map((id) => characterById(id)?.name ?? id).join(", ")}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

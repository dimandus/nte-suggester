import { useMemo, useState } from "react"
import { ARCS } from "../data/arcs"
import { CHARACTERS } from "../data/characters"
import { CONSOLES, ELEMENTS, REACTIONS, ROLES, arcTypeName, elementName, roleName } from "../data/game"
import { characterIcon } from "../data/icons"
import { MAIN_STATS } from "../data/mains"
import { aspectLines } from "../data/aspects"
import type { ElementId, RoleId } from "../data/types"

export function Characters({
  owned,
  onToggle,
}: {
  owned: Set<string>
  onToggle: (id: string) => void
}) {
  const [query, setQuery] = useState("")
  const [element, setElement] = useState<ElementId | "all">("all")
  const [role, setRole] = useState<RoleId | "all">("all")
  const [onlyOwned, setOnlyOwned] = useState(false)
  const [selected, setSelected] = useState<string | null>(CHARACTERS[0]?.id ?? null)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CHARACTERS.filter((c) => {
      if (element !== "all" && c.element !== element) return false
      if (role !== "all" && c.role !== role) return false
      if (onlyOwned && !owned.has(c.id)) return false
      if (!q) return true
      return `${c.name} ${c.nameEn} ${c.summary}`.toLowerCase().includes(q)
    })
  }, [element, onlyOwned, owned, query, role])

  const current = list.find((c) => c.id === selected) ?? list[0]

  return (
    <div className="split">
      <section>
        <div className="filters">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Имя или особенность"
            aria-label="Поиск персонажа"
          />
          <select
            value={element}
            onChange={(event) => setElement(event.target.value as ElementId | "all")}
            aria-label="Стихия"
          >
            <option value="all">Все стихии</option>
            {ELEMENTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as RoleId | "all")}
            aria-label="Класс"
          >
            <option value="all">Все классы</option>
            {ROLES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <label className="check">
            <input
              type="checkbox"
              checked={onlyOwned}
              onChange={(event) => setOnlyOwned(event.target.checked)}
            />
            Только в наличии
          </label>
        </div>
        <p className="count">
          {list.length} из {CHARACTERS.length}. В наличии {owned.size}.
        </p>
        <div className="roster">
          {list.map((character) => (
            <div
              key={character.id}
              className={`card el-${character.element} ${current?.id === character.id ? "is-on" : ""}`}
              onClick={() => setSelected(character.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setSelected(character.id)
                }
              }}
            >
              <span className="who">
                {characterIcon(character.id) && (
                  <img className="portrait" src={characterIcon(character.id)} alt="" />
                )}
                <span>
                  <span className="card-top">
                    <span className={`rarity r-${character.rarity}`}>{character.rarity}</span>
                    <span>{elementName(character.element)}</span>
                    {character.status === "soon" && <span className="soon">скоро</span>}
                  </span>
                  <strong>{character.name}</strong>
                  <span className="muted">
                    {roleName(character.role)} · дуга {arcTypeName(character.arcType)}
                  </span>
                </span>
              </span>
              <span
                className={`own ${owned.has(character.id) ? "is-own" : ""}`}
                onClick={(event) => {
                  event.stopPropagation()
                  onToggle(character.id)
                }}
                role="checkbox"
                aria-checked={owned.has(character.id)}
              >
                {owned.has(character.id) ? "В наличии" : "Отметить"}
              </span>
            </div>
          ))}
        </div>
      </section>
      {current && (
        <aside className="dossier">
          <div className="who">
            {characterIcon(current.id) && <img className="portrait lg" src={characterIcon(current.id)} alt="" />}
            <div>
              <p className="kicker">
                {current.nameEn} · {current.rarity}-ранг
              </p>
              <h2>{current.name}</h2>
            </div>
          </div>
          <ul className="facts">
            <li>
              <span>Стихия</span>
              {elementName(current.element)}
            </li>
            <li>
              <span>Класс</span>
              {roleName(current.role)}
            </li>
            <li>
              <span>Тип дуги</span>
              {arcTypeName(current.arcType)}
              {!current.arcCertain && " · не подтверждён"}
            </li>
            <li>
              <span>Статус</span>
              {current.status === "playable" ? "Уже в игре" : "Ещё не вышел"}
            </li>
          </ul>
          <p>{current.summary}</p>
          <h3>Параметры</h3>
          <ul className="blocks">
            {aspectLines(current).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <h3>Особенности</h3>
          <ul>
            {current.traits.map((trait) => (
              <li key={trait}>{trait}</li>
            ))}
          </ul>
          {current.cycles && current.cycles.length > 0 && (
            <>
              <h3>Усиление цикла</h3>
              <ul className="blocks">
                {current.cycles.map((enhancement) => (
                  <li key={enhancement.reaction}>
                    <strong>{REACTIONS.find((reaction) => reaction.id === enhancement.reaction)?.name}</strong>
                    <p>
                      {enhancement.effect} Действует, пока персонаж просто стоит в четвёрке, даже если эта стихия уже
                      есть у другого.
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
          <h3>Консоли</h3>
          {MAIN_STATS[current.id] && <p className="mains">Основной стат: {MAIN_STATS[current.id]}</p>}
          <ul className="blocks">
            {current.consoles.map((id) => {
              const set = CONSOLES.find((item) => item.id === id)
              if (!set) return null
              return (
                <li key={id}>
                  <strong>{set.name}</strong>
                  <span>{set.nameRu}</span>
                  <p>{set.four ?? set.two}</p>
                </li>
              )
            })}
          </ul>
          <h3>Дуги</h3>
          <ul className="blocks">
            {current.arcs.map((id) => {
              const arc = ARCS.find((item) => item.id === id)
              if (!arc) return null
              return (
                <li key={id}>
                  <strong>{arc.name}</strong>
                  <span>
                    {arc.rarity} · {arcTypeName(arc.type)} · АТК {arc.atk}
                  </span>
                  <p>{arc.effect}</p>
                </li>
              )
            })}
          </ul>
          <h3>Пробуждения</h3>
          {current.awakeningOrder && (
            <p className="order">
              Порядок прокачки: {current.awakeningOrder.map((level) => `A${level}`).join(" → ")}
            </p>
          )}
          {current.awakenings.length === 0 ? (
            <p className="muted">Эффекты пробуждений для этого персонажа ещё не внесены.</p>
          ) : (
            <ol className="awaken">
              {[...current.awakenings]
                .sort((a, b) => a.level - b.level)
                .map((node) => (
                  <li key={node.level}>
                    <strong>
                      A{node.level} · {node.name}
                    </strong>
                    <p>{node.effect}</p>
                  </li>
                ))}
            </ol>
          )}
          <button className={`own big ${owned.has(current.id) ? "is-own" : ""}`} onClick={() => onToggle(current.id)}>
            {owned.has(current.id) ? "Убрать из наличия" : "Отметить как имеющегося"}
          </button>
        </aside>
      )}
    </div>
  )
}

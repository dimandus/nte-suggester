import { useMemo, useState } from "react"
import { CHARACTERS, characterById } from "../data/characters"
import { ELEMENTS, elementName } from "../data/game"
import { listGlobal, suggestFill, suggestRails, type RoomSetup } from "../suggest"
import type { ElementId, FloorKind, TeamPick } from "../data/types"
import { CharacterFace } from "./bits"

interface Bonus {
  id: string
  text: string
}

export function Teams({ owned }: { owned: Set<string> }) {
  const [mode, setMode] = useState<"rails" | "global" | "fill">("rails")
  const [incoming, setIncoming] = useState<RoomSetup>({ floor: "boss", boosted: [] })
  const [outgoing, setOutgoing] = useState<RoomSetup>({ floor: "mob", boosted: [] })
  const [bonuses, setBonuses] = useState<Bonus[]>([])
  const [draft, setDraft] = useState("")
  const [onlyOwned, setOnlyOwned] = useState(false)
  const [locked, setLocked] = useState<(string | null)[]>([null, null, null, null])
  const [picking, setPicking] = useState<number | null>(null)
  const [finder, setFinder] = useState("")

  const rails = useMemo(
    () => suggestRails([incoming, outgoing], { onlyOwned, owned }),
    [incoming, onlyOwned, outgoing, owned],
  )
  const global = useMemo(
    () => listGlobal({ floor: "general", boosted: [], onlyOwned, owned }),
    [onlyOwned, owned],
  )
  const filled = useMemo(
    () => suggestFill(locked, { floor: "general", boosted: [], onlyOwned, owned }),
    [locked, onlyOwned, owned],
  )

  function toggleElement(room: "in" | "out", id: ElementId) {
    const update = (prev: RoomSetup): RoomSetup => {
      if (prev.boosted.includes(id)) return { ...prev, boosted: prev.boosted.filter((item) => item !== id) }
      if (prev.boosted.length >= 2) return { ...prev, boosted: [prev.boosted[1], id] }
      return { ...prev, boosted: [...prev.boosted, id] }
    }
    if (room === "in") setIncoming(update)
    else setOutgoing(update)
  }

  function addBonus() {
    const text = draft.trim()
    if (!text) return
    setBonuses((prev) => [...prev, { id: `${Date.now()}`, text }])
    setDraft("")
  }

  function assign(slot: number, id: string) {
    setLocked((prev) => {
      const next = [...prev]
      const other = next.findIndex((value, index) => value === id && index !== slot)
      if (other >= 0) next[other] = null
      next[slot] = next[slot] === id ? null : id
      return next
    })
    setPicking(null)
  }

  return (
    <section className="teams">
      <div className="subnav">
        <button className={mode === "rails" ? "is-on" : ""} onClick={() => setMode("rails")}>
          Рельсы
        </button>
        <button className={mode === "global" ? "is-on" : ""} onClick={() => setMode("global")}>
          Общие
        </button>
        <button className={mode === "fill" ? "is-on" : ""} onClick={() => setMode("fill")}>
          Доборщик
        </button>
        <label className="check">
          <input type="checkbox" checked={onlyOwned} onChange={(event) => setOnlyOwned(event.target.checked)} />
          Только из наличия
        </label>
      </div>

      {mode === "rails" && (
        <>
          <p className="note">
            {rails.note}
            {bonuses.length > 0 && " Записанные бонусы видны на карточках и в расчёт пока не входят."}
          </p>
          <form
            className="bonus"
            onSubmit={(event) => {
              event.preventDefault()
              addBonus()
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Временный бонус этажа, пока просто пометка"
              aria-label="Временный бонус"
            />
            <button type="submit">Записать</button>
          </form>
          {bonuses.length > 0 && (
            <ul className="chips">
              {bonuses.map((bonus) => (
                <li key={bonus.id}>
                  {bonus.text}
                  <button onClick={() => setBonuses((prev) => prev.filter((item) => item.id !== bonus.id))} aria-label="Удалить бонус">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="pair">
            <RoomColumn
              title="Входящие"
              room={incoming}
              team={rails.teams[0] ?? null}
              owned={owned}
              bonuses={bonuses.map((bonus) => bonus.text)}
              onFloor={(floor) => setIncoming((prev) => ({ ...prev, floor }))}
              onElement={(id) => toggleElement("in", id)}
            />
            <RoomColumn
              title="Исходящие"
              room={outgoing}
              team={rails.teams[1] ?? null}
              owned={owned}
              bonuses={bonuses.map((bonus) => bonus.text)}
              onFloor={(floor) => setOutgoing((prev) => ({ ...prev, floor }))}
              onElement={(id) => toggleElement("out", id)}
            />
          </div>
        </>
      )}

      {mode === "global" && (
        <>
          <p className="note">{global.note}</p>
          <div className="stack">
            {global.teams.map((team, index) => (
              <TeamCard key={`${team.title}-${team.members.join("-")}`} title={`${index + 1}. ${team.title}`} blurb={team.blurb} team={team} owned={owned} />
            ))}
          </div>
        </>
      )}

      {mode === "fill" && (
        <>
          <p className="note">{filled.note}</p>
          <div className="slots">
            {filled.suggested.map((id, index) => {
              const isLocked = Boolean(locked[index])
              return (
                <div key={index} className={`slot ${isLocked ? "is-locked" : "is-hint"}`}>
                  <span>{isLocked ? `Слот ${index + 1}` : `Совет ${index + 1}`}</span>
                  {id ? (
                    <div className="hit" onClick={() => setPicking(index)} role="button" tabIndex={0}>
                      <CharacterFace id={id} owned={owned.has(id)} hint={isLocked ? "закреплён" : "можно сменить"} />
                    </div>
                  ) : (
                    <button className="empty" onClick={() => setPicking(index)}>
                      Выбрать
                    </button>
                  )}
                  {isLocked && (
                    <button className="texty" onClick={() => assign(index, locked[index] as string)}>
                      Очистить
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="row-actions">
            <button
              onClick={() => setLocked(filled.suggested)}
              disabled={!filled.pick}
            >
              Закрепить совет
            </button>
            <button onClick={() => setLocked([null, null, null, null])}>Сбросить</button>
          </div>
          {filled.pick && <TeamCard title="Почему так" team={filled.pick} owned={owned} />}
          {picking !== null && (
            <div className="picker">
              <header>
                <h3>Слот {picking + 1}</h3>
                <button onClick={() => setPicking(null)}>Закрыть</button>
              </header>
              <input
                value={finder}
                onChange={(event) => setFinder(event.target.value)}
                placeholder="Найти персонажа"
                aria-label="Поиск в доборщике"
              />
              <div className="picker-list">
                {CHARACTERS.filter((character) => {
                  if (onlyOwned && !owned.has(character.id)) return false
                  const q = finder.trim().toLowerCase()
                  if (!q) return true
                  return `${character.name} ${character.nameEn}`.toLowerCase().includes(q)
                }).map((character) => (
                  <div key={character.id} className="hit" onClick={() => assign(picking, character.id)} role="button" tabIndex={0}>
                    <CharacterFace id={character.id} owned={owned.has(character.id)} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function RoomColumn({
  title,
  room,
  team,
  owned,
  bonuses,
  onFloor,
  onElement,
}: {
  title: string
  room: RoomSetup
  team: TeamPick | null
  owned: Set<string>
  bonuses: string[]
  onFloor: (floor: FloorKind) => void
  onElement: (id: ElementId) => void
}) {
  return (
    <section className="room">
      <h3>{title}</h3>
      <div className="segmented">
        <button className={room.floor === "boss" ? "is-on" : ""} onClick={() => onFloor("boss")}>
          Босс
        </button>
        <button className={room.floor === "mob" ? "is-on" : ""} onClick={() => onFloor("mob")}>
          Толпа
        </button>
      </div>
      <p className="muted">Слабость монстра, две стихии. Третья заменяет более раннюю.</p>
      <div className="elements">
        {ELEMENTS.map((element) => (
          <button
            key={element.id}
            className={`chip el-${element.id} ${room.boosted.includes(element.id) ? "is-on" : ""}`}
            onClick={() => onElement(element.id)}
          >
            {element.name}
          </button>
        ))}
      </div>
      {team ? (
        <TeamCard title="Четвёрка" team={team} owned={owned} bonuses={bonuses} boosted={room.boosted} />
      ) : (
        <p>Для этой комнаты четвёрка не собралась.</p>
      )}
    </section>
  )
}

function TeamCard({
  title,
  blurb,
  team,
  owned,
  bonuses = [],
  boosted = [],
}: {
  title: string
  blurb?: string
  team: TeamPick
  owned: Set<string>
  bonuses?: string[]
  boosted?: ElementId[]
}) {
  return (
    <article className="team-card">
      <h3>{title}</h3>
      {blurb && <p>{blurb}</p>}
      <div className="faces">
        {team.members.map((id) => (
          <CharacterFace key={id} id={id} owned={owned.has(id)} />
        ))}
      </div>
      {boosted.length > 0 && (
        <p className="muted">Усиление комнаты: {boosted.map((id) => elementName(id)).join(" и ")}.</p>
      )}
      <ul>
        {team.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
        {team.missing.length > 0 && (
          <li>Нет в наличии: {team.missing.map((id) => characterById(id)?.name ?? id).join(", ")}.</li>
        )}
      </ul>
      {bonuses.length > 0 && <p className="muted">Пометки этажа, без влияния на выбор: {bonuses.join("; ")}.</p>}
    </article>
  )
}

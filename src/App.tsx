import { useMemo, useState } from "react"
import { CHARACTERS } from "./data/characters"
import { Characters } from "./ui/Characters"
import { Arcs } from "./ui/Arcs"
import { Reference } from "./ui/Reference"
import { Teams } from "./ui/Teams"
import { loadOwned, saveOwned } from "./storage"

type Section = "characters" | "arcs" | "reference" | "teams"

const SECTIONS: { id: Section; label: string }[] = [
  { id: "characters", label: "Персонажи" },
  { id: "arcs", label: "Дуги" },
  { id: "reference", label: "Справочная" },
  { id: "teams", label: "Команды" },
]

export default function App() {
  const [section, setSection] = useState<Section>("teams")
  const [ownedList, setOwnedList] = useState<string[]>(() => loadOwned())
  const owned = useMemo(() => new Set(ownedList), [ownedList])

  function toggleOwned(id: string) {
    setOwnedList((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      saveOwned(next)
      return next
    })
  }

  return (
    <div className="app">
      <header className="top">
        <div>
          <p className="kicker">Neverness to Everness</p>
          <h1>Подборщик команд</h1>
        </div>
        <p className="lede">
          Четвёрки под рельсы, общий верхний ряд и добор к уже выбранному персонажу. Состав базы — версия 1.4 на 10
          ноября 2026.
        </p>
      </header>
      <nav>
        {SECTIONS.map((item) => (
          <button key={item.id} className={section === item.id ? "is-on" : ""} onClick={() => setSection(item.id)}>
            {item.label}
          </button>
        ))}
        <span className="owned-count">В наличии {owned.size} / {CHARACTERS.length}</span>
      </nav>
      <main>
        {section === "characters" && <Characters owned={owned} onToggle={toggleOwned} />}
        {section === "arcs" && <Arcs />}
        {section === "reference" && <Reference />}
        {section === "teams" && <Teams owned={owned} />}
      </main>
    </div>
  )
}

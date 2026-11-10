import { characterById } from "../data/characters"
import { characterIcon } from "../data/icons"
import { arcTypeName, elementName, roleName } from "../data/game"

export function CharacterFace({
  id,
  owned,
  hint,
}: {
  id: string
  owned?: boolean
  hint?: string
}) {
  const character = characterById(id)
  if (!character) return null
  const icon = characterIcon(id)
  return (
    <div className={`face el-${character.element}`}>
      {icon && <img className="portrait" src={icon} alt="" />}
      <div>
        <header>
        <span className={`rarity r-${character.rarity}`}>{character.rarity}</span>
        <span>{elementName(character.element)}</span>
          {character.status === "soon" && <span className="soon">скоро</span>}
        </header>
        <strong>{character.name}</strong>
        <p>
          {roleName(character.role)} · {arcTypeName(character.arcType)}
          {hint ? ` · ${hint}` : ""}
        </p>
        {owned === false && <em>нет в наличии</em>}
        {owned === true && <em className="have">в наличии</em>}
      </div>
    </div>
  )
}

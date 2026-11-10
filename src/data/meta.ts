import type { MetaTeam } from "./types"

/** Пять команд верхнего ряда на конец версии 1.4. Названия — с Prydwen (21 октября 2026), состав собран по их синергиям. */
export const META_TEAMS: MetaTeam[] = [
  {
    id: "akane-hyper",
    title: "Аканэ, гиперкерри",
    members: ["akane-rin", "esper-zero", "chiz", "haniel"],
    blurb:
      "Два Космоса держат Ремору, от которой у Аканэ включена пассивка. Ханиэль добавляет Пятно и атаку отряда.",
  },
  {
    id: "blackbird-nova",
    title: "Блэкбёрд, Нова",
    members: ["blackbird", "lacrimosa", "sakiri", "daffodill"],
    blurb:
      "Психея и Хаос дают Нову, Сакири добавляет Ожог и баф атаки. Даффодил ломает шкалу под пассивку Лакримозы.",
  },
  {
    id: "lacrimosa-swap",
    title: "Лакримоза, быстрый свап",
    members: ["lacrimosa", "daffodill", "sakiri", "fadia"],
    blurb:
      "Раздор: Ожог от Чар с Хаосом и Нова от Хаоса с Психеей. Фадия держит отряд, пока стаки Nightmare крутятся свапом.",
  },
  {
    id: "blackbird-stain",
    title: "Блэкбёрд, Пятно",
    members: ["blackbird", "akane-rin", "esper-zero", "haniel"],
    blurb:
      "Психея с Лакшаной вешают Пятно, Нулевой эспер с Аканэ — Ремору. Два окна уязвимости на одну цель.",
  },
  {
    id: "hotori-blossom",
    title: "Хотори, Цветение",
    members: ["hotori", "nanally", "jiuyuan", "esper-zero"],
    blurb:
      "Две Анимы и два Космоса почти не отпускают Цветение. Бутоны продолжают стрелять, пока Хотори останавливает время.",
  },
]

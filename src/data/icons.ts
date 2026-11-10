/** Портреты со страниц русской вики. У Экзе отдельной иконки нет, стоит арт представления. */
const ICONS: Record<string, string> = {
  adler: "/icons/adler.png",
  "akane-rin": "/icons/akane-rin.png",
  aurelia: "/icons/aurelia.png",
  baicang: "/icons/baicang.png",
  blackbird: "/icons/blackbird.png",
  chaos: "/icons/chaos.png",
  chiz: "/icons/chiz.png",
  daffodill: "/icons/daffodill.png",
  edgar: "/icons/edgar.png",
  elyms: "/icons/elyms.png",
  exe: "/icons/exe.jpg",
  "esper-zero": "/icons/esper-zero.png",
  fadia: "/icons/fadia.png",
  haniel: "/icons/haniel.png",
  hathor: "/icons/hathor.png",
  hotori: "/icons/hotori.png",
  iroi: "/icons/iroi.png",
  jiuyuan: "/icons/jiuyuan.png",
  linko: "/icons/linko.png",
  lacrimosa: "/icons/lacrimosa.png",
  mint: "/icons/mint.png",
  nanally: "/icons/nanally.png",
  sakiri: "/icons/sakiri.png",
  shinku: "/icons/shinku.png",
  skia: "/icons/skia.png",
  zankou: "/icons/zankou.png",
}

export function characterIcon(id: string): string | undefined {
  return ICONS[id]
}

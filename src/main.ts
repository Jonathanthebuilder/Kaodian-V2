import "./style.css";

type Venue = {
  name: string;
  region: string;
  address: string;
  phone: string;
  email: string;
};

type StateData = {
  id: string;
  nameZh: string;
  nameDe: string;
  listedCount: number;
  venues: Venue[];
};

let allStates: StateData[] = [];
let selectedId: string | null = null;
let searchQuery = "";
let regionFilter = "";

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function matchesSearch(v: Venue, q: string): boolean {
  if (!q) return true;
  const n = normalize(q);
  return (
    normalize(v.name).includes(n) ||
    normalize(v.address).includes(n) ||
    normalize(v.region).includes(n) ||
    normalize(v.phone).includes(n) ||
    (v.email && normalize(v.email).includes(n))
  );
}

function getFilteredVenues(state: StateData): Venue[] {
  let list = state.venues;
  if (regionFilter) {
    list = list.filter((v) => v.region === regionFilter);
  }
  if (searchQuery) {
    list = list.filter((v) => matchesSearch(v, searchQuery));
  }
  return list;
}

function uniqueRegions(state: StateData): string[] {
  const set = new Set(state.venues.map((v) => v.region).filter(Boolean));
  return [...set].sort((a, b) => a.localeCompare(b, "de"));
}

async function loadData(): Promise<void> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/venues.json`);
  if (!res.ok) throw new Error("无法加载考点数据");
  allStates = (await res.json()) as StateData[];
}

function stateFromHash(): string | null {
  const h = window.location.hash.replace(/^#/, "").trim();
  if (!h) return null;
  return allStates.some((s) => s.id === h) ? h : null;
}

function setHash(id: string | null): void {
  if (!id) {
    history.pushState(null, "", window.location.pathname + window.location.search);
  } else {
    history.pushState(null, "", `#${id}`);
  }
}

async function copyText(label: string, text: string, btn: HTMLButtonElement): Promise<void> {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    const prev = btn.textContent;
    btn.textContent = "已复制";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = prev;
      btn.classList.remove("copied");
    }, 1600);
  } catch {
    window.prompt(`${label}（请手动复制）`, text);
  }
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Partial<HTMLElementTagNameMap[K]> & { className?: string },
  children?: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props) {
    Object.assign(node, props);
    if ("className" in props && props.className) node.className = props.className as string;
  }
  if (children) {
    for (const c of children) {
      if (typeof c === "string") node.appendChild(document.createTextNode(c));
      else node.appendChild(c);
    }
  }
  return node;
}

function render(): void {
  const root = document.getElementById("app");
  if (!root) return;

  root.replaceChildren();

  const hero = el("header", { className: "hero" }, [
    el("h1", {}, ["德国入籍考点通"]),
    el("p", { className: "sub" }, ["Einbürgerungstest 笔试考点 · 按联邦州查询"]),
    el("span", { className: "sub-de" }, [
      "Leben in Deutschland — Prüfungszentren nach Bundesland",
    ]),
    el(
      "p",
      { className: "lead" },
      [
        "选择您居住的联邦州，即可查看本州可进行入籍考试报名的机构（多为 VHS 等）。支持按地区与关键词筛选，并可一键复制地址与联系方式。",
      ]
    ),
  ]);

  const sectionTitle = el("div", { className: "section-title" }, [
    el("h2", {}, ["选择联邦州"]),
    el("span", { className: "hint" }, ["共 16 个联邦州 · 数据来自原站整理"]),
  ]);

  const grid = el("div", {
    className: "state-grid",
    role: "group",
    ariaLabel: "德国十六个联邦州，点击选择",
  } as Partial<HTMLDivElement>);
  for (const s of allStates) {
    const card = el("button", {
      className: `state-card${selectedId === s.id ? " selected" : ""}`,
      type: "button",
      ariaPressed: selectedId === s.id ? "true" : "false",
    });
    card.appendChild(el("span", { className: "flag-bar" }));
    card.appendChild(el("span", { className: "zh" }, [s.nameZh]));
    card.appendChild(el("span", { className: "de" }, [s.nameDe]));
    card.appendChild(
      el("div", { className: "count" }, [
        "本州考点 ",
        el("strong", {}, [String(s.venues.length)]),
        " 个",
      ])
    );
    card.addEventListener("click", () => {
      selectedId = s.id;
      searchQuery = "";
      regionFilter = "";
      setHash(s.id);
      render();
      document.getElementById("panel-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    grid.appendChild(card);
  }

  const frag: (HTMLElement | string)[] = [hero, sectionTitle, grid];

  const state = selectedId ? allStates.find((x) => x.id === selectedId) : null;

  if (state) {
    const panel = el("section", { className: "panel", id: "panel-anchor" });
    const head = el("div", { className: "panel-head" });
    head.appendChild(
      el("div", {}, [
        el("h3", {}, [`${state.nameZh} · ${state.nameDe}`]),
        el("p", { className: "panel-meta" }, [
          `共 ${state.venues.length} 个机构 · 可按县/市区域与关键词缩小范围`,
        ]),
      ])
    );
    head.appendChild(
      el(
        "button",
        { className: "btn", type: "button" },
        ["清除选择"]
      )
    ).addEventListener("click", () => {
      selectedId = null;
      searchQuery = "";
      regionFilter = "";
      setHash(null);
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    panel.appendChild(head);

    const toolbar = el("div", { className: "toolbar" });

    const searchWrap = el("div", { className: "search-wrap" });
    searchWrap.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"/></svg>`;
    const searchInput = el("input", {
      type: "search",
      placeholder: "搜索机构名称、城市、地址、电话…",
      value: searchQuery,
      autocomplete: "off",
    }) as HTMLInputElement;
    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value;
      renderResultsOnly();
    });
    searchWrap.appendChild(searchInput);
    toolbar.appendChild(searchWrap);

    const regions = uniqueRegions(state);
    const sel = el("select", { className: "region-select" }) as HTMLSelectElement;
    sel.appendChild(el("option", { value: "" }, ["全部区域 / Alle Kreise"]));
    for (const r of regions) {
      sel.appendChild(el("option", { value: r }, [r]));
    }
    sel.value = regionFilter;
    sel.addEventListener("change", () => {
      regionFilter = sel.value;
      renderResultsOnly();
    });
    toolbar.appendChild(sel);

    panel.appendChild(toolbar);

    const resultsMeta = el("p", {
      className: "results-meta",
      id: "results-meta",
    });
    const venueGrid = el("div", {
      className: "venue-grid",
      id: "venue-grid",
    });

    panel.appendChild(resultsMeta);
    panel.appendChild(venueGrid);

    frag.push(panel);

    function renderResultsOnly(): void {
      const filtered = getFilteredVenues(state);
      const meta = document.getElementById("results-meta");
      const vg = document.getElementById("venue-grid");
      if (!meta || !vg) return;
      meta.textContent = `显示 ${filtered.length} / ${state.venues.length} 个考点`;
      vg.replaceChildren();
      if (filtered.length === 0) {
        vg.appendChild(
          el("div", { className: "empty" }, [
            "没有符合筛选条件的考点，请尝试更改关键词或区域。",
          ])
        );
        return;
      }
      for (const v of filtered) {
        vg.appendChild(venueCard(v));
      }
    }

    function venueCard(v: Venue): HTMLElement {
      const card = el("article", { className: "venue-card" });
      if (v.region) {
        card.appendChild(el("span", { className: "region-tag" }, [v.region]));
      }
      card.appendChild(el("h4", {}, [v.name]));
      const dl = el("dl");
      dl.appendChild(el("dt", {}, ["地址"]));
      dl.appendChild(el("dd", {}, [v.address || "—"]));
      dl.appendChild(el("dt", {}, ["电话"]));
      dl.appendChild(el("dd", {}, [v.phone || "—"]));
      dl.appendChild(el("dt", {}, ["邮箱"]));
      const emailDd = el("dd");
      if (v.email) {
        const a = el("a", { href: `mailto:${v.email}` }, [v.email]);
        emailDd.appendChild(a);
      } else {
        emailDd.appendChild(document.createTextNode("—"));
      }
      dl.appendChild(emailDd);
      card.appendChild(dl);

      const actions = el("div", { className: "actions" });
      const copyAddr = el("button", { className: "btn", type: "button" }, ["复制地址"]) as HTMLButtonElement;
      copyAddr.addEventListener("click", () => copyText("地址", v.address, copyAddr));
      const copyAll = el("button", { className: "btn primary", type: "button" }, [
        "复制全部联系信息",
      ]) as HTMLButtonElement;
      copyAll.addEventListener("click", () => {
        const block = [
          v.name,
          v.address,
          v.phone ? `Tel: ${v.phone}` : "",
          v.email ? `E-Mail: ${v.email}` : "",
        ]
          .filter(Boolean)
          .join("\n");
        copyText("联系信息", block, copyAll);
      });
      actions.appendChild(copyAddr);
      actions.appendChild(copyAll);
      card.appendChild(actions);
      return card;
    }

    renderResultsOnly();
  }

  const footer = el("footer", { className: "site-footer" }, [
    "信息仅供参考，考试安排与报名资格以各机构及外管局最新规定为准。",
    el("br"),
    "Daten ohne Gewähr — bitte verbindliche Auskünfte bei der jeweiligen Stelle einholen.",
    el("br"),
    el("span", { className: "skip-top" }, [
      el(
        "a",
        { href: "#", id: "to-top" },
        ["返回顶部"]
      ),
    ]),
  ]);

  const topLink = footer.querySelector("#to-top");
  topLink?.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  for (const n of frag) {
    if (typeof n === "string") root.appendChild(document.createTextNode(n));
    else root.appendChild(n);
  }
  root.appendChild(footer);

  window.onhashchange = () => {
    const hid = stateFromHash();
    if (hid !== selectedId) {
      selectedId = hid;
      searchQuery = "";
      regionFilter = "";
      render();
    }
  };
}

async function bootstrap(): Promise<void> {
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !selectedId) return;
    selectedId = null;
    searchQuery = "";
    regionFilter = "";
    setHash(null);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  try {
    await loadData();
    selectedId = stateFromHash();
    render();
  } catch (e) {
    const root = document.getElementById("app");
    if (root) {
      root.textContent = e instanceof Error ? e.message : "加载失败";
    }
  }
}

bootstrap();

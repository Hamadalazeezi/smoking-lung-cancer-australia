// Loads each Vega-Lite spec from /charts and embeds it in the matching <div>.
// Specs are kept as separate JSON files so they're easy to inspect on GitHub
// (per the assignment's "human-readable JSON" requirement).

const charts = [
  { id: "vis-map-smoking", spec: "charts/01_map_smoking.json"        },
  { id: "vis-map-cancer",  spec: "charts/02_map_cancer.json"         },
  { id: "vis-bar-smoking", spec: "charts/03_bar_smoking_rank.json"   },
  { id: "vis-bar-cancer",  spec: "charts/04_bar_cancer_rank.json"    },
  { id: "vis-line-smoking",spec: "charts/05_line_smoking_trend.json" },
  { id: "vis-line-cancer", spec: "charts/06_line_cancer_trend.json"  },
  { id: "vis-scatter",     spec: "charts/07_scatter_smoking_vs_cancer.json" },
  { id: "vis-gender",      spec: "charts/08_gender_comparison.json"  },
  { id: "vis-age",         spec: "charts/09_age_group.json"          },
  { id: "vis-multiples",   spec: "charts/11_small_multiples.json"    },
  { id: "vis-summary",     spec: "charts/10_summary_custom.json"     },
  { id: "vis-map-cancer-state", spec: "charts/12_map_cancer_state.json" },
];

const embedOptions = {
  actions: { export: true, source: true, editor: true, compiled: false },
  renderer: "svg",
  config: {
    font: "Inter, system-ui, sans-serif",
    background: null,
    view: { stroke: null },
    axis: {
      labelFont: "Inter", titleFont: "Inter",
      labelColor: "#4a4a4a", titleColor: "#1a1a1a",
      grid: true, gridColor: "#ececec", domain: false, ticks: false,
      labelFontSize: 11, titleFontSize: 12, titlePadding: 8,
    },
    legend: {
      labelFont: "Inter", titleFont: "Inter",
      labelColor: "#4a4a4a", titleColor: "#1a1a1a",
      labelFontSize: 11, titleFontSize: 12,
    },
    title: {
      font: "Spectral", fontSize: 16, fontWeight: 600, color: "#1a1a1a",
      subtitleFont: "Inter", subtitleFontSize: 12, subtitleColor: "#4a4a4a",
      anchor: "start", offset: 10,
    },
    range: { ramp: { scheme: "oranges" }, category: ["#c0392b", "#2d6a4f", "#1f3a5f", "#b48413", "#5e548e", "#7a7a7a"] },
  },
};

const cacheBust = "?v=" + Date.now();

// Vega-Lite picks a data parser from the URL's file extension. Appending
// "?v=..." to a CSV URL makes the captured extension "csv?v=..." which
// falls through the whitelist and silently defaults to JSON, so we lock
// in format.type from the original extension before mutating the URL.
const KNOWN_FORMATS = ["json", "csv", "tsv", "dsv", "topojson"];
const inferFormatType = (url) => {
  const m = url.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
  return m && KNOWN_FORMATS.includes(m[1].toLowerCase()) ? m[1].toLowerCase() : null;
};

const bust = (node) => {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) return node.forEach(bust);
  if (node.url && typeof node.url === "string" && !node.url.includes("?")) {
    const t = inferFormatType(node.url);
    if (t && (!node.format || !node.format.type)) {
      node.format = Object.assign({}, node.format, { type: t });
    }
    node.url = node.url + cacheBust;
  }
  Object.values(node).forEach(bust);
};

document.addEventListener("DOMContentLoaded", () => {
  charts.forEach(({ id, spec }) => {
    const el = document.getElementById(id);
    if (!el) return;
    fetch(spec + cacheBust)
      .then((r) => r.json())
      .then((parsed) => {
        bust(parsed);
        return vegaEmbed("#" + id, parsed, embedOptions);
      })
      .catch((err) => {
        el.innerHTML = `<p style="color:#999;font-size:0.85rem">
          Could not load <code>${spec}</code>. Make sure the data file in
          <code>data/</code> exists. (${err.message})
        </p>`;
      });
  });
});

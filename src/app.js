const CLOUDS = ["aws","azure","gcp"];
const CLOUD_LABEL = {aws:"AWS", azure:"AZ", gcp:"GCP"};
const CLOUD_FULL = {aws:"AWS", azure:"Azure", gcp:"Google Cloud", uni:"neutral"};
/* ---------------- app logic ---------------- */
let lens = "aws";
let activeCat = "All";
let query = "";

const $entries = document.getElementById("entries");
const $chips = document.getElementById("chips");
const $q = document.getElementById("q");
const $count = document.getElementById("count");
const $lensWord = document.getElementById("lensWord");
const segButtons = document.querySelectorAll(".seg button");

const CATS = ["All", ...new Set(DATA.map(d => d.cat))];

function esc(s){ return s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

function hi(text){
  if(!query) return esc(text);
  const i = text.toLowerCase().indexOf(query);
  if(i === -1) return esc(text);
  return esc(text.slice(0,i)) + "<mark>" + esc(text.slice(i, i+query.length)) + "</mark>" + esc(text.slice(i+query.length));
}

function matches(e){
  if(activeCat !== "All" && e.cat !== activeCat) return false;
  if(!query) return true;
  const hay = [e.uni, e.cat,
    ...CLOUDS.flatMap(c => [e[c].n, e[c].d, e.tf[c]]),
    e.usage].join(" ").toLowerCase();
  return hay.includes(query);
}

function docUrl(raw){
  const isData = /\(data\)/.test(raw);
  const clean = raw.replace(/\s*\([^)]*\)/g, "").trim();
  if(!clean || clean === "\u2014") return null;
  let prov = null, name = null;
  if(clean.startsWith("aws_")){ prov = "aws"; name = clean.slice(4); }
  else if(clean.startsWith("azurerm_")){ prov = "azurerm"; name = clean.slice(8); }
  else if(clean.startsWith("google_")){ prov = "google"; name = clean.slice(7); }
  if(!prov) return null;
  return "https://registry.terraform.io/providers/hashicorp/" + prov + "/latest/docs/" + (isData ? "data-sources" : "resources") + "/" + name;
}

function orderClouds(){
  if(lens === "uni") return CLOUDS;
  return [lens, ...CLOUDS.filter(c => c !== lens)];
}

function render(){
  const list = DATA.filter(matches);
  $count.textContent = list.length + " of " + DATA.length + " entries";
  $lensWord.textContent = lens === "uni" ? "a neutral" : "the " + CLOUD_FULL[lens];

  if(!list.length){
    $entries.innerHTML = '<div class="empty">No entry found — try “bucket”, “firewall”, or a Terraform resource name.</div>';
    return;
  }

  $entries.innerHTML = list.map(e => {
    const order = orderClouds();
    const headword = lens === "uni" ? e.uni : e[lens].n;
    const senses = order.map(c => `
      <div class="sense${c === lens ? " native" : ""}">
        <span class="langtag ${c}">${CLOUD_LABEL[c]}</span>
        <div><span class="sname">${hi(e[c].n)}</span> <span class="snote">— ${hi(e[c].d)}</span></div>
      </div>`).join("");
    const tf = CLOUDS.map(c => {
      const r = e.tf[c];
      if(!r || r === "—") return "";
      const url = docUrl(r);
      const chip = `<code data-copy="${esc(r)}" title="Click to copy">${hi(r)}</code>`;
      const link = url ? `<a class="doclink" href="${url}" target="_blank" rel="noopener" title="Official provider docs — proof, not vibes">docs&nbsp;&#8599;</a>` : "";
      return `<span class="tfchip">${chip}${link}</span>`;
    }).join("");
    return `
    <article class="entry">
      <div class="head">
        <span class="word">${hi(headword)}</span>
        <span class="pos">${e.pos}</span>
      </div>
      ${lens !== "uni" ? `<div class="uni-name">universal: ${hi(e.uni)}</div>` : ""}
      <div class="senses">${senses}</div>
      <div class="usage"><b>Where the analogy breaks.</b> ${hi(e.usage)}</div>
      <div class="tf"><div class="tlbl">Terraform &middot; click name to copy &middot; docs = official registry page</div><div class="res">${tf}</div></div>
    </article>`;
  }).join("");
}

function setLens(l){
  lens = l;
  segButtons.forEach(b => {
    b.classList.remove("on-aws","on-azure","on-gcp","on-uni");
    if(b.dataset.lens === l) b.classList.add("on-" + l);
    b.setAttribute("aria-selected", b.dataset.lens === l ? "true" : "false");
  });
  render();
}

segButtons.forEach(b => b.addEventListener("click", () => setLens(b.dataset.lens)));

$chips.innerHTML = CATS.map(c => `<button class="chip${c==="All"?" active":""}" data-cat="${c}">${c}</button>`).join("");
$chips.addEventListener("click", ev => {
  const b = ev.target.closest(".chip"); if(!b) return;
  activeCat = b.dataset.cat;
  $chips.querySelectorAll(".chip").forEach(x => x.classList.toggle("active", x === b));
  render();
});

let t;
$q.addEventListener("input", () => {
  clearTimeout(t);
  t = setTimeout(() => { query = $q.value.trim().toLowerCase(); render(); }, 120);
});

$entries.addEventListener("click", ev => {
  const code = ev.target.closest("code[data-copy]"); if(!code) return;
  navigator.clipboard?.writeText(code.dataset.copy).then(() => {
    code.classList.add("copied");
    setTimeout(() => code.classList.remove("copied"), 900);
  });
});

setLens("aws");

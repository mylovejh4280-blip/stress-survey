const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $ = (id) => document.getElementById(id);
let profile = {};
let answers = new Array(ITEMS.length).fill(null);
let idx = 0;

function show(id) {
  for (const s of ["intro", "quiz", "opinion", "result"]) $(s).hidden = s !== id;
  window.scrollTo({ top: 0 });
}

$("profile").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  profile = {
    department: fd.get("department").trim() || null,
    position: fd.get("position") || null,
    tenure: fd.get("tenure") || null,
  };
  show("quiz");
  render();
});

function render() {
  const item = ITEMS[idx];
  $("qnum").textContent = idx + 1;
  $("bar").style.width = `${(idx / ITEMS.length) * 100}%`;
  $("qfactor").textContent = `${item.area} · ${item.name}`;
  $("qtext").textContent = item.t;
  $("prev").disabled = idx === 0;
  const box = $("choices");
  box.innerHTML = "";
  CHOICES.forEach((label, i) => {
    const v = i + 1;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "choice" + (answers[idx] === v ? " selected" : "");
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", answers[idx] === v);
    b.innerHTML = `<span class="n">${v}</span><span>${label}</span>`;
    b.addEventListener("click", () => choose(v));
    box.appendChild(b);
  });
}

function choose(v) {
  answers[idx] = v;
  render();
  setTimeout(() => {
    if (idx < ITEMS.length - 1) { idx++; render(); }
    else show("opinion");
  }, 180);
}

$("prev").addEventListener("click", () => { if (idx > 0) { idx--; render(); } });
$("back").addEventListener("click", () => { show("quiz"); render(); });

document.addEventListener("keydown", (e) => {
  if ($("quiz").hidden) return;
  const n = Number(e.key);
  if (n >= 1 && n <= 4) choose(n);
});

$("submit").addEventListener("click", async () => {
  $("submit").disabled = true;
  const scores = ITEMS.map((item, i) => itemScore(item, answers[i]));
  const total = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const level = levelOf(total);

  $("rtotal").textContent = total;
  $("rlevel").textContent = level.label;
  $("rlevel").classList.toggle("low", total >= 50);
  $("rdesc").textContent = level.desc;

  const ranked = ITEMS.map((item, i) => ({ item, s: scores[i] }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);
  $("top3").innerHTML = ranked
    .map(({ item, s }) => `<li><b>${item.name}</b> (${s}점) — <span class="fine">${item.tip}</span></li>`)
    .join("");

  $("factors").innerHTML = ITEMS.map((item, i) => `
    <div class="factor ${barClass(scores[i])}">
      <div class="top"><span>${item.name}</span><span>${scores[i]}</span></div>
      <div class="track"><div class="fill" style="width:${Math.max(scores[i], 2)}%"></div></div>
    </div>`).join("");

  show("result");
  $("saveStatus").textContent = "응답을 저장하는 중…";
  const comment = $("comment").value.trim() || null;
  const { error } = await db.from("stress_responses").insert({
    ...profile,
    answers,
    item_scores: scores,
    total_score: total,
    level: level.label,
    comment,
  });
  $("saveStatus").textContent = error
    ? "응답 저장에 실패했어요. 잠시 후 다시 시도해 주세요."
    : "응답이 익명으로 저장되었습니다. 참여해 주셔서 감사합니다!";
});

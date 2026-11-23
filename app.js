(function () {
  "use strict";

  const COURSE = window.COURSE;
  const lessons = COURSE.lessons;
  const PAGES = [
    ...lessons.map((l) => ({ id: l.id, title: l.title })),
    { id: "final", title: "Final quiz" },
    { id: "cheatsheet", title: "Cheat sheet" },
  ];
  const STORAGE_KEY = "c-from-zero:v1";

  const main = document.getElementById("main");
  const article = document.getElementById("lesson");
  const nav = document.getElementById("lesson-nav");
  const bar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const menuBtn = document.getElementById("menu-btn");
  const backdrop = document.querySelector(".backdrop");

  let currentId = "hello";
  let snippets = [];

  function freshState() {
    return { done: {}, quiz: {}, challenge: {}, final: {} };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return freshState();
      return {
        done: saved.done || {},
        quiz: saved.quiz || {},
        challenge: saved.challenge || {},
        final: saved.final || {},
      };
    } catch (err) {
      return freshState();
    }
  }

  let state = loadState();

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      /* Storage can be disabled; the course still works without progress. */
    }
  }

  /* ---------- small rendering helpers ---------- */

  const esc = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const inline = (value) =>
    esc(value)
      // A code span ending in "]" needs three closing brackets: [[a[5]]]
      .replace(/\[\[((?:(?!\[\[).)+?)\]\]\]/g, "<code>$1]</code>")
      .replace(/\[\[(.+?)\]\]/g, "<code>$1</code>");

  const norm = (value) =>
    String(value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/^["']+|["']+$/g, "");

  const CODE_RE =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(^[ \t]*#[ \t]*\w+(?:[ \t]*(?:<[^>\n]+>|&lt;[^&\n]+&gt;))?)|(\b(?:auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|restrict|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|NULL)\b)|(\b[A-Za-z_]\w*(?=\s*\())|(\b\d+(?:\.\d+)?\b)/gm;

  function highlight(code) {
    return esc(code).replace(CODE_RE, (match, comment, str, dir, kw, fn, num) => {
      if (comment) return `<span class="tok-com">${comment}</span>`;
      if (str) return `<span class="tok-str">${str}</span>`;
      if (dir) return `<span class="tok-dir">${dir}</span>`;
      if (kw) return `<span class="tok-kw">${kw}</span>`;
      if (fn) return `<span class="tok-fn">${fn}</span>`;
      if (num) return `<span class="tok-num">${num}</span>`;
      return match;
    });
  }

  function codeCard(code, file) {
    const index = snippets.push(code) - 1;
    return `<div class="code-card">
      <div class="code-head">
        <span class="filename">${esc(file)}</span>
        <button type="button" class="copy-btn" data-copy="${index}" aria-label="Copy this code">Copy</button>
      </div>
      <pre class="code"><code>${highlight(code)}</code></pre>
    </div>`;
  }

  function renderBlock(block) {
    if (block.p) return `<p>${inline(block.p)}</p>`;
    if (block.code) return codeCard(block.code, block.file || "example.c");
    if (block.out) return `<pre class="out" aria-label="Program output">${esc(block.out)}</pre>`;
    if (block.note) return `<aside class="note">${inline(block.note)}</aside>`;
    if (block.list) {
      return `<ul class="lesson-list">${block.list
        .map((item) => `<li>${inline(item)}</li>`)
        .join("")}</ul>`;
    }
    if (block.shell) {
      const lines = block.shell
        .split("\n")
        .map((line) => `$ ${line}`)
        .join("\n");
      return `<div class="code-card">
        <div class="code-head"><span class="filename">Terminal</span></div>
        <pre class="code shell"><code>${esc(lines)}</code></pre>
      </div>`;
    }
    return "";
  }

  function pager(id) {
    const index = PAGES.findIndex((page) => page.id === id);
    const prev = PAGES[index - 1];
    const next = PAGES[index + 1];
    return `<nav class="pager" aria-label="Lesson navigation">
      ${
        prev
          ? `<a href="#${prev.id}" rel="prev"><span class="dir">Previous</span><span>${esc(prev.title)}</span></a>`
          : "<span></span>"
      }
      ${
        next
          ? `<a class="next" href="#${next.id}" rel="next"><span class="dir">Next</span><span>${esc(next.title)}</span></a>`
          : "<span></span>"
      }
    </nav>`;
  }

  /* ---------- lesson page ---------- */

  function quizSection(lesson) {
    const options = lesson.quiz.options
      .map(
        (option, index) =>
          `<button type="button" class="option" data-index="${index}">
            <span class="letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
            <span>${inline(option)}</span>
          </button>`
      )
      .join("");

    return `<section class="card quiz-card" data-lesson="${lesson.id}">
      <p class="card-label">Check yourself</p>
      <h2>Quick check</h2>
      <p class="q-text">${inline(lesson.quiz.q)}</p>
      <div class="options">${options}</div>
      <div class="feedback" role="status" aria-live="polite" hidden></div>
    </section>`;
  }

  function challengeSection(lesson) {
    const challenge = lesson.challenge;
    const solved = Boolean(state.challenge[lesson.id]);

    let blankIndex = 0;
    const tagged = challenge.template.replace(/___/g, () => `@@B${blankIndex++}@@`);
    let html = highlight(tagged);
    html = html.replace(/@@B(\d+)@@/g, (match, index) => {
      const answer = challenge.answers[index][0];
      if (solved) return `<span class="blank filled">${esc(answer)}</span>`;
      const width = Math.min(30, Math.max(6, answer.length + 2));
      return `<input class="blank" type="text" data-blank="${index}" aria-label="Answer blank ${
        Number(index) + 1
      }" size="${width}" style="width:${width}ch" autocomplete="off" spellcheck="false">`;
    });

    const actions = solved
      ? `<div class="feedback good"><strong>Solved.</strong> ${inline(challenge.why)}</div>`
      : `<div class="challenge-actions">
          <button type="button" class="btn primary" data-check>Check answer</button>
          <button type="button" class="btn ghost" data-hint aria-expanded="false" aria-controls="hint-${lesson.id}">Hint</button>
          <span class="challenge-state" aria-hidden="true"></span>
        </div>
        <p class="hint" id="hint-${lesson.id}" hidden>${inline(challenge.hint)}</p>
        <div class="feedback" role="status" aria-live="polite" hidden></div>`;

    return `<section class="card challenge-card" data-lesson="${lesson.id}">
      <p class="card-label">Write code</p>
      <h2>Fill in the blanks</h2>
      <p>${inline(challenge.prompt)}</p>
      <div class="code-card">
        <div class="code-head">
          <span class="filename">exercise.c</span>
          <span class="challenge-state">${solved ? "Solved" : "Unsolved"}</span>
        </div>
        <pre class="code"><code>${html}</code></pre>
      </div>
      ${actions}
    </section>`;
  }

  function renderLesson(lesson) {
    snippets = [];
    const done = Boolean(state.done[lesson.id]);

    article.innerHTML = `<header class="lesson-head">
        <div class="meta">
          <span class="pill level ${lesson.level}">${lesson.level}</span>
          <span class="pill">${lesson.minutes} min</span>
          <span class="pill done-pill" id="done-pill" ${done ? "" : "hidden"}>✓ Completed</span>
        </div>
        <h1 tabindex="-1">${esc(lesson.title)}</h1>
        <p class="goal">${inline(lesson.goal)}</p>
      </header>
      <div class="blocks">${lesson.blocks.map(renderBlock).join("")}</div>
      ${quizSection(lesson)}
      ${challengeSection(lesson)}
      ${pager(lesson.id)}`;

    paintQuiz(lesson);
  }

  function paintQuiz(lesson) {
    const card = document.querySelector(`.quiz-card[data-lesson="${lesson.id}"]`);
    if (!card) return;
    const chosen = state.quiz[lesson.id];
    const isCorrect = chosen === lesson.quiz.answer;

    card.querySelectorAll(".option").forEach((button, index) => {
      button.classList.remove("correct", "wrong");
      button.disabled = false;
      if (chosen === undefined) return;
      if (index === lesson.quiz.answer) button.classList.add("correct");
      if (index === chosen && !isCorrect) button.classList.add("wrong");
      if (isCorrect) button.disabled = true;
    });

    const feedback = card.querySelector(".feedback");
    if (chosen === undefined) {
      feedback.hidden = true;
      return;
    }
    feedback.hidden = false;
    feedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
    feedback.innerHTML = `<strong>${isCorrect ? "Correct." : "Not quite."}</strong> ${inline(
      lesson.quiz.why
    )}`;
  }

  function maybeComplete(lesson) {
    if (state.done[lesson.id]) return;
    if (state.quiz[lesson.id] !== lesson.quiz.answer || !state.challenge[lesson.id]) return;
    state.done[lesson.id] = true;
    save();
    renderProgress();
    renderNav();
    const pill = document.getElementById("done-pill");
    if (pill) pill.hidden = false;
  }

  function checkChallenge(card) {
    const lesson = lessons.find((item) => item.id === card.dataset.lesson);
    if (!lesson) return;
    const inputs = Array.from(card.querySelectorAll("input.blank"));
    if (!inputs.length) return;

    let allGood = true;
    inputs.forEach((input, index) => {
      const accepted = (lesson.challenge.answers[index] || []).map(norm);
      const good = accepted.includes(norm(input.value));
      input.classList.toggle("ok", good);
      input.classList.toggle("bad", !good);
      if (!good) allGood = false;
    });

    const feedback = card.querySelector(".feedback");
    if (!allGood) {
      feedback.hidden = false;
      feedback.className = "feedback bad";
      feedback.innerHTML = "<strong>Not yet.</strong> Check the hint and try again.";
      return;
    }

    state.challenge[lesson.id] = true;
    save();
    feedback.hidden = false;
    feedback.className = "feedback good";
    feedback.innerHTML = `<strong>Solved.</strong> ${inline(lesson.challenge.why)}`;
    const checkButton = card.querySelector("[data-check]");
    if (checkButton) checkButton.hidden = true;
    const hintButton = card.querySelector("[data-hint]");
    if (hintButton) hintButton.hidden = true;
    const hint = card.querySelector(".hint");
    if (hint) hint.hidden = true;
    const status = card.querySelector(".code-head .challenge-state");
    if (status) status.textContent = "Solved";
    maybeComplete(lesson);
  }

  /* ---------- final quiz ---------- */

  function finalCard(question, index) {
    const options = question.options
      .map(
        (option, optionIndex) =>
          `<button type="button" class="option" data-index="${optionIndex}">
            <span class="letter" aria-hidden="true">${String.fromCharCode(65 + optionIndex)}</span>
            <span>${inline(option)}</span>
          </button>`
      )
      .join("");
    return `<article class="card final-card" data-q="${index}">
      <div class="q-head">
        <span class="q-num" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
        <p class="q-text">${inline(question.q)}</p>
      </div>
      <div class="options">${options}</div>
      <div class="feedback" role="status" aria-live="polite" hidden></div>
    </article>`;
  }

  function renderFinal() {
    snippets = [];
    article.innerHTML = `<header class="lesson-head">
        <div class="meta">
          <span class="pill level final">wrap up</span>
          <span class="pill">${COURSE.finalQuiz.length} questions</span>
        </div>
        <h1 tabindex="-1">Final quiz</h1>
        <p class="goal">Ten mixed questions from the whole course. Answer each one correctly to finish.</p>
      </header>
      <div class="score" id="final-score">0 / ${COURSE.finalQuiz.length} correct</div>
      ${COURSE.finalQuiz.map(finalCard).join("")}
      <div class="final-banner" id="final-banner" hidden>
        <h2>Course complete</h2>
        <p>You answered every question correctly. Keep the cheat sheet nearby, and write small C programs often.</p>
        <a class="btn primary" href="#cheatsheet">Open the cheat sheet</a>
      </div>
      ${pager("final")}`;

    COURSE.finalQuiz.forEach((_, index) => paintFinal(index));
    updateFinalScore();
  }

  function paintFinal(index) {
    const question = COURSE.finalQuiz[index];
    const card = document.querySelector(`.final-card[data-q="${index}"]`);
    if (!card) return;
    const chosen = state.final[index];
    const isCorrect = chosen === question.answer;

    card.querySelectorAll(".option").forEach((button, optionIndex) => {
      button.classList.remove("correct", "wrong");
      button.disabled = isCorrect;
      if (chosen === undefined) return;
      if (optionIndex === question.answer) button.classList.add("correct");
      if (optionIndex === chosen && !isCorrect) button.classList.add("wrong");
    });

    const feedback = card.querySelector(".feedback");
    if (chosen === undefined) {
      feedback.hidden = true;
      return;
    }
    feedback.hidden = false;
    feedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
    feedback.innerHTML = `<strong>${isCorrect ? "Correct." : "Not quite."}</strong> ${inline(
      question.why
    )}`;
  }

  function updateFinalScore() {
    const correct = COURSE.finalQuiz.reduce(
      (count, question, index) => count + (state.final[index] === question.answer ? 1 : 0),
      0
    );
    const score = document.getElementById("final-score");
    if (score) score.textContent = `${correct} / ${COURSE.finalQuiz.length} correct`;
    const banner = document.getElementById("final-banner");
    if (banner) banner.hidden = correct !== COURSE.finalQuiz.length;
  }

  /* ---------- cheat sheet ---------- */

  function renderCheatSheet() {
    snippets = [];
    article.innerHTML = `<header class="lesson-head">
        <div class="meta"><span class="pill level reference">reference</span></div>
        <h1 tabindex="-1">Cheat sheet</h1>
        <p class="goal">The syntax and library calls you will reach for most often.</p>
      </header>

      <section class="card">
        <h2>Types and format specifiers</h2>
        <div class="table-scroll"><table class="cheat-table">
          <thead><tr><th>Type</th><th>Usually</th><th>printf</th><th>scanf</th><th>Example</th></tr></thead>
          <tbody>
            <tr><td><code>char</code></td><td>1 byte</td><td><code>%c</code></td><td><code>%c</code></td><td><code>'A'</code></td></tr>
            <tr><td><code>int</code></td><td>4 bytes</td><td><code>%d</code></td><td><code>%d</code></td><td><code>42</code></td></tr>
            <tr><td><code>long</code></td><td>4–8 bytes</td><td><code>%ld</code></td><td><code>%ld</code></td><td><code>90000L</code></td></tr>
            <tr><td><code>float</code></td><td>4 bytes</td><td><code>%f</code></td><td><code>%f</code></td><td><code>3.5f</code></td></tr>
            <tr><td><code>double</code></td><td>8 bytes</td><td><code>%f</code></td><td><code>%lf</code></td><td><code>3.5</code></td></tr>
            <tr><td><code>char[]</code></td><td>length + 1</td><td><code>%s</code></td><td><code>%s</code></td><td><code>"Ada"</code></td></tr>
            <tr><td><code>void *</code></td><td>pointer</td><td><code>%p</code></td><td>—</td><td><code>&amp;x</code></td></tr>
          </tbody>
        </table></div>
        <p>Sizes vary by platform; use <code>sizeof</code> when it matters. A string always needs room for the terminating <code>'\\0'</code>.</p>
      </section>

      <section class="card">
        <h2>Operators</h2>
        <ul class="lesson-list">
          <li><code>+ - * / %</code> arithmetic; <code>/</code> truncates when both operands are integers</li>
          <li><code>== != &lt; &lt;= &gt; &gt;=</code> comparison — result is <code>1</code> or <code>0</code></li>
          <li><code>&amp;&amp; || !</code> logical and, or, not</li>
          <li><code>=</code> assigns, <code>==</code> compares. Never swap them.</li>
          <li><code>&amp;x</code> address of <code>x</code>; <code>*p</code> value at <code>p</code>; <code>p-&gt;field</code> member through a pointer</li>
          <li><code>sizeof(type)</code> or <code>sizeof variable</code> gives a size in bytes</li>
        </ul>
      </section>

      <section class="card">
        <h2>Control flow</h2>
        <pre class="code"><code>${highlight(
          `if (x > 0) {
    printf("positive\\n");
} else if (x == 0) {
    printf("zero\\n");
} else {
    printf("negative\\n");
}

for (int i = 0; i < 10; i++) {
    printf("%d\\n", i);
}

while (x > 0) {
    x--;
}`,
          "flow.c"
        )}</code></pre>
      </section>

      <section class="card">
        <h2>Standard library</h2>
        <div class="table-scroll"><table class="cheat-table">
          <thead><tr><th>Header</th><th>Function</th><th>Purpose</th></tr></thead>
          <tbody>
            <tr><td><code>&lt;stdio.h&gt;</code></td><td><code>printf</code>, <code>scanf</code></td><td>Formatted console I/O</td></tr>
            <tr><td><code>&lt;stdio.h&gt;</code></td><td><code>fopen</code>, <code>fclose</code></td><td>Open and close a file</td></tr>
            <tr><td><code>&lt;stdio.h&gt;</code></td><td><code>fprintf</code>, <code>fgets</code></td><td>Formatted file write, safe line read</td></tr>
            <tr><td><code>&lt;stdlib.h&gt;</code></td><td><code>malloc</code>, <code>free</code></td><td>Heap allocation and release</td></tr>
            <tr><td><code>&lt;stdlib.h&gt;</code></td><td><code>atoi</code></td><td>String to int</td></tr>
            <tr><td><code>&lt;string.h&gt;</code></td><td><code>strlen</code>, <code>strcmp</code></td><td>String length and comparison</td></tr>
            <tr><td><code>&lt;string.h&gt;</code></td><td><code>strcpy</code>, <code>strncpy</code></td><td>Copy a string (mind the buffer size)</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="card">
        <h2>Build and debug</h2>
        <div class="code-card">
          <div class="code-head"><span class="filename">Terminal</span></div>
          <pre class="code shell"><code>${esc(
            "$ gcc -Wall -Wextra -g hello.c -o hello\n$ ./hello\n\n$ gcc -g -fsanitize=address,undefined hello.c -o hello"
          )}</code></pre>
        </div>
        <ul class="lesson-list">
          <li>Warnings are bugs in waiting. Read the first one first.</li>
          <li>Uninitialized local variables hold garbage; initialize them.</li>
          <li>Array indexes run from <code>0</code> to <code>size - 1</code>.</li>
          <li>Every <code>malloc</code> gets exactly one <code>free</code>.</li>
          <li><code>scanf</code> needs the address (<code>&amp;x</code>) and the right specifier (<code>%lf</code> for <code>double</code>).</li>
          <li>Prefer <code>fgets</code> over <code>gets</code> and unchecked <code>%s</code>.</li>
        </ul>
      </section>

      ${pager("cheatsheet")}`;
  }

  /* ---------- chrome: nav, progress, menu ---------- */

  function renderNav() {
    const groups = [
      ["Beginner", lessons.filter((lesson) => lesson.level === "beginner")],
      ["Intermediate", lessons.filter((lesson) => lesson.level === "intermediate")],
      [
        "Finish",
        [
          { id: "final", title: "Final quiz", icon: "★" },
          { id: "cheatsheet", title: "Cheat sheet", icon: "§" },
        ],
      ],
    ];

    nav.innerHTML = groups
      .map(
        ([label, items]) => `<div class="nav-group">
          <p class="nav-label">${label}</p>
          ${items
            .map((item) => {
              const isDone = Boolean(state.done[item.id]);
              const isCurrent = currentId === item.id;
              const icon =
                item.icon || String(lessons.findIndex((lesson) => lesson.id === item.id) + 1).padStart(2, "0");
              return `<a class="nav-item${isDone ? " done" : ""}" href="#${item.id}"${
                isCurrent ? ' aria-current="page"' : ""
              }>
                <span class="nav-num" aria-hidden="true">${icon}</span>
                <span class="nav-title">${esc(item.title)}</span>
                ${isDone ? '<span class="nav-check" aria-label="completed">✓</span>' : ""}
              </a>`;
            })
            .join("")}
        </div>`
      )
      .join("");
  }

  function renderProgress() {
    const total = lessons.length;
    const done = lessons.filter((lesson) => state.done[lesson.id]).length;
    const percent = Math.round((done / total) * 100);
    bar.style.width = `${percent}%`;
    bar.parentElement.setAttribute("aria-valuenow", String(percent));
    progressText.textContent = `${done}/${total}`;
  }

  function closeMenu() {
    document.body.classList.remove("nav-open");
    menuBtn.setAttribute("aria-expanded", "false");
  }

  function titleFor(id) {
    const lesson = lessons.find((item) => item.id === id);
    if (lesson) return lesson.title;
    if (id === "final") return "Final quiz";
    if (id === "cheatsheet") return "Cheat sheet";
    return "C From Zero";
  }

  function route() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id === "final") {
      currentId = "final";
      renderFinal();
    } else if (id === "cheatsheet") {
      currentId = "cheatsheet";
      renderCheatSheet();
    } else {
      const lesson = lessons.find((item) => item.id === id);
      if (!lesson) {
        if (id) {
          location.hash = lessons[0].id;
          return;
        }
        currentId = lessons[0].id;
        renderLesson(lessons[0]);
      } else {
        currentId = lesson.id;
        renderLesson(lesson);
      }
    }
    renderNav();
    renderProgress();
    closeMenu();
    document.title = `${titleFor(currentId)} — C From Zero`;
    const heading = article.querySelector("h1");
    if (heading) heading.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  /* ---------- events ---------- */

  main.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-copy]");
    if (copyButton) {
      copyText(snippets[Number(copyButton.dataset.copy)], copyButton);
      return;
    }

    const checkButton = event.target.closest("[data-check]");
    if (checkButton) {
      const card = checkButton.closest(".challenge-card");
      if (card) checkChallenge(card);
      return;
    }

    const hintButton = event.target.closest("[data-hint]");
    if (hintButton) {
      const hint = document.getElementById(hintButton.getAttribute("aria-controls"));
      if (hint) {
        const open = hint.hidden;
        hint.hidden = !open;
        hintButton.setAttribute("aria-expanded", String(open));
      }
      return;
    }

    const option = event.target.closest(".option");
    if (!option) return;

    const quizCard = option.closest(".quiz-card");
    if (quizCard && quizCard.dataset.lesson) {
      const lesson = lessons.find((item) => item.id === quizCard.dataset.lesson);
      if (!lesson || state.quiz[lesson.id] === lesson.quiz.answer) return;
      state.quiz[lesson.id] = Number(option.dataset.index);
      save();
      paintQuiz(lesson);
      maybeComplete(lesson);
      return;
    }

    const finalCardElement = option.closest(".final-card");
    if (finalCardElement) {
      const index = Number(finalCardElement.dataset.q);
      const question = COURSE.finalQuiz[index];
      if (!question || state.final[index] === question.answer) return;
      state.final[index] = Number(option.dataset.index);
      save();
      paintFinal(index);
      updateFinalScore();
    }
  });

  main.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || !event.target.classList.contains("blank")) return;
    const card = event.target.closest(".challenge-card");
    if (!card) return;
    event.preventDefault();
    checkChallenge(card);
  });

  menuBtn.addEventListener("click", () => {
    const open = !document.body.classList.contains("nav-open");
    document.body.classList.toggle("nav-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    if (open) document.getElementById("sidebar").scrollTop = 0;
  });

  backdrop.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    if (!confirm("Reset all progress and answers?")) return;
    state = freshState();
    save();
    route();
  });

  window.addEventListener("hashchange", route);

  function copyText(text, button) {
    const done = () => {
      const original = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = original;
      }, 1400);
    };
    const fallback = () => {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
        done();
      } catch (err) {
        /* Clipboard is unavailable; leave the button unchanged. */
      }
      area.remove();
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
  }

  /* ---------- boot ---------- */

  const totalMinutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  document.getElementById("course-meta").textContent = `${lessons.length} lessons · ${
    hours ? `${hours} h ` : ""
  }${mins} min`;

  if (!location.hash) history.replaceState(null, "", `#${lessons[0].id}`);
  route();
})();

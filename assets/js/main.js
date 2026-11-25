/* ==========================================================================
   main.js — 主题 / 导航 / 动效 / 命令面板 / 通用交互
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var SITE = window.SITE || {};
  var meta = SITE.meta || {};
  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = reduceQuery.matches;

  /* ------------------------------------------------------------------
     DOM 小工具
     ------------------------------------------------------------------ */
  function el(tag, props) {
    var node = doc.createElement(tag);
    var children = Array.prototype.slice.call(arguments, 2);

    if (props) {
      Object.keys(props).forEach(function (key) {
        var value = props[key];
        if (value === null || value === undefined || value === false) return;
        if (key === "class") {
          node.className = value;
        } else if (key === "text") {
          node.textContent = value;
        } else if (key === "dataset") {
          Object.assign(node.dataset, value);
        } else if (key === "attrs") {
          Object.keys(value).forEach(function (attr) {
            var attrValue = value[attr];
            if (attrValue === null || attrValue === undefined || attrValue === false) return;
            node.setAttribute(attr, attrValue);
          });
        } else if (key.indexOf("on") === 0 && typeof value === "function") {
          node.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
          node[key] = value;
        }
      });
    }

    children.flat().forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      node.append(child.nodeType ? child : doc.createTextNode(String(child)));
    });

    return node;
  }

  /* ------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------ */
  var toastEl = null;
  var toastTimer = 0;

  function toast(message) {
    if (!toastEl) {
      toastEl = el("div", {
        class: "toast",
        attrs: { role: "status", "aria-live": "polite" }
      });
      doc.body.append(toastEl);
    }
    toastEl.textContent = message;
    void toastEl.offsetWidth;
    toastEl.classList.add("is-show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 3200);
  }

  /* ------------------------------------------------------------------
     滚动淡入
     ------------------------------------------------------------------ */
  var revealObserver = null;

  if ("IntersectionObserver" in window && !reduceMotion) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
  }

  function observeReveals(scope) {
    var nodes = (scope || doc).querySelectorAll(".reveal:not(.is-visible)");
    nodes.forEach(function (node) {
      if (revealObserver) {
        revealObserver.observe(node);
      } else {
        node.classList.add("is-visible");
      }
    });
  }

  /* ------------------------------------------------------------------
     主题
     ------------------------------------------------------------------ */
  var themeMeta = doc.querySelector('meta[name="theme-color"]');

  function currentTheme() {
    return root.dataset.theme === "light" ? "light" : "dark";
  }

  function syncThemeUi() {
    var light = currentTheme() === "light";
    doc.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      var label = light ? "切换到暗色主题" : "切换到亮色主题";
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
    });
    if (themeMeta) {
      themeMeta.setAttribute("content", light ? "#f3f7f4" : "#05080c");
    }
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch (error) {
      /* 隐私模式下忽略 */
    }
    syncThemeUi();
    refreshMatrixColors();
  }

  doc.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTheme(currentTheme() === "light" ? "dark" : "light");
    });
  });
  syncThemeUi();

  /* ------------------------------------------------------------------
     背景动效开关
     ------------------------------------------------------------------ */
  function effectsOn() {
    return root.dataset.effects !== "off";
  }

  function syncEffectsUi() {
    var on = effectsOn();
    doc.querySelectorAll("[data-effects-toggle]").forEach(function (btn) {
      btn.textContent = on ? "背景动效：开" : "背景动效：关";
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  function setEffects(on) {
    root.dataset.effects = on ? "on" : "off";
    try {
      localStorage.setItem("effects", on ? "on" : "off");
    } catch (error) {
      /* ignore */
    }
    syncEffectsUi();
    if (on) {
      startMatrix();
    } else {
      stopMatrix();
    }
  }

  doc.querySelectorAll("[data-effects-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setEffects(!effectsOn());
    });
  });
  syncEffectsUi();

  /* ------------------------------------------------------------------
     移动端菜单 / 当前页导航
     ------------------------------------------------------------------ */
  var header = doc.getElementById("site-header");
  var menuToggle = doc.querySelector("[data-menu-toggle]");

  function closeMenu() {
    if (!header) return;
    header.classList.remove("is-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "打开菜单");
    }
  }

  if (header && menuToggle) {
    menuToggle.addEventListener("click", function () {
      var open = !header.classList.contains("is-open");
      header.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });

    doc.addEventListener("click", function (event) {
      if (!header.classList.contains("is-open")) return;
      if (header.contains(event.target)) return;
      closeMenu();
    });
  }

  doc.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  var pageFile = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  doc.querySelectorAll("[data-nav]").forEach(function (link) {
    var key = link.dataset.nav;
    var active =
      (key === "index" && pageFile === "index.html") ||
      key === pageFile.replace(".html", "");
    if (active) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  /* ------------------------------------------------------------------
     数据绑定：姓名 / 昵称 / 地区 / 邮箱 / 社交链接 / 年份
     data-bind="name|handle|location|email"  → 写入文本（email 同时写 href）
     data-bind="<social.id>"                 → 写入链接 href
     data-bind-text="<social.id>"            → 写入去掉协议后的链接文本
     ------------------------------------------------------------------ */
  function bindSiteData() {
    var textBindings = {
      name: meta.name,
      handle: meta.handle,
      location: meta.location,
      email: meta.email
    };

    Object.keys(textBindings).forEach(function (key) {
      var value = textBindings[key];
      if (!value) return;
      doc.querySelectorAll('[data-bind="' + key + '"]').forEach(function (node) {
        if (key === "email" && node.tagName === "A") {
          node.setAttribute("href", "mailto:" + value);
        }
        node.textContent = value;
      });
    });

    (SITE.socials || []).forEach(function (social) {
      var url = social.id === "email" && meta.email ? "mailto:" + meta.email : social.url;
      if (!url) return;
      doc.querySelectorAll('[data-bind="' + social.id + '"]').forEach(function (node) {
        if (node.tagName === "A") {
          node.setAttribute("href", url);
        }
      });
      doc.querySelectorAll('[data-bind-text="' + social.id + '"]').forEach(function (node) {
        node.textContent = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
      });
    });

    doc.querySelectorAll("[data-year]").forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  bindSiteData();

  /* ------------------------------------------------------------------
     复制邮箱
     ------------------------------------------------------------------ */
  function copyEmail() {
    var email = meta.email || "";
    if (!email) return;

    function fallback() {
      var area = el("textarea", { attrs: { readonly: "" } });
      area.value = email;
      area.style.position = "fixed";
      area.style.opacity = "0";
      doc.body.append(area);
      area.select();
      try {
        doc.execCommand("copy");
        toast("邮箱已复制：" + email);
      } catch (error) {
        toast("复制失败，请手动选择邮箱：" + email);
      }
      area.remove();
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(email).then(
        function () {
          toast("邮箱已复制：" + email);
        },
        fallback
      );
    } else {
      fallback();
    }
  }

  doc.querySelectorAll("[data-copy-email]").forEach(function (btn) {
    btn.addEventListener("click", copyEmail);
  });

  /* ------------------------------------------------------------------
     占位链接拦截
     ------------------------------------------------------------------ */
  doc.addEventListener("click", function (event) {
    var link = event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;

    var href = link.getAttribute("href") || "";
    var placeholder =
      link.hasAttribute("data-todo") || /yourname|example\.com|^#$/i.test(href);

    if (!placeholder) return;
    if (href.charAt(0) === "#" && href.length > 1) return;

    event.preventDefault();
    toast("占位链接：请在 assets/js/data.js 或 HTML 中替换为真实地址");
  });

  /* ------------------------------------------------------------------
     打印简历
     ------------------------------------------------------------------ */
  doc.querySelectorAll("[data-print]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.print();
    });
  });

  /* ------------------------------------------------------------------
     身份打字机
     ------------------------------------------------------------------ */
  var roleEl = doc.getElementById("role-text");

  if (roleEl) {
    var roles = (meta.roles && meta.roles.length
      ? meta.roles
      : (roleEl.dataset.roles || "").split(",")
    )
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);

    if (roles.length) {
      roleEl.textContent = roles[0];

      if (!reduceMotion && roles.length > 1) {
        var roleIndex = 0;
        var charCount = roles[0].length;
        var deleting = false;
        var typeTimer = 0;

        var tick = function () {
          if (reduceMotion) {
            roleEl.textContent = roles[0];
            return;
          }

          var word = roles[roleIndex];

          if (deleting) {
            charCount -= 1;
            roleEl.textContent = word.slice(0, Math.max(0, charCount));
            if (charCount <= 0) {
              deleting = false;
              roleIndex = (roleIndex + 1) % roles.length;
              typeTimer = window.setTimeout(tick, 320);
            } else {
              typeTimer = window.setTimeout(tick, 38);
            }
          } else {
            charCount += 1;
            roleEl.textContent = word.slice(0, charCount);
            if (charCount >= word.length) {
              deleting = true;
              typeTimer = window.setTimeout(tick, 1900);
            } else {
              typeTimer = window.setTimeout(tick, 95);
            }
          }
        };

        typeTimer = window.setTimeout(tick, 1900);

        if (reduceQuery.addEventListener) {
          reduceQuery.addEventListener("change", function (event) {
            reduceMotion = event.matches;
            if (reduceMotion) {
              window.clearTimeout(typeTimer);
              roleEl.textContent = roles[0];
            }
          });
        }
      }
    }
  }

  /* ------------------------------------------------------------------
     矩阵雨背景
     ------------------------------------------------------------------ */
  var canvas = doc.getElementById("matrix");
  var ctx = null;
  var matrixFrame = 0;
  var matrixOn = false;
  var lastDraw = 0;
  var mW = 0;
  var mH = 0;
  var mCols = 0;
  var mDrops = [];
  var mFont = 15;
  var colorBg = "rgba(5,8,12,0.085)";
  var colorA = "#38f2a5";
  var colorB = "#4cc9f0";
  var GLYPHS = "0123456789{}[]<>/\\|=+-*&^%$#@!;:ABCDEFGHIJKLMNOPQRSTUVWXYZXabcdefghijklmnopqrstuvwxyz".split("");

  function readVar(name, fallback) {
    var value = getComputedStyle(root).getPropertyValue(name).trim();
    return value || fallback;
  }

  function hexToRgba(hex, alpha) {
    var value = hex.replace("#", "");
    if (value.length !== 6) return "rgba(5,8,12," + alpha + ")";
    var num = parseInt(value, 16);
    return (
      "rgba(" +
      ((num >> 16) & 255) +
      "," +
      ((num >> 8) & 255) +
      "," +
      (num & 255) +
      "," +
      alpha +
      ")"
    );
  }

  function refreshMatrixColors() {
    colorBg = hexToRgba(readVar("--bg", "#05080c"), 0.11);
    colorA = readVar("--accent", "#38f2a5");
    colorB = readVar("--accent-2", "#4cc9f0");
    if (ctx && mW && mH) {
      ctx.clearRect(0, 0, mW, mH);
    }
  }

  function resizeMatrix() {
    if (!canvas || !ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    mW = canvas.clientWidth;
    mH = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(mW * dpr));
    canvas.height = Math.max(1, Math.floor(mH * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mFont = window.innerWidth < 700 ? 13 : 15;
    mCols = Math.max(1, Math.ceil(mW / mFont));
    mDrops = Array.from({ length: mCols }, function () {
      return Math.random() * -mH;
    });
  }

  function drawMatrix() {
    if (!ctx) return;
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, mW, mH);
    ctx.font = mFont + 'px "Cascadia Code", Consolas, monospace';

    for (var i = 0; i < mCols; i += 1) {
      var glyph = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      ctx.fillStyle = Math.random() > 0.985 ? colorB : colorA;
      ctx.fillText(glyph, i * mFont, mDrops[i]);
      mDrops[i] += mFont;
      if (mDrops[i] > mH + Math.random() * 400) {
        mDrops[i] = Math.random() * -200;
      }
    }
  }

  function matrixLoop(now) {
    if (!matrixOn) return;
    if (now - lastDraw > 55) {
      drawMatrix();
      lastDraw = now;
    }
    matrixFrame = window.requestAnimationFrame(matrixLoop);
  }

  function startMatrix() {
    if (!canvas || reduceMotion || !effectsOn() || matrixOn) return;
    ctx = ctx || canvas.getContext("2d");
    if (!ctx) return;
    refreshMatrixColors();
    resizeMatrix();
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, mW, mH);
    matrixOn = true;
    matrixFrame = window.requestAnimationFrame(matrixLoop);
  }

  function stopMatrix() {
    matrixOn = false;
    if (matrixFrame) {
      window.cancelAnimationFrame(matrixFrame);
    }
    matrixFrame = 0;
    if (ctx) {
      ctx.clearRect(0, 0, mW, mH);
    }
  }

  doc.addEventListener("visibilitychange", function () {
    if (doc.hidden) {
      stopMatrix();
    } else {
      startMatrix();
    }
  });

  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    if (!matrixOn) return;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeMatrix, 200);
  });

  if (reduceQuery.addEventListener) {
    reduceQuery.addEventListener("change", function (event) {
      reduceMotion = event.matches;
      if (reduceMotion) {
        stopMatrix();
      } else {
        startMatrix();
      }
    });
  }

  /* ------------------------------------------------------------------
     命令面板
     ------------------------------------------------------------------ */
  var cmdEl = null;
  var cmdInput = null;
  var cmdList = null;
  var cmdFiltered = [];
  var cmdActive = 0;
  var lastFocused = null;

  function isIndexPage() {
    return pageFile === "index.html";
  }

  function goTo(url) {
    if (!url) return;

    if (url === "index.html") {
      if (isIndexPage()) {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      } else {
        location.href = url;
      }
      return;
    }

    if (url.charAt(0) === "#") {
      if (isIndexPage()) {
        var target = doc.querySelector(url);
        if (target) {
          target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start"
          });
          history.replaceState(null, "", url);
        }
      } else {
        location.href = "index.html" + url;
      }
      return;
    }

    location.href = url;
  }

  function cmdActions() {
    var actions = [
      { label: "首页", hint: "index.html", run: function () { goTo("index.html"); } },
      { label: "关于我", hint: "#about", run: function () { goTo("#about"); } },
      { label: "能力矩阵", hint: "#skills", run: function () { goTo("#skills"); } },
      { label: "精选作品", hint: "#work", run: function () { goTo("#work"); } },
      { label: "经历时间线", hint: "#timeline", run: function () { goTo("#timeline"); } },
      { label: "联系我", hint: "#contact", run: function () { goTo("#contact"); } },
      { label: "作品集", hint: "projects.html", run: function () { goTo("projects.html"); } },
      { label: "简历", hint: "resume.html", run: function () { goTo("resume.html"); } },
      { label: "复制邮箱", hint: meta.email || "", run: copyEmail },
      {
        label: "切换主题",
        hint: "dark / light",
        run: function () { setTheme(currentTheme() === "light" ? "dark" : "light"); }
      },
      {
        label: "切换背景动效",
        hint: effectsOn() ? "当前：开" : "当前：关",
        run: function () { setEffects(!effectsOn()); }
      }
    ];

    (SITE.socials || []).forEach(function (social) {
      actions.push({
        label: social.label,
        hint: social.url.replace(/^https?:\/\//, ""),
        run: function () {
          if (/yourname|example\.com/i.test(social.url)) {
            toast("占位链接：请在 assets/js/data.js 中替换为真实地址");
            return;
          }
          window.open(social.url, "_blank", "noopener");
        }
      });
    });

    return actions;
  }

  function renderCmd() {
    var query = (cmdInput.value || "").trim().toLowerCase();
    cmdFiltered = cmdActions().filter(function (action) {
      if (!query) return true;
      return (action.label + " " + action.hint).toLowerCase().indexOf(query) !== -1;
    });

    if (cmdActive >= cmdFiltered.length) {
      cmdActive = Math.max(0, cmdFiltered.length - 1);
    }

    cmdList.replaceChildren();

    if (!cmdFiltered.length) {
      cmdList.append(el("li", { class: "cmd-empty", text: "没有匹配的命令" }));
      cmdInput.removeAttribute("aria-activedescendant");
      return;
    }

    cmdFiltered.forEach(function (action, index) {
      cmdList.append(
        el(
          "li",
          {
            class: "cmd-item",
            attrs: {
              role: "option",
              id: "cmd-item-" + index,
              "aria-selected": String(index === cmdActive),
              "data-index": String(index)
            }
          },
          el("span", { text: action.label }),
          el("span", { class: "cmd-hint", text: action.hint || "" })
        )
      );
    });

    cmdInput.setAttribute("aria-activedescendant", "cmd-item-" + cmdActive);
  }

  function setCmdActive(next) {
    if (!cmdFiltered.length) return;
    cmdActive = (next + cmdFiltered.length) % cmdFiltered.length;

    Array.prototype.forEach.call(cmdList.children, function (child, index) {
      child.setAttribute("aria-selected", String(index === cmdActive));
    });

    var activeEl = doc.getElementById("cmd-item-" + cmdActive);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
    cmdInput.setAttribute("aria-activedescendant", "cmd-item-" + cmdActive);
  }

  function runCmd(index) {
    var action = cmdFiltered[index];
    if (!action) return;
    closeCmd();
    action.run();
  }

  function onCmdKey(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCmdActive(cmdActive + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCmdActive(cmdActive - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      runCmd(cmdActive);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeCmd();
    } else if (event.key === "Tab") {
      event.preventDefault();
      cmdInput.focus();
    }
  }

  function buildCmd() {
    if (cmdEl) return;

    cmdInput = el("input", {
      class: "cmd-input",
      type: "text",
      attrs: {
        placeholder: "输入命令或搜索…",
        autocomplete: "off",
        spellcheck: "false",
        role: "combobox",
        "aria-expanded": "true",
        "aria-controls": "cmd-list",
        "aria-autocomplete": "list",
        "aria-label": "命令搜索"
      }
    });

    cmdList = el("ul", {
      class: "cmd-list",
      attrs: { id: "cmd-list", role: "listbox", "aria-label": "可用命令" }
    });

    cmdEl = el(
      "div",
      { class: "cmd", attrs: { id: "cmd", hidden: "" } },
      el("div", { class: "cmd-backdrop", dataset: { cmdClose: "" } }),
      el(
        "div",
        { class: "cmd-panel", attrs: { role: "dialog", "aria-modal": "true", "aria-label": "命令面板" } },
        el("div", { class: "cmd-head" }, el("span", { class: "prompt", text: ">" }), cmdInput),
        cmdList,
        el(
          "div",
          { class: "cmd-foot" },
          el("span", {}, el("kbd", { text: "↑" }), el("kbd", { text: "↓" }), " 选择"),
          el("span", {}, el("kbd", { text: "Enter" }), " 执行"),
          el("span", {}, el("kbd", { text: "Esc" }), " 关闭")
        )
      )
    );

    doc.body.append(cmdEl);

    cmdInput.addEventListener("input", function () {
      cmdActive = 0;
      renderCmd();
    });
    cmdInput.addEventListener("keydown", onCmdKey);
    cmdList.addEventListener("click", function (event) {
      var item = event.target.closest(".cmd-item");
      if (!item) return;
      runCmd(Number(item.dataset.index));
    });
    cmdEl.addEventListener("click", function (event) {
      if (event.target.closest("[data-cmd-close]")) {
        closeCmd();
      }
    });
  }

  function openCmd() {
    buildCmd();
    lastFocused = doc.activeElement;
    cmdEl.hidden = false;
    doc.body.classList.add("cmd-open");
    cmdInput.value = "";
    cmdActive = 0;
    renderCmd();
    cmdInput.focus();
  }

  function closeCmd() {
    if (!cmdEl || cmdEl.hidden) return;
    cmdEl.hidden = true;
    doc.body.classList.remove("cmd-open");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function isTyping(target) {
    if (!target) return false;
    var tag = target.tagName;
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      target.isContentEditable
    );
  }

  doc.querySelectorAll("[data-cmd-open]").forEach(function (btn) {
    btn.addEventListener("click", openCmd);
  });

  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || "");
  doc.querySelectorAll(".cmd-trigger-label").forEach(function (node) {
    node.textContent = isMac ? "⌘ K" : "Ctrl K";
  });

  doc.addEventListener("keydown", function (event) {
    var key = event.key.toLowerCase();

    if ((event.ctrlKey || event.metaKey) && key === "k") {
      event.preventDefault();
      if (cmdEl && !cmdEl.hidden) {
        closeCmd();
      } else {
        openCmd();
      }
      return;
    }

    if (event.key === "/" && !isTyping(event.target) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      openCmd();
      return;
    }

    if (event.key === "Escape") {
      closeMenu();
      closeCmd();
    }
  });

  /* ------------------------------------------------------------------
     启动
     ------------------------------------------------------------------ */
  observeReveals();

  if (!doc.hidden) {
    startMatrix();
  }

  window.App = {
    el: el,
    toast: toast,
    observeReveals: observeReveals,
    reduceMotion: function () {
      return reduceMotion;
    }
  };
})();

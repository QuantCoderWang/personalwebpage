/* ==========================================================================
   projects.js — 作品卡片渲染 / 搜索 / 标签筛选
   同时负责首页精选（#featured-projects）与作品集页（#projects-grid）
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var SITE = window.SITE || {};
  var App = window.App || {};
  var el = App.el;

  if (typeof el !== "function") return;

  var projects = Array.isArray(SITE.projects) ? SITE.projects.slice() : [];
  var statusText = {
    active: "活跃开发",
    maintained: "持续维护",
    archived: "已归档"
  };

  function isPlaceholder(url) {
    return !url || /yourname|example\.com/i.test(url);
  }

  function externalAttrs(url) {
    var attrs = { href: url };
    if (isPlaceholder(url)) {
      attrs["data-todo"] = "";
    } else {
      attrs.target = "_blank";
      attrs.rel = "noopener noreferrer";
    }
    return attrs;
  }

  function externalLink(label, url) {
    return el(
      "a",
      { attrs: externalAttrs(url) },
      label,
      " ",
      el("span", { text: "↗", attrs: { "aria-hidden": "true" } })
    );
  }

  function createCard(project) {
    var repo = project.repo || "";
    var demo = project.demo || "";
    var primary = demo || repo;

    var cover = el(
      "a",
      {
        class: "card-cover",
        attrs: {
          href: primary || "#",
          "aria-label": project.title + " 项目封面",
          "data-todo": isPlaceholder(primary) ? "" : null,
          target: isPlaceholder(primary) ? null : "_blank",
          rel: isPlaceholder(primary) ? null : "noopener noreferrer"
        }
      },
      el("img", {
        attrs: {
          src: project.cover,
          alt: project.title + " 封面",
          width: "800",
          height: "500",
          loading: "lazy",
          decoding: "async"
        }
      }),
      project.status && statusText[project.status]
        ? el("span", {
            class: "badge badge--" + project.status,
            text: statusText[project.status]
          })
        : null,
      project.year ? el("span", { class: "card-year", text: project.year }) : null
    );

    var title = el("a", {
      class: "card-title",
      attrs: {
        href: primary || "#",
        "data-todo": isPlaceholder(primary) ? "" : null
      },
      text: project.title
    });

    var body = el(
      "div",
      { class: "card-body" },
      el(
        "div",
        { class: "card-title-row" },
        title,
        project.subtitle
          ? el("p", { class: "card-sub", text: project.subtitle })
          : null
      ),
      project.description
        ? el("p", { class: "card-desc", text: project.description })
        : null
    );

    if (Array.isArray(project.tags) && project.tags.length) {
      var tags = el("ul", { class: "tag-list tag-list--sm" });
      project.tags.forEach(function (tag) {
        tags.append(el("li", { text: tag }));
      });
      body.append(tags);
    }

    var card = el("article", { class: "project-card" }, cover, body);

    var links = [];
    if (repo) links.push(externalLink("源码", repo));
    if (demo) links.push(externalLink("演示", demo));
    if (links.length) {
      card.append(el("div", { class: "card-links" }, links));
    }

    return card;
  }

  /* ------------------------------------------------------------------
     首页精选
     ------------------------------------------------------------------ */
  function initFeatured() {
    var grid = doc.getElementById("featured-projects");
    if (!grid) return;

    var featured = projects.filter(function (project) {
      return project.featured;
    });

    if (!featured.length) {
      featured = projects.slice(0, 3);
    }

    featured = featured.slice(0, 3);
    if (!featured.length) return;

    grid.replaceChildren.apply(
      grid,
      featured.map(function (project) {
        return createCard(project);
      })
    );
  }

  /* ------------------------------------------------------------------
     作品集：搜索 + 标签筛选
     ------------------------------------------------------------------ */
  function initProjectsPage() {
    var grid = doc.getElementById("projects-grid");
    if (!grid) return;

    var filtersEl = doc.getElementById("project-filters");
    var searchEl = doc.getElementById("project-search");
    var countEl = doc.getElementById("project-count");
    var emptyEl = doc.getElementById("projects-empty");
    var state = { tag: "all", query: "" };

    var tags = ["all"];
    projects.forEach(function (project) {
      (project.tags || []).forEach(function (tag) {
        if (tags.indexOf(tag) === -1) tags.push(tag);
      });
    });

    function matches(project) {
      if (state.tag !== "all" && (project.tags || []).indexOf(state.tag) === -1) {
        return false;
      }
      if (!state.query) return true;

      var haystack = [
        project.title,
        project.subtitle,
        project.description
      ]
        .concat(project.tags || [])
        .concat(project.stack || [])
        .join(" ")
        .toLowerCase();

      return haystack.indexOf(state.query) !== -1;
    }

    function renderFilters() {
      if (!filtersEl) return;
      filtersEl.replaceChildren();

      tags.forEach(function (tag) {
        var button = el("button", {
          class: "chip",
          type: "button",
          text: tag === "all" ? "全部" : tag,
          attrs: {
            "aria-pressed": String(state.tag === tag),
            "data-tag": tag
          }
        });

        button.addEventListener("click", function () {
          state.tag = tag;
          renderFilters();
          render();
        });

        filtersEl.append(button);
      });
    }

    function render() {
      var visible = projects.filter(matches);
      grid.replaceChildren.apply(
        grid,
        visible.map(function (project) {
          return createCard(project);
        })
      );

      if (emptyEl) emptyEl.hidden = visible.length > 0;
      if (countEl) countEl.textContent = String(visible.length);
    }

    if (searchEl) {
      searchEl.addEventListener("input", function () {
        state.query = searchEl.value.trim().toLowerCase();
        render();
      });
    }

    renderFilters();
    render();
  }

  initFeatured();
  initProjectsPage();
})();

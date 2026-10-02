// 2026-10-02 12:46 KST
// 화면 설정(다크 모드, 레이아웃)을 적용하고 기억한다.
// <head>에서 일반 스크립트로 불러와 첫 화면이 그려지기 전에 테마를 적용한다. 그래야 다크 모드를 고른 사람에게 밝은 화면이 잠깐 비치지 않는다.
(function () {
  const UI_KEY = "todoApp.ui";
  const root = document.documentElement;
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function readPrefs() {
    try {
      const prefs = JSON.parse(localStorage.getItem(UI_KEY));
      return prefs !== null && typeof prefs === "object" ? prefs : {};
    } catch {
      return {};
    }
  }

  function writePrefs(prefs) {
    try {
      localStorage.setItem(UI_KEY, JSON.stringify(prefs));
    } catch {
      // 저장소가 막혀 있으면 이번 방문 동안만 유지된다. 할 일 저장 오류 안내는 app.js가 따로 띄운다.
    }
  }

  const prefs = readPrefs();
  if (prefs.theme === "light" || prefs.theme === "dark") root.dataset.theme = prefs.theme;
  root.dataset.layout = prefs.layout === "narrow" ? "narrow" : "wide";

  function currentTheme() {
    return root.dataset.theme || (darkQuery.matches ? "dark" : "light");
  }

  function updateLabels() {
    const themeButton = document.getElementById("theme-toggle");
    if (themeButton) themeButton.textContent = currentTheme() === "dark" ? "라이트 모드" : "다크 모드";
    const layoutButton = document.getElementById("layout-toggle");
    if (layoutButton) layoutButton.textContent = root.dataset.layout === "wide" ? "1단으로 보기" : "2단으로 보기";
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      prefs.theme = currentTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = prefs.theme;
      writePrefs(prefs);
      updateLabels();
    });
    document.getElementById("layout-toggle")?.addEventListener("click", () => {
      prefs.layout = root.dataset.layout === "wide" ? "narrow" : "wide";
      root.dataset.layout = prefs.layout;
      writePrefs(prefs);
      updateLabels();
    });
    darkQuery.addEventListener("change", updateLabels);
    updateLabels();
  });
})();

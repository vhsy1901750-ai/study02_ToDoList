// 2026-10-02 11:05 KST
import { CATEGORIES, FILTERS, getVisibleTodos, getProgress } from "./todo-store.js";

const FILTER_LABELS = { all: "전체", ...CATEGORIES };

export function fillCategoryOptions(select, selected) {
  select.replaceChildren(
    ...Object.entries(CATEGORIES).map(([value, label]) => new Option(label, value)),
  );
  select.value = selected;
}

export function showNotice(message) {
  const notice = document.getElementById("notice");
  notice.textContent = message;
  notice.hidden = false;
}

export function render(state, editingId) {
  renderProgress(state);
  renderTabs(state);
  renderList(state, editingId);
  renderClearButton(state);
}

function renderProgress(state) {
  const { done, total, percent } = getProgress(state);
  document.getElementById("progress-fill").style.width = `${percent}%`;
  document.getElementById("progress-text").textContent = `완료 ${done} / 전체 ${total} (${percent}%)`;
}

function renderTabs(state) {
  const tabs = FILTERS.map((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab";
    button.dataset.filter = filter;
    button.textContent = FILTER_LABELS[filter];
    button.setAttribute("aria-pressed", String(filter === state.filter));
    return button;
  });
  document.getElementById("tabs").replaceChildren(...tabs);
}

function renderList(state, editingId) {
  const list = document.getElementById("todo-list");
  const todos = getVisibleTodos(state);
  if (todos.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "할 일이 없습니다.";
    list.replaceChildren(empty);
    return;
  }
  list.replaceChildren(...todos.map((todo) => createTodoItem(todo)));
}

function renderClearButton(state) {
  const hasDone = getVisibleTodos(state).some((todo) => todo.done);
  document.getElementById("clear-completed").disabled = !hasDone;
}

function createActionButton(label, action, id) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.id = id;
  return button;
}

function createTodoItem(todo) {
  const item = document.createElement("li");
  item.className = todo.done ? "todo done" : "todo";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.done;
  checkbox.dataset.action = "toggle";
  checkbox.dataset.id = todo.id;
  checkbox.setAttribute("aria-label", `${todo.title} 완료`);

  const title = document.createElement("span");
  title.className = "todo-title";
  title.textContent = todo.title;

  const category = document.createElement("span");
  category.className = `category category-${todo.category}`;
  category.textContent = CATEGORIES[todo.category];

  item.append(
    checkbox,
    title,
    category,
    createActionButton("수정", "edit", todo.id),
    createActionButton("삭제", "delete", todo.id),
  );
  return item;
}

// 2026-10-02 11:05 KST
import { CATEGORIES, FILTERS, MAX_TITLE_LENGTH, getVisibleTodos, getProgress } from "./todo-store.js";

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
  list.replaceChildren(
    ...todos.map((todo) => (todo.id === editingId ? createEditItem(todo) : createTodoItem(todo))),
  );
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

  const toggle = document.createElement("label");
  toggle.className = "toggle";
  toggle.append(checkbox);

  const title = document.createElement("span");
  title.className = "todo-title";
  title.textContent = todo.title;

  const category = document.createElement("span");
  category.className = `category category-${todo.category}`;
  category.textContent = CATEGORIES[todo.category];

  item.append(
    toggle,
    title,
    category,
    createActionButton("수정", "edit", todo.id),
    createActionButton("삭제", "delete", todo.id),
  );
  return item;
}

function createEditItem(todo) {
  const item = document.createElement("li");
  item.className = "todo editing";

  const form = document.createElement("form");
  form.className = "edit-form";
  form.dataset.id = todo.id;

  const input = document.createElement("input");
  input.type = "text";
  input.name = "title";
  input.value = todo.title;
  input.maxLength = MAX_TITLE_LENGTH;
  input.autocomplete = "off";
  input.setAttribute("aria-label", "할 일 제목 수정");

  const select = document.createElement("select");
  select.name = "category";
  select.setAttribute("aria-label", "카테고리");
  fillCategoryOptions(select, todo.category);

  const save = document.createElement("button");
  save.type = "submit";
  save.textContent = "저장";

  form.append(input, select, save, createActionButton("취소", "cancel-edit", todo.id));
  item.append(form);
  return item;
}

// 2026-10-02 11:05 KST
import {
  createInitialState,
  parseState,
  serializeState,
  addTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  setFilter,
  getVisibleTodos,
  clearCompleted,
} from "./todo-store.js";
import { render, showNotice, fillCategoryOptions } from "./todo-view.js";

const STORAGE_KEY = "todo-app";
const BACKUP_KEY = "todo-app-backup";
const CORRUPT_MESSAGE = "저장된 데이터를 읽지 못해 빈 목록으로 시작합니다.";
const STORAGE_ERROR_MESSAGE = "변경 사항을 저장하지 못했습니다. 브라우저 저장소 설정을 확인해 주세요.";

const list = document.getElementById("todo-list");
const addCategory = document.getElementById("add-category");

let state = loadState();
let editingId = null;

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function loadState() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    showNotice(STORAGE_ERROR_MESSAGE);
    return createInitialState();
  }
  const { state: loaded, error } = parseState(raw);
  if (error) {
    writeStorage(BACKUP_KEY, raw);
    showNotice(CORRUPT_MESSAGE);
  }
  return loaded;
}

function persist() {
  if (!writeStorage(STORAGE_KEY, serializeState(state))) {
    showNotice(STORAGE_ERROR_MESSAGE);
  }
}

function defaultCategory(filter) {
  return filter === "all" ? "work" : filter;
}

function update(nextState) {
  editingId = null;
  if (nextState !== state) {
    state = nextState;
    persist();
  }
  render(state, editingId);
}

document.getElementById("add-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const titleInput = document.getElementById("add-title");
  const nextState = addTodo(state, { title: titleInput.value, category: addCategory.value });
  if (nextState !== state) titleInput.value = "";
  update(nextState);
  titleInput.focus();
});

document.getElementById("tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-filter]");
  if (!tab) return;
  update(setFilter(state, tab.dataset.filter));
  addCategory.value = defaultCategory(state.filter);
});

list.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const { action, id } = target.dataset;
  if (action === "toggle") {
    update(toggleTodo(state, id));
  } else if (action === "delete") {
    if (confirm("이 할 일을 삭제할까요?")) update(deleteTodo(state, id));
  } else if (action === "edit") {
    editingId = id;
    render(state, editingId);
    list.querySelector(".edit-form input[name='title']").focus();
  } else if (action === "cancel-edit") {
    editingId = null;
    render(state, editingId);
  }
});

list.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const nextState = updateTodo(state, form.dataset.id, {
    title: form.elements.title.value,
    category: form.elements.category.value,
  });
  if (nextState === state) return;
  update(nextState);
});

list.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && editingId !== null) {
    editingId = null;
    render(state, editingId);
  }
});

document.getElementById("clear-completed").addEventListener("click", () => {
  const count = getVisibleTodos(state).filter((todo) => todo.done).length;
  if (count > 0 && confirm(`완료한 할 일 ${count}개를 삭제할까요?`)) {
    update(clearCompleted(state));
  }
});

fillCategoryOptions(addCategory, defaultCategory(state.filter));
render(state, editingId);

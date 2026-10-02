// 2026-10-02 10:59 KST
export const CATEGORIES = { work: "업무", personal: "개인", study: "공부" };
export const FILTERS = ["all", ...Object.keys(CATEGORIES)];
export const MAX_TITLE_LENGTH = 100;

const VERSION = 1;

export function createInitialState() {
  return { version: VERSION, todos: [], filter: "all" };
}

function normalizeTitle(title) {
  if (typeof title !== "string") return null;
  const trimmed = title.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_TITLE_LENGTH) return null;
  return trimmed;
}

function isCategory(value) {
  return typeof value === "string" && Object.hasOwn(CATEGORIES, value);
}

export function addTodo(state, { title, category }) {
  const normalized = normalizeTitle(title);
  if (normalized === null || !isCategory(category)) return state;
  const newTodo = {
    id: crypto.randomUUID(),
    title: normalized,
    category,
    done: false,
    createdAt: Date.now(),
  };
  return { ...state, todos: [...state.todos, newTodo] };
}

function hasTodo(state, id) {
  return state.todos.some((todo) => todo.id === id);
}

function replaceTodo(state, id, change) {
  return {
    ...state,
    todos: state.todos.map((todo) => (todo.id === id ? { ...todo, ...change } : todo)),
  };
}

export function updateTodo(state, id, { title, category }) {
  const normalized = normalizeTitle(title);
  if (normalized === null || !isCategory(category) || !hasTodo(state, id)) return state;
  return replaceTodo(state, id, { title: normalized, category });
}

export function toggleTodo(state, id) {
  const target = state.todos.find((todo) => todo.id === id);
  if (!target) return state;
  return replaceTodo(state, id, { done: !target.done });
}

export function deleteTodo(state, id) {
  if (!hasTodo(state, id)) return state;
  return { ...state, todos: state.todos.filter((todo) => todo.id !== id) };
}

export function setFilter(state, filter) {
  if (!FILTERS.includes(filter)) return state;
  return { ...state, filter };
}

function matchesFilter(todo, filter) {
  return filter === "all" || todo.category === filter;
}

export function getVisibleTodos(state) {
  return state.todos.filter((todo) => matchesFilter(todo, state.filter));
}

export function getProgress(state) {
  const visible = getVisibleTodos(state);
  const done = visible.filter((todo) => todo.done).length;
  const total = visible.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

export function clearCompleted(state) {
  const remaining = state.todos.filter((todo) => !(todo.done && matchesFilter(todo, state.filter)));
  if (remaining.length === state.todos.length) return state;
  return { ...state, todos: remaining };
}

export function serializeState(state) {
  return JSON.stringify(state);
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidTodo(todo) {
  return (
    isPlainObject(todo) &&
    typeof todo.id === "string" &&
    todo.id.length > 0 &&
    normalizeTitle(todo.title) === todo.title &&
    isCategory(todo.category) &&
    typeof todo.done === "boolean" &&
    Number.isFinite(todo.createdAt)
  );
}

function isValidState(value) {
  return (
    isPlainObject(value) &&
    value.version === VERSION &&
    Array.isArray(value.todos) &&
    value.todos.every(isValidTodo) &&
    FILTERS.includes(value.filter)
  );
}

export function parseState(raw) {
  if (raw === null) return { state: createInitialState(), error: null };
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    return { state: createInitialState(), error: "corrupt" };
  }
  if (!isValidState(value)) return { state: createInitialState(), error: "corrupt" };
  return { state: { version: VERSION, todos: value.todos, filter: value.filter }, error: null };
}

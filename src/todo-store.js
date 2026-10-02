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

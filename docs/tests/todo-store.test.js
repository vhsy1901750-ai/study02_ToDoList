// 2026-10-02 10:59 KST
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CATEGORIES,
  FILTERS,
  createInitialState,
  addTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  setFilter,
  getVisibleTodos,
  getProgress,
  clearCompleted,
  serializeState,
  parseState,
} from "../src/todo-store.js";

function todo(overrides = {}) {
  return {
    id: "id-1",
    title: "보고서 초안",
    category: "work",
    done: false,
    createdAt: 1,
    ...overrides,
  };
}

function stateWith(todos, filter = "all") {
  return { version: 1, todos, filter };
}

test("createInitialState는 빈 목록과 전체 필터로 시작한다", () => {
  assert.deepEqual(createInitialState(), { version: 1, todos: [], filter: "all" });
});

test("CATEGORIES와 FILTERS는 PRD의 값을 가진다", () => {
  assert.deepEqual(CATEGORIES, { work: "업무", personal: "개인", study: "공부" });
  assert.deepEqual(FILTERS, ["all", "work", "personal", "study"]);
});

test("addTodo는 공백을 제거한 제목으로 맨 뒤에 미완료 항목을 추가한다", () => {
  const state = stateWith([todo()]);
  const next = addTodo(state, { title: "  운동하기  ", category: "personal" });

  assert.equal(next.todos.length, 2);
  assert.deepEqual(next.todos[0], todo());
  const added = next.todos[1];
  assert.equal(added.title, "운동하기");
  assert.equal(added.category, "personal");
  assert.equal(added.done, false);
  assert.equal(typeof added.id, "string");
  assert.ok(added.id.length > 0);
  assert.equal(typeof added.createdAt, "number");
});

test("addTodo는 매번 다른 id를 만든다", () => {
  const once = addTodo(createInitialState(), { title: "가", category: "work" });
  const twice = addTodo(once, { title: "나", category: "work" });
  assert.notEqual(twice.todos[0].id, twice.todos[1].id);
});

test("addTodo는 빈 제목이나 공백뿐인 제목을 거부한다", () => {
  const state = createInitialState();
  assert.equal(addTodo(state, { title: "", category: "work" }), state);
  assert.equal(addTodo(state, { title: "   ", category: "work" }), state);
});

test("addTodo는 100자까지 허용하고 101자는 거부한다", () => {
  const state = createInitialState();
  assert.equal(addTodo(state, { title: "가".repeat(100), category: "work" }).todos.length, 1);
  assert.equal(addTodo(state, { title: "가".repeat(101), category: "work" }), state);
});

test("addTodo는 허용되지 않은 카테고리를 거부한다", () => {
  const state = createInitialState();
  assert.equal(addTodo(state, { title: "운동", category: "hobby" }), state);
  assert.equal(addTodo(state, { title: "운동", category: "toString" }), state);
});

test("addTodo는 원본 상태를 바꾸지 않는다", () => {
  const state = stateWith([todo()]);
  const snapshot = structuredClone(state);
  addTodo(state, { title: "운동", category: "personal" });
  assert.deepEqual(state, snapshot);
});

test("updateTodo는 제목(공백 제거)과 카테고리를 바꾸고 나머지는 유지한다", () => {
  const state = stateWith([todo({ id: "a" }), todo({ id: "b", title: "다른 일" })]);
  const next = updateTodo(state, "a", { title: "  회의 준비 ", category: "study" });

  assert.deepEqual(next.todos[0], todo({ id: "a", title: "회의 준비", category: "study" }));
  assert.deepEqual(next.todos[1], state.todos[1]);
});

test("updateTodo는 빈 제목, 허용되지 않은 카테고리, 없는 id를 거부한다", () => {
  const state = stateWith([todo({ id: "a" })]);
  assert.equal(updateTodo(state, "a", { title: "  ", category: "work" }), state);
  assert.equal(updateTodo(state, "a", { title: "회의", category: "hobby" }), state);
  assert.equal(updateTodo(state, "없음", { title: "회의", category: "work" }), state);
});

test("toggleTodo는 완료 여부를 뒤집는다", () => {
  const state = stateWith([todo({ id: "a", done: false })]);
  const done = toggleTodo(state, "a");
  assert.equal(done.todos[0].done, true);
  assert.equal(toggleTodo(done, "a").todos[0].done, false);
});

test("toggleTodo는 없는 id면 상태를 그대로 반환한다", () => {
  const state = stateWith([todo({ id: "a" })]);
  assert.equal(toggleTodo(state, "없음"), state);
});

test("deleteTodo는 해당 항목만 지운다", () => {
  const state = stateWith([todo({ id: "a" }), todo({ id: "b" })]);
  assert.deepEqual(deleteTodo(state, "a").todos.map((t) => t.id), ["b"]);
});

test("deleteTodo는 없는 id면 상태를 그대로 반환한다", () => {
  const state = stateWith([todo({ id: "a" })]);
  assert.equal(deleteTodo(state, "없음"), state);
});

test("updateTodo, toggleTodo, deleteTodo는 원본 상태를 바꾸지 않는다", () => {
  const state = stateWith([todo({ id: "a" })]);
  const snapshot = structuredClone(state);
  updateTodo(state, "a", { title: "회의", category: "study" });
  toggleTodo(state, "a");
  deleteTodo(state, "a");
  assert.deepEqual(state, snapshot);
});

const mixed = [
  todo({ id: "w1", category: "work", done: true }),
  todo({ id: "p1", category: "personal", done: false }),
  todo({ id: "w2", category: "work", done: false }),
  todo({ id: "s1", category: "study", done: true }),
];

test("setFilter는 허용된 값으로 바꾸고, 아니면 상태를 그대로 반환한다", () => {
  const state = stateWith([]);
  assert.equal(setFilter(state, "study").filter, "study");
  assert.equal(setFilter(state, "hobby"), state);
});

test("getVisibleTodos는 전체 필터면 모두, 카테고리 필터면 해당 항목만 순서대로 돌려준다", () => {
  assert.deepEqual(getVisibleTodos(stateWith(mixed, "all")).map((t) => t.id), ["w1", "p1", "w2", "s1"]);
  assert.deepEqual(getVisibleTodos(stateWith(mixed, "work")).map((t) => t.id), ["w1", "w2"]);
  assert.deepEqual(getVisibleTodos(stateWith(mixed, "personal")).map((t) => t.id), ["p1"]);
});

test("getProgress는 할 일이 없으면 0%다", () => {
  assert.deepEqual(getProgress(stateWith([])), { done: 0, total: 0, percent: 0 });
});

test("getProgress는 현재 필터 기준으로 계산하고 반올림한다", () => {
  assert.deepEqual(getProgress(stateWith(mixed, "all")), { done: 2, total: 4, percent: 50 });
  assert.deepEqual(getProgress(stateWith(mixed, "work")), { done: 1, total: 2, percent: 50 });
  assert.deepEqual(getProgress(stateWith(mixed, "personal")), { done: 0, total: 1, percent: 0 });

  const third = [todo({ id: "a", done: true }), todo({ id: "b" }), todo({ id: "c" })];
  assert.equal(getProgress(stateWith(third)).percent, 33);
  const twoThirds = [todo({ id: "a", done: true }), todo({ id: "b", done: true }), todo({ id: "c" })];
  assert.equal(getProgress(stateWith(twoThirds)).percent, 67);
});

test("clearCompleted는 현재 필터의 완료 항목만 지운다", () => {
  assert.deepEqual(clearCompleted(stateWith(mixed, "all")).todos.map((t) => t.id), ["p1", "w2"]);
  assert.deepEqual(clearCompleted(stateWith(mixed, "work")).todos.map((t) => t.id), ["p1", "w2", "s1"]);
});

test("clearCompleted는 지울 항목이 없으면 상태를 그대로 반환한다", () => {
  const state = stateWith(mixed, "personal");
  assert.equal(clearCompleted(state), state);
});

test("setFilter, clearCompleted는 원본 상태를 바꾸지 않는다", () => {
  const state = stateWith(mixed, "all");
  const snapshot = structuredClone(state);
  setFilter(state, "work");
  clearCompleted(state);
  assert.deepEqual(state, snapshot);
});

test("parseState는 저장값이 없으면 오류 없이 초기 상태를 돌려준다", () => {
  assert.deepEqual(parseState(null), { state: createInitialState(), error: null });
});

test("serializeState와 parseState는 상태를 그대로 왕복한다", () => {
  const state = stateWith([todo({ id: "a", done: true }), todo({ id: "b", category: "study" })], "study");
  assert.deepEqual(parseState(serializeState(state)), { state, error: null });
});

const validJson = (override) =>
  JSON.stringify({ version: 1, todos: [todo()], filter: "all", ...override });

const corruptCases = [
  ["JSON 문법 오류", "{"],
  ["최상위가 null", "null"],
  ["최상위가 배열", "[]"],
  ["version이 다름", validJson({ version: 2 })],
  ["todos가 배열이 아님", validJson({ todos: {} })],
  ["filter가 허용 값이 아님", validJson({ filter: "hobby" })],
  ["id가 빈 문자열", validJson({ todos: [todo({ id: "" })] })],
  ["제목이 비어 있음", validJson({ todos: [todo({ title: "" })] })],
  ["제목 앞뒤에 공백", validJson({ todos: [todo({ title: " 회의 " })] })],
  ["제목이 101자", validJson({ todos: [todo({ title: "가".repeat(101) })] })],
  ["카테고리가 허용 값이 아님", validJson({ todos: [todo({ category: "hobby" })] })],
  ["done이 불리언이 아님", validJson({ todos: [todo({ done: "yes" })] })],
  ["createdAt이 숫자가 아님", validJson({ todos: [todo({ createdAt: "어제" })] })],
  ["할 일이 객체가 아님", validJson({ todos: ["회의"] })],
];

for (const [name, raw] of corruptCases) {
  test(`parseState는 깨진 데이터를 감지한다: ${name}`, () => {
    assert.deepEqual(parseState(raw), { state: createInitialState(), error: "corrupt" });
  });
}

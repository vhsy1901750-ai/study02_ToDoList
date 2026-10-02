// 2026-10-02 10:59 KST
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CATEGORIES,
  FILTERS,
  createInitialState,
  addTodo,
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

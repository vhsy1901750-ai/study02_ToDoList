// 2026-10-02 11:05 KST
import { createInitialState, parseState, serializeState } from "./todo-store.js";
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

fillCategoryOptions(addCategory, defaultCategory(state.filter));
render(state, editingId);

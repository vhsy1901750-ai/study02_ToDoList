<!-- 2026-10-02 11:44 KST -->
# 1단계: 프로젝트 준비와 할 일 로직

화면 없이 할 일 데이터를 다루는 핵심 로직을 테스트와 함께 만듭니다. 아래 상자의 내용을 그대로 복사해 Claude Code에 붙여 넣어 주세요.

```text
docs/PRD.md를 읽고 할 일 관리 앱의 1단계를 진행해 줘. 이번 단계는 화면 없이 할 일 데이터를 다루는 로직만 만든다.

할 일:
1. package.json을 만들어 줘. 내용은 "type": "module"과 "test": "node --test" 스크립트만 넣고, 의존성은 하나도 넣지 마.
2. src/todo-store.js를 만들어 줘. DOM과 localStorage를 전혀 모르는 순수 함수 모음이어야 해 (PRD 7.2절).
   - 상수: CATEGORIES = { work: "업무", personal: "개인", study: "공부" }, FILTERS = ["all", "work", "personal", "study"], MAX_TITLE_LENGTH = 100
   - 함수: createInitialState, addTodo, updateTodo, toggleTodo, deleteTodo, setFilter, getVisibleTodos, getProgress, clearCompleted
3. tests/todo-store.test.js에 PRD 8.1절의 항목 중 저장 형식(parseState)을 뺀 나머지를 테스트로 만들어 줘.

반드시 지킬 것:
- 테스트를 먼저 쓰고, 실패하는 것을 확인한 다음 구현해 줘.
- 모든 변경 함수는 원본을 바꾸지 않고 새 상태를 돌려줘야 해.
- 잘못된 입력(빈 제목, 101자 이상 제목, 없는 id, 허용되지 않은 카테고리나 필터)이면 새 객체를 만들지 말고 받은 상태 객체를 그대로 돌려줘. 나중에 화면 코드가 "nextState !== state"로 변경 여부를 판단한다.
- 카테고리 검사는 Object.hasOwn으로 해 줘. "toString" 같은 값이 통과하면 안 된다.
- 진행률은 현재 탭 기준이고 Math.round로 반올림한다. 할 일이 0개면 0%다 (PRD 3.2절).
- 완료 항목 정리는 현재 탭에 보이는 완료 항목만 지운다 (PRD 3.9절).

끝나면 npm test 결과를 보여 주고, 커밋한 뒤 멈춰서 보고해 줘. 2단계는 내가 요청할 때까지 시작하지 마.
```

## 완료 확인

- `npm test`가 모두 통과합니다.
- `package.json`에 `dependencies`, `devDependencies`가 없습니다.

다음 단계: [2단계: 저장 형식과 데이터 검증](02-storage-format.md)

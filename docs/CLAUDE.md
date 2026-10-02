<!-- 2026-10-02 11:24 KST -->
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

브라우저에서 순수 자바스크립트로 동작하는 개인용 할 일 관리 앱이다. 앱과 문서는 모두 `docs/` 폴더에 있고, 빌드 단계 없이 이 폴더를 그대로 GitHub Pages에 올린다. 무엇을 만들지는 `PRD.md`에, 단계별 구현 지시문은 `prompts.md`에 있다.

## 명령어

아래 명령은 모두 `docs/` 폴더에서 실행한다.

```bash
npm test                     # 전체 테스트 (node --test, 의존성 없음)
python -m http.server 8000   # 로컬 확인용 정적 서버, http://localhost:8000/
```

`index.html`을 `file://`로 열면 ES 모듈이 막혀 아무것도 뜨지 않는다. 반드시 서버를 거쳐 연다.

## 파일의 경계

| 파일 | 하는 일 | 모르는 것 |
| --- | --- | --- |
| `src/todo-store.js` | 상태 변경, 진행률 계산, 저장 형식 변환과 검증 | DOM, localStorage |
| `src/todo-view.js` | 상태를 받아 화면 전체를 다시 그린다 | localStorage, 이벤트 |
| `src/app.js` | 상태 보관, 이벤트 연결, localStorage 읽기와 쓰기 | 계산 규칙 |

이 경계 덕분에 `todo-store.js`를 Node에서 그대로 테스트할 수 있다. 이 파일에 `document`나 `localStorage`를 들이지 않는다.

## 건드리면 안 되는 것

아래는 그렇게 만든 이유가 있다. 취향에 맞지 않아 보여도 요청 없이 되돌리지 않는다.

- **잘못된 입력이면 받은 상태 객체를 그대로 돌려준다.** `todo-store.js`의 변경 함수는 빈 제목이나 없는 id를 받으면 새 객체를 만들지 않고 원래 객체를 반환한다. `app.js`는 `nextState !== state`로 저장할지, 입력칸을 비울지, 수정 화면을 유지할지 판단한다. 무심코 복사본을 돌려주면 빈 제목인데도 수정 화면이 닫힌다.
- **사용자가 쓴 제목은 `textContent`나 `value`로만 화면에 넣는다.** `innerHTML`을 쓰면 제목에 넣은 태그가 실행된다.
- **카테고리 이름은 `todo-store.js`의 `CATEGORIES` 한 곳에만 있다.** 탭, 선택칸, 라벨이 모두 여기서 이름을 가져간다. 저장 데이터에는 `work`, `personal`, `study` 같은 영문 키만 들어간다.
- **체크박스는 44px짜리 `label.toggle`로 감싼다.** 처음에는 체크박스 바깥 여백으로 누르는 영역을 넓히려 했지만, 여백은 눌리는 영역에 들어가지 않아 실제로는 24px뿐이었다. 휴대폰에서 손가락으로 누르기 어려워 감싸는 방식으로 바꿨다.
- **망가진 저장 데이터는 덮어쓰기 전에 `todoApp.v1.backup`으로 옮긴다.** 읽지 못한 데이터라도 사용자의 기록이므로 버리지 않는다.
- **수정 중에 다른 동작을 하면 수정 화면은 저장 없이 닫힌다.** `update()`가 맨 먼저 `editingId`를 비우는 이유다. 다만 삭제 확인 창에서 취소하면 바뀐 것이 없으므로 수정 화면을 그대로 둔다.

## 저장 형식을 바꿀 때

localStorage의 `todoApp.v1` 키에 `{ version: 1, todos, filter }`를 통째로 저장한다. 예전에 쓰던 `todo-app` 키는 `app.js`의 `loadState()`가 처음 열 때 한 번 옮기고 지운다. `parseState()`는 형식이 조금만 달라도 데이터가 망가졌다고 보고 빈 목록으로 시작한다.

**할 일에 필드를 추가하거나 형식을 바꾸면 이미 쓰던 사람의 목록이 통째로 백업으로 밀려난다.** 형식을 바꿀 때는 `version`을 올리고, 옛 버전을 새 형식으로 바꿔 읽는 처리를 함께 넣는다.

## 공통 규칙

- 코드 주석, UI 문자열, 문서는 한글로 쓴다.
- 외부 패키지를 쓰지 않는다. `package.json`에는 `type: module`과 test 스크립트만 있다.
- 새로 만드는 파일은 첫머리에 생성 일시를 `2026-10-02 11:24 KST` 형식의 주석으로 남긴다. 이 PC의 Git Bash에서는 `TZ=Asia/Seoul date`가 UTC를 돌려주므로 PowerShell로 조회한다.
  ```powershell
  [System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTime]::UtcNow, 'Korea Standard Time').ToString('yyyy-MM-dd HH:mm')
  ```
- 열거에는 가운뎃점을 쓰지 않고 쉼표를 쓴다. 완결된 문장인 메시지는 마침표로 끝낸다. 보조용언은 띄어 쓴다.

## 배포

GitHub Pages는 `main` 브랜치의 `docs/` 폴더를 그대로 서빙한다. 빌드 단계는 없다.

로컬 테스트 통과는 배포 성공의 증거가 아니다. 배포가 끝나면 실제 주소를 PC와 휴대폰에서 열어 `PRD.md` 8.2절 체크리스트를 다시 확인한다. Pages는 파일을 10분 동안 캐시하므로, 확인 전에 강력 새로고침(Ctrl+F5)을 한다.

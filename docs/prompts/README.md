<!-- 2026-10-02 11:44 KST -->
# 구현 프롬프트 5단계

[PRD](../PRD.md)를 바탕으로 Claude Code에서 할 일 관리 앱을 처음부터 만들 때 쓰는 프롬프트 모음입니다. 단계마다 파일이 하나씩 있으며, 각 파일의 프롬프트 상자를 그대로 복사해 Claude Code에 붙여 넣으면 됩니다.

| 단계 | 파일 | 하는 일 | 만들어지는 것 |
| --- | --- | --- | --- |
| 1 | [01-store-logic.md](01-store-logic.md) | 프로젝트 준비와 할 일 로직 | `package.json`, `src/todo-store.js`, 테스트 |
| 2 | [02-storage-format.md](02-storage-format.md) | 저장 형식과 데이터 검증 | `serializeState`, `parseState`, 테스트 |
| 3 | [03-screen-render.md](03-screen-render.md) | 화면 구성과 렌더링 | `index.html`, `style.css`, `src/todo-view.js`, `src/app.js` |
| 4 | [04-user-actions.md](04-user-actions.md) | 사용자 동작 연결 | 추가, 체크, 수정, 삭제, 탭, 정리 동작 |
| 5 | [05-check-deploy.md](05-check-deploy.md) | 전체 점검과 배포 | GitHub Pages 배포, 배포 주소 확인 |

## 쓰는 방법

- **한 번에 한 단계씩** 진행해 주세요. 각 프롬프트는 "끝나면 멈추고 보고해 줘"로 끝나므로, 결과를 확인한 뒤 다음 단계 파일을 엽니다.
- 모든 단계는 저장소 루트에 `docs/PRD.md`가 있다고 가정합니다. 프롬프트 안의 "PRD 3.4절" 같은 표기는 그 문서의 절 번호입니다.
- 단계마다 끝에 있는 **완료 확인** 항목을 직접 확인한 뒤 넘어가 주세요. 확인이 안 되면 다음 단계로 가지 말고, 그 단계에서 고치도록 다시 요청합니다.

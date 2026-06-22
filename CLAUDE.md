
# Global AI OS Inheritance

Before applying project-specific rules, load:

1. ../_global/GLOBAL_HOME.md
2. ../_global/GLOBAL_AGENTS.md
3. ../_global/GLOBAL_DECISION_LOG.md

@AGENTS.md

## Feature Checklist Rule
기능 구현 완료 후 반드시 features-checklist.json을 업데이트할 것:
- 완료된 task의 "done"을 true로 변경
- 모든 task가 완료되면 feature의 "status"를 "done"으로 변경

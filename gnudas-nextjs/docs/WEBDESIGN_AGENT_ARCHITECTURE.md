# Web Design Agent Architecture (High-Response Oriented)

목표: "예쁜 화면"이 아니라 **사용자 반응(클릭/체류/전환)**이 높은 웹을 반복적으로 만드는 멀티에이전트 구조.

## 1) 팀 구성 (역할 고정)

- **web-creative-director**
  - 브랜드 톤/무드, 비주얼 일관성, 첫인상 품질
- **web-ux-researcher**
  - 사용자 여정, 정보구조(IA), 이탈 포인트 분석
- **web-ui-designer**
  - 레이아웃/타이포/컬러/컴포넌트 설계
- **web-copywriter**
  - 헤드라인/서브카피/CTA 문구 최적화
- **web-growth-analyst**
  - KPI, A/B 테스트 설계, 성과 해석
- **(옵션) web-accessibility-qa**
  - 접근성, 반응형, 가독성, 오류 예방 점검

## 2) 오케스트레이션 원칙

- 메인 에이전트(PM)가 요청을 받는다.
- PM이 동일 주제를 역할별 에이전트에 병렬 전달한다.
- 각 역할 결과를 PM이 통합해 **단일 실행안**으로 확정한다.
- 실행안은 항상 아래 포맷으로 출력:
  1. 목표 지표(KPI)
  2. 변경 범위(Files/Components)
  3. 디자인 근거(사용자 반응 가설)
  4. 테스트 계획(A/B 포함)

## 3) 산출물 표준

- **Design Brief**: 타깃/핵심 메시지/분위기
- **UX Spec**: 사용자 흐름, 핵심 CTA, 이탈 방지 포인트
- **UI Spec**: spacing/type/color/component states
- **Copy Pack**: hero/benefit/cta/error/empty state 문구
- **Experiment Plan**: A/B 가설, 성공 기준, 종료 조건

## 4) 반응도 중심 KPI

- CTR (주요 CTA 클릭률)
- CVR (핵심 전환율)
- Bounce rate (이탈률)
- Time on page (체류시간)
- Task success rate (목표 행동 완료율)

## 5) 품질 게이트 (배포 전)

- 모바일(특히 360~430px)에서 레이아웃 겹침 0
- 첫 화면 3초 내 메시지 전달 가능
- CTA는 상단/중단/하단 최소 2회 노출
- 폼/에러/빈상태 마이크로카피 포함
- 접근성 최소 기준(색 대비, 포커스, 탭 이동) 충족

## 6) 실행 루프

1. **Define**: 목표/KPI 확정
2. **Draft**: 역할별 제안 병렬 수집
3. **Build**: 구현 반영
4. **Validate**: QA + 측정 이벤트 확인
5. **Experiment**: A/B 실행
6. **Iterate**: 승자안 반영

---

이 구조의 핵심은 “디자인 감”이 아니라, **반응 데이터로 계속 좋아지게 만드는 팀 운영**이다.

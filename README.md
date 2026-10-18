# 직무스트레스 원인 조사 (10문항, 익명)

KOSS(한국형 직무스트레스 측정도구) 영역 구성과 Karasek 요구-통제, Siegrist 노력-보상 불균형, NIOSH 모델을 참고해 새로 작성한 직원 설문입니다.

- 응답: 4점 척도(KOSS 방식), 긍정 문항 6개 역채점 → 문항별 0~100 환산, 총점 = 평균
- 수준: 75+ 매우 높음 / 50–74 높음 / 25–49 보통 / 24 이하 낮음 (자체 구간)
- 페이지: `/` 설문, `/results.html` 전체 집계(개인 응답 비공개)
- 저장: Supabase `public.stress_responses` (RLS: 익명 insert만 허용, 집계는 `get_stress_summary()`)
- 배포: `main` 푸시 시 Vercel 자동 배포

import streamlit as st
import random

def run():
    # CSS 스타일 (MBTI 검사기 스타일 참고)
    st.markdown("""
    <style>
    .big-font { font-size: 1.5rem !important; }
    .teto-btn-row { display: flex; gap: 1.2rem; margin: 1.2rem 0 2.2rem 0; justify-content: center; }
    .teto-btn {
        font-size: 1.15rem !important;
        font-weight: 600;
        border: none;
        border-radius: 12px;
        padding: 0.7em 1.7em;
        margin: 0 0.2em;
        cursor: pointer;
        transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        background: #f4f4ff;
        color: #333;
        box-shadow: 0 2px 8px #e0e0ff33;
    }
    .teto-btn.selected {
        color: #fff !important;
        box-shadow: 0 4px 16px #bbaaff44;
    }
    .fadein-q {
        animation: fadein 0.7s;
    }
    @keyframes fadein {
        from { opacity: 0; transform: translateY(30px);}
        to { opacity: 1; transform: translateY(0);}
    }
    .percent-bar {
        height: 32px;
        border-radius: 16px;
        background: #f0f0ff;
        margin-bottom: 0.5em;
        overflow: hidden;
        display: flex;
        align-items: center;
    }
    .percent-bar-inner {
        height: 100%;
        border-radius: 16px;
        background: linear-gradient(90deg, #9D5CFF 10%, #5CFFD1 90%);
        color: #fff;
        font-weight: bold;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 1em;
        transition: width 0.5s;
    }
    .result-card {
        margin-top: 2em;
        padding: 1.5em 1.5em 1.2em 1.5em;
        background: #f8f6ff;
        border-radius: 18px;
        border: 1.5px solid #e3e6f3;
    }
    /* 다크모드에서 텍스트 가시성만 개선 */
    @media (prefers-color-scheme: dark) {
        .test-container, .question-card {
            color: #f4f6fb !important;
        }
        .test-container h3, .test-container p, .test-container li {
            color: #f4f6fb !important;
        }
        .question-card h4 {
            color: #f4f6fb !important;
        }
    }
    </style>
    """, unsafe_allow_html=True)
    
    st.title("🎭 테토에겐 테스트")
    st.markdown('<div class="big-font">당신은 테토남, 에겐남, 테토녀, 에겐녀 중 누구일까요?<br>각 문항마다 더 나와 비슷한 쪽을 선택하세요.</div>', unsafe_allow_html=True)
    
    # 테스트 질문들
    questions = [
        {
            "question": "친구들과 만날 때 나는...",
            "options": [
                "활발하게 대화를 이끌어가는 편이다",
                "조용히 듣고 있다가 적절한 타이밍에 말한다"
            ]
        },
        {
            "question": "새로운 사람을 만날 때...",
            "options": [
                "먼저 다가가서 인사를 건넨다",
                "상대방이 먼저 다가올 때까지 기다린다"
            ]
        },
        {
            "question": "문제가 생겼을 때 나는...",
            "options": [
                "즉시 해결책을 찾으려고 노력한다",
                "차분히 상황을 파악한 후 대응한다"
            ]
        },
        {
            "question": "여가 시간에 나는...",
            "options": [
                "새로운 활동이나 취미를 시도한다",
                "편안하고 익숙한 활동을 즐긴다"
            ]
        },
        {
            "question": "감정 표현에 대해...",
            "options": [
                "솔직하게 감정을 표현하는 편이다",
                "감정을 조절해서 표현한다"
            ]
        },
        {
            "question": "계획을 세울 때...",
            "options": [
                "즉흥적으로 행동하는 편이다",
                "미리 계획을 세우고 실행한다"
            ]
        },
        {
            "question": "스트레스 상황에서...",
            "options": [
                "다른 사람과 이야기하며 해소한다",
                "혼자만의 시간을 가지며 해소한다"
            ]
        },
        {
            "question": "의사결정을 할 때...",
            "options": [
                "직감과 감정에 따라 결정한다",
                "논리적 분석 후 결정한다"
            ]
        }
    ]
    
    # 세션 상태 초기화
    if 'test_started' not in st.session_state:
        st.session_state.test_started = False
    if 'current_question' not in st.session_state:
        st.session_state.current_question = 0
    if 'answers' not in st.session_state:
        st.session_state.answers = []
    if 'test_completed' not in st.session_state:
        st.session_state.test_completed = False
    
    # 테스트 시작
    if not st.session_state.test_started:
        st.markdown("""
        <div style="margin-top:2em; padding:1.5em 1.5em 1.2em 1.5em; background:#f8f6ff; border-radius:18px; border:1.5px solid #e3e6f3;">
            <div style="font-size:1.25rem; font-weight:700; color:#7a5cff; margin-bottom:0.5em;">테토에겐 테스트란?</div>
            <div style="font-size:1.08rem; color:#444; margin-bottom:1em;">테토에겐은 성격 유형을 4가지로 분류하는 테스트입니다:</div>
            <ul style="font-size:1.05rem; color:#333; margin-bottom:1em;">
                <li><strong>테토남</strong>: 활발하고 외향적인 남성형</li>
                <li><strong>에겐남</strong>: 차분하고 내향적인 남성형</li>
                <li><strong>테토녀</strong>: 활발하고 외향적인 여성형</li>
                <li><strong>에겐녀</strong>: 차분하고 내향적인 여성형</li>
            </ul>
            <div style="font-size:1.08rem; color:#444;">총 8개의 질문에 답하시면 됩니다. 솔직하게 답해주세요!</div>
        </div>
        """, unsafe_allow_html=True)
        
        if st.button("테스트 시작하기", type="primary", use_container_width=True):
            st.session_state.test_started = True
            st.rerun()
    
    # 테스트 진행
    elif not st.session_state.test_completed and st.session_state.current_question < len(questions):
        question = questions[st.session_state.current_question]
        
        # 진행 상황 표시
        st.markdown(
            f"""
            <div style="text-align:center; margin-bottom:0.7em; font-size:1.15rem; color:#7a5cff; font-weight:600;">
                <span>문항 {st.session_state.current_question+1} / {len(questions)}</span>
            </div>
            """,
            unsafe_allow_html=True
        )
        
        st.markdown(f'<div class="big-font fadein-q"><b>{st.session_state.current_question+1}. {question["question"]}</b></div>', unsafe_allow_html=True)
        
        col1, col2 = st.columns(2, gap="small")
        
        with col1:
            if st.button(f"A: {question['options'][0]}", key=f"teto_btn_{st.session_state.current_question}_0", use_container_width=True):
                st.session_state.answers.append(0)
                st.session_state.current_question += 1
                st.rerun()
        
        with col2:
            if st.button(f"B: {question['options'][1]}", key=f"teto_btn_{st.session_state.current_question}_1", use_container_width=True):
                st.session_state.answers.append(1)
                st.session_state.current_question += 1
                st.rerun()
        
        # 진행률 표시
        progress = st.session_state.current_question / len(questions)
        st.progress(progress)
        
        # 이전 버튼
        if st.session_state.current_question > 0:
            if st.button("이전", use_container_width=True):
                st.session_state.current_question -= 1
                st.session_state.answers.pop()
                st.rerun()
    
    # 결과 계산 및 표시
    elif st.session_state.test_completed or st.session_state.current_question >= len(questions):
        if not st.session_state.test_completed:
            st.session_state.test_completed = True
            
            # 결과 계산 (간단한 알고리즘)
            extrovert_score = sum(st.session_state.answers[:4])  # 외향성 점수
            gender_factor = random.choice([0, 1])  # 성별 요소 (랜덤)
            
            # 결과 결정
            if extrovert_score >= 2:  # 외향적
                if gender_factor == 0:
                    result = "테토남"
                    description = "활발하고 외향적인 남성형입니다. 적극적이고 리더십이 있으며, 새로운 도전을 즐기는 성격입니다."
                else:
                    result = "테토녀"
                    description = "활발하고 외향적인 여성형입니다. 사교적이고 표현력이 풍부하며, 사람들과의 소통을 즐깁니다."
            else:  # 내향적
                if gender_factor == 0:
                    result = "에겐남"
                    description = "차분하고 내향적인 남성형입니다. 신중하고 분석적이며, 깊이 있는 사고를 하는 성격입니다."
                else:
                    result = "에겐녀"
                    description = "차분하고 내향적인 여성형입니다. 섬세하고 공감능력이 뛰어나며, 안정적인 관계를 추구합니다."
            
            st.session_state.result = result
            st.session_state.description = description
        
        # 결과 표시
        st.markdown(f"<div class='big-font'><b>당신의 테토에겐 유형은 <span style='color:#7a5cff'>{st.session_state.result}</span> 입니다!</b></div>", unsafe_allow_html=True)
        
        # 외향성 점수 표시
        extrovert_score = sum(st.session_state.answers[:4])
        introvert_score = 4 - extrovert_score
        extrovert_pct = int(round(extrovert_score / 4 * 100))
        introvert_pct = 100 - extrovert_pct
        
        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown(f"""
        <div class="big-font"><b>외향성 vs 내향성 비율</b></div>
        <div class="percent-bar"><div class="percent-bar-inner" style="width:{extrovert_pct}%">외향성 {extrovert_pct}%</div></div>
        <div class="percent-bar"><div class="percent-bar-inner" style="width:{introvert_pct}%">내향성 {introvert_pct}%</div></div>
        """, unsafe_allow_html=True)
        
        # 결과 상세 설명
        st.markdown(f"""
        <div class="result-card">
            <div style="font-size:1.25rem; font-weight:700; color:#7a5cff; margin-bottom:0.5em;">[{st.session_state.result}] 해설</div>
            <div style="font-size:1.08rem; color:#444;">{st.session_state.description}</div>
        </div>
        """, unsafe_allow_html=True)
        
        # 결과 공유 버튼
        st.markdown("### 📱 결과 공유하기")
        share_text = f"나의 테토에겐 유형은 {st.session_state.result}입니다! 🎭"
        st.code(share_text)
        
        # 다시 테스트하기 버튼
        if st.button("다시 테스트하기", use_container_width=True):
            st.session_state.test_started = False
            st.session_state.current_question = 0
            st.session_state.answers = []
            st.session_state.test_completed = False
            st.rerun()

if __name__ == "__main__":
    run()

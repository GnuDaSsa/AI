import os
import time
import sys
from dotenv import load_dotenv
import openai
import streamlit as st
from PyPDF2 import PdfReader

# .env 파일에서 환경변수 로드
load_dotenv()

# 최신 openai 방식: 클라이언트 객체 생성
api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=api_key)

def typewriter_effect(text, speed=0.03):
    """
    타이핑 효과로 텍스트를 출력
    """
    for char in text:
        print(char, end='', flush=True)
        time.sleep(speed)
    print()

def generate_streaming_press_release(topic):
    """
    스트리밍 방식으로 보도자료 생성
    """
    prompt = f"""
    당신은 성남시청 홍보 담당자입니다. 아래 주제로 공식 보도자료를 작성하세요. 
    - 주제: {topic}
    - 분량: 500자 내외
    - 형식: 제목, 본문(3~4문단)
    - 어투: 공식적이고 신뢰감 있게
    """
    
    try:
        # 최신 openai 방식 (stream 지원)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
            temperature=0.7,
            stream=True
        )
        
        full_response = ""
        print("\n" + "="*50)
        print("AI가 보도자료를 작성 중입니다...")
        print("="*50 + "\n")
        
        for chunk in response:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_response += content
                # 실시간으로 타이핑 효과
                typewriter_effect(content, speed=0.01)
        
        return full_response
        
    except Exception as e:
        return f"오류 발생: {e}"

def generate_with_loading_animation(topic):
    """
    로딩 애니메이션과 함께 보도자료 생성
    """
    loading_chars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    
    print("\nAI가 보도자료를 생성 중입니다...")
    
    # 로딩 애니메이션
    for i in range(10):
        print(f"\r{loading_chars[i]} AI가 생각 중... {i*10}%", end='', flush=True)
        time.sleep(0.2)
    
    print("\n\n" + "="*50)
    print("보도자료 생성 완료!")
    print("="*50 + "\n")
    
    # 실제 생성
    return generate_streaming_press_release(topic)

def interactive_press_generator():
    """
    인터랙티브한 보도자료 생성기
    """
    print("🎯 성남시 보도자료 실시간 생성기")
    print("="*50)
    
    while True:
        print("\n📝 보도자료 주제/키워드를 입력하세요 (종료: 'quit' 또는 'exit'):")
        topic = input("> ").strip()
        
        if topic.lower() in ['quit', 'exit', '종료']:
            print("\n👋 보도자료 생성기를 종료합니다.")
            break
        
        if not topic:
            print("❌ 주제를 입력해주세요.")
            continue
        
        # 생성 시작
        result = generate_with_loading_animation(topic)
        
        # 결과 요약
        print("\n" + "="*50)
        print("📊 생성 완료!")
        print(f"📝 주제: {topic}")
        print(f"📏 글자 수: {len(result)}자")
        print("="*50)
        
        # 계속할지 묻기
        print("\n🔄 다른 주제로 보도자료를 생성하시겠습니까? (y/n):")
        continue_choice = input("> ").strip().lower()
        
        if continue_choice not in ['y', 'yes', '네', '예']:
            print("\n👋 보도자료 생성기를 종료합니다.")
            break

def extract_pdf_text(file):
    try:
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text.strip()
    except Exception as e:
        return f"PDF 추출 오류: {e}"

def summarize_text(text, client, api_key):
    # 너무 긴 경우 앞부분만 사용 (토큰 제한)
    if len(text) > 3000:
        text = text[:3000]
    prompt = f"""
    아래의 PDF 내용을 5문장 이내로 요약해줘.
    ---
    {text}
    ---
    """
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
            temperature=0.3,
            stream=False
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"요약 오류: {e}"

def run():
    st.title("성남시 보도자료 생성기 (AI)")
    st.markdown("OpenAI API를 활용해 주제에 맞는 공식 보도자료를 생성합니다.")
    topic = st.text_input("📝 보도자료 주제/키워드 입력")
    length = st.radio("원하는 보도자료 분량(글자 수)", [500, 700, 900, 1100], index=0, horizontal=True)
    pdf_file = st.file_uploader("참고할 PDF 파일 업로드 (선택)", type=["pdf"])
    pdf_text = ""
    pdf_summary = ""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "sk-your-api-key-here":
        st.error("OPENAI_API_KEY 환경변수가 설정되어 있지 않습니다. .env 파일 또는 환경변수를 확인해주세요.")
        return
    client = openai.OpenAI(api_key=api_key)
    if pdf_file:
        with st.spinner("PDF에서 텍스트 추출 중..."):
            pdf_text = extract_pdf_text(pdf_file)
            if pdf_text and not pdf_text.startswith("PDF 추출 오류"):
                pdf_summary = summarize_text(pdf_text, client, api_key)
                st.success("PDF 요약 결과:")
                st.info(pdf_summary)
            else:
                st.error(pdf_text)
    if st.button("보도자료 생성하기"):
        if not topic:
            st.warning("주제를 입력해주세요.")
        else:
            with st.spinner("AI가 보도자료를 생성 중입니다..."):
                try:
                    prompt = f"""
                    당신은 성남시청 홍보 담당자입니다. 아래 주제로 공식 보도자료를 작성하세요. 
                    - 주제: {topic}
                    - 분량: 최소 {length-50}자 이상, {length}자에 최대한 가깝게 작성
                    - 형식: 제목, 본문(3~4문단)
                    - 어투: 공식적이고 신뢰감 있게
                    - 글자 수가 부족하면 내용을 더 추가해 주세요.
                    """
                    if pdf_summary:
                        prompt += f"\n- 참고자료: {pdf_summary}"
                    response = client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[{"role": "user", "content": prompt}],
                        max_tokens=2500,  # 넉넉하게 고정
                        temperature=0.7,
                        stream=False
                    )
                    result = response.choices[0].message.content
                    st.success("생성 완료!")
                    st.markdown(f"**주제:** {topic}")
                    st.markdown(f"**글자 수:** {len(result)}자")
                    st.markdown("---")
                    st.write(result)
                except Exception as e:
                    st.error(f"오류 발생: {e}")

if __name__ == "__main__":
    if not api_key or api_key == "sk-your-api-key-here":
        print("❌ OPENAI_API_KEY 환경변수를 설정해주세요.")
        print("💡 .env 파일에서 실제 API 키로 변경하세요.")
        exit(1)
    
    try:
        run()
    except KeyboardInterrupt:
        print("\n\n👋 사용자가 중단했습니다. 프로그램을 종료합니다.")
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        print("🔧 프로그램을 다시 시작해주세요.")
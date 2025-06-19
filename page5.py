import os
from dotenv import load_dotenv
import openai

# .env 파일에서 환경변수 로드
load_dotenv()

def generate_press_release(topic):
    prompt = f"""
    당신은 성남시청 홍보 담당자입니다. 아래 주제로 공식 보도자료를 작성하세요. 
    - 주제: {topic}
    - 분량: 500자 내외
    - 형식: 제목, 본문(3~4문단)
    - 어투: 공식적이고 신뢰감 있게
    """
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800,
        temperature=0.7
    )
    return response.choices[0].message['content'].strip()

if __name__ == "__main__":
    print("성남시 보도자료 자동 생성기 (OpenAI API 활용)")
    topic = input("보도자료 주제/키워드를 입력하세요: ")

    # OpenAI API 키 환경변수에서 불러오기
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "sk-your-api-key-here":
        print("OPENAI_API_KEY 환경변수를 설정해주세요.")
        print(".env 파일에서 실제 API 키로 변경하세요.")
        exit(1)
    openai.api_key = api_key

    print("\nAI가 보도자료를 생성 중입니다...\n")
    try:
        result = generate_press_release(topic)
        print(result)
    except Exception as e:
        print(f"오류 발생: {e}")
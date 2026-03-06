define n = Character(None)
define p = Character("주인공", color="#d9f0ff")
define deputy = Character("차석", color="#ffe0b3")
define junior_one = Character("삼석", color="#ffd7a8")
define junior_two = Character("사석", color="#ffe8c7")
define chief = Character("팀장", color="#ffd0d0")
define manager = Character("과장", color="#f6c1ff")
define mayor = Character("시장", color="#e6e6e6")
define district = Character("구청장", color="#e6ffd8")
define caller = Character("민원인", color="#ffcccc")
define buddy = Character("동기", color="#d0ffd8")

image bg city_hall = "images/bg/city_hall.png"
image bg district_office_exterior = "images/bg/district_office_exterior.png"
image bg office_construction = "images/bg/office_construction.png"
image bg winter_road = "images/bg/winter_road.png"
image bg spring_street = "images/bg/spring_street.png"
image bg office_evening = "images/bg/office_evening.png"

image protagonist default = "images/chars/protagonist_default.png"
image manager default = "images/chars/manager_default.png"
image chief default = "images/chars/chief_default.png"
image deputy default = "images/chars/deputy_default.png"
image junior_one default = "images/chars/junior_one_default.png"
image junior_two default = "images/chars/junior_two_default.png"
image buddy default = "images/chars/buddy_default.png"
image caller default = "images/chars/caller_default.png"

default mentality = 0
default team_bond = 0

transform sprite_left:
    zoom 0.50
    xalign 0.24
    yalign 1.0

transform sprite_left_low:
    zoom 0.50
    xalign 0.24
    yalign 1.0
    yoffset 90

transform sprite_center:
    zoom 0.50
    xalign 0.5
    yalign 1.0

transform sprite_center_low:
    zoom 0.50
    xalign 0.5
    yalign 1.0
    yoffset 90

transform sprite_right:
    zoom 0.50
    xalign 0.76
    yalign 1.0

transform sprite_right_low:
    zoom 0.50
    xalign 0.76
    yalign 1.0
    yoffset 90

transform caller_left:
    zoom 1.35
    xpos 860
    yalign 1.0
    yoffset 10

label hide_chars:
    hide protagonist default
    hide manager default
    hide chief default
    hide deputy default
    hide junior_one default
    hide junior_two default
    hide buddy default
    hide caller default
    return

label start:
    scene black
    with fade

    n "1년의 수험기간 끝에 공무원에 합격했다."
    n "안전한 철밥통의 미래가 나를 기다린다."
    n "적어도 그때의 나는, 그렇게 믿고 있었다."
    n "당신의 직렬은?"

    menu:
        "토목직":
            jump choose_civil

label choose_civil:
    call hide_chars
    $ mentality += 1
    show protagonist default at sprite_center
    n "토목직."
    n "서류에 적힌 두 글자가 왠지 단단해 보였다."
    n "도로, 하천, 공사, 현장."
    n "어쩐지 세상을 실제로 움직이는 일 같았다."
    hide protagonist default
    jump appointment_day

label appointment_day:
    call hide_chars
    scene bg city_hall
    with fade
    n "발령 당일."
    n "정장을 입은 동기들과 함께 시청 대강당에 줄지어 섰다."
    mayor "임용을 축하합니다. 시민을 위해 책임감을 갖고 일해주시기 바랍니다."
    n "시장님의 손에서 임용장을 받는 순간, 드디어 인생이 시작되는 것 같았다."
    show buddy default at sprite_left
    show protagonist default at sprite_right
    buddy "야, 우리 진짜 공무원 됐다."
    p "그러게. 이제 고생 끝이지."
    n "그 말은 오래 가지 못했다."

    hide buddy default
    hide protagonist default

    scene bg district_office_exterior
    with fade

    n "오후에는 곧바로 중원구청으로 이동했다."
    district "반갑습니다. 각 부서에서 잘 적응하시길 바랍니다."
    n "인사를 마치고 나는 건설과로 배치되었다."
    jump first_desk

label first_desk:
    call hide_chars
    scene bg office_construction
    with dissolve
    n "사무실 문이 열리자 프린터 소리와 전화벨, 서류 넘기는 소리가 한꺼번에 들이쳤다."
    show chief default at sprite_right
    chief "오늘부터 우리 팀에서 일할 신규야. 다들 얼굴만 익혀둬."
    n "과장, 팀장, 차석, 삼석, 사석."
    n "그리고 맨 끝에 나."

    hide chief default
    show manager default at sprite_left
    manager "건설과는 처음부터 설명서가 친절한 곳은 아니야."

    hide manager default
    show deputy default at sprite_left
    deputy "이쪽 와서 앉아요. 오늘부터 여기 자리 써요."

    hide deputy default
    show junior_one default at sprite_left_low
    junior_one "모르면 메모부터 해요. 나중에 진짜 기억 안 납니다."

    hide junior_one default
    show junior_two default at sprite_right_low
    junior_two "전화 오면 일단 떨지 말고, 누가 언제 뭘 원하는지만 적어요."
    hide junior_two default

    n "여기저기 인사를 드리고 안내받은 자리에 앉았다."
    n "책상에는 먼지가 수북했고, 모니터 옆엔 이름 모를 열쇠 하나가 굴러다니고 있었다."
    show protagonist default at sprite_right
    p "이게 뭐지..."
    n "그 찰나, 전화가 울렸다."
    jump first_call

label first_call:
    call hide_chars
    show caller default at caller_left
    caller "여보세요? 도로 파헤쳐놓고 왜 아직도 정리를 안 해요?"
    show protagonist default at sprite_right
    p "아, 제가 오늘 처음 와서..."
    caller "처음 오면 아무것도 안 해도 돼요? 담당이면 책임을 져야지!"
    n "욕은 아니었지만, 욕보다 더 선명하게 아팠다."
    $ mentality -= 1

    hide caller default
    show deputy default at sprite_left
    deputy "일단 메모해요. 위치, 연락처, 뭐가 문제인지."
    deputy "그리고 이 파일이랑 이 종이 두 장. 전임자가 남긴 인수인계예요."
    n "파일은 뒤죽박죽 정리된 공사 서류철이었고, 종이 두 장에는 공사명과 업체명, 민원 다발 지점만 적혀 있었다."
    deputy "지금부터 이 구간 공사 담당은 당신이에요. 책임감 있어야 해요."
    p "네..."
    n "근데 진짜 하나도 무슨 소린지 모르겠다."

    menu:
        "일단 아는 척하며 메모부터 정리한다":
            $ mentality += 1
            $ team_bond += 1
            jump early_days
        "솔직하게 잘 모르겠다고 다시 묻는다":
            $ team_bond += 2
            jump early_days

label early_days:
    call hide_chars
    n "그날 이후로는 매일이 속도전이었다."
    n "결재선, 설계변경, 준공계, 기성검사."
    n "단어는 계속 들리는데 문장은 끝까지 이해되지 않았다."

    show chief default at sprite_right
    show manager default at sprite_left

    chief "오전에 현장 나갔다 와서 보고 올리고, 업체에도 전화 넣어."
    manager "민원 들어오면 혼자 끌어안지 말고 꼭 보고해."

    hide chief default
    hide manager default
    show deputy default at sprite_left
    deputy "모르면 물어봐요. 대신 같은 걸 세 번은 묻지 말고."
    hide deputy default
    show junior_one default at sprite_left_low
    show junior_two default at sprite_right_low

    junior_one "처음 3개월은 원래 다 멍합니다."
    junior_two "저도 아직 멍해요."

    n "하루 종일 정신없이 움직이다 보면 퇴근 무렵엔 내가 뭘 한 건지 설명도 못 하겠는데, 이상하게 다음 날 아침엔 또 출근하고 있었다."
    jump winter_arc

label winter_arc:
    call hide_chars
    scene bg winter_road
    with fade

    show chief default at sprite_left

    n "계절이 바뀌고 겨울이 왔다."
    n "건설과의 공기는 더 차가워졌고, 설해대책 기간이 시작되었다."
    chief "오늘 밤 눈 예보 있어. 비상대기 걸릴 수 있으니까 핸드폰 소리 키워둬."
    n "새벽에 울리는 단체 연락, 제설재 확인, 민원 대비 연락망."
    n "처음에는 내가 왜 새벽 다섯 시에 도로 결빙 사진을 보고 있는지 이해할 수 없었다."

    menu:
        "투덜거리면서도 현장 흐름을 익힌다":
            $ mentality += 1
            jump winter_relief
        "긴장한 채로 매뉴얼을 반복해서 읽는다":
            $ team_bond += 1
            jump winter_relief

label winter_relief:
    call hide_chars
    show deputy default at sprite_right

    n "그래도 겨울에는 한 가지 위안이 있었다."
    n "3월까지는 추워서 사람들이 덜 싸돌아다닌다."
    n "도로 점용이니 포장 파손이니 주정차 동선이니, 그런 민원이 확실히 줄었다."
    n "사무실 난방 바람을 맞으며 조용한 오전을 보내는 날이면, 아주 잠깐 행복하다는 생각도 들었다."
    deputy "이때 숨 좀 돌려놔요. 4월 오면 다시 시작이니까."
    n "그 말은 예언이었다."
    jump spring_arc

label spring_arc:
    call hide_chars
    scene bg spring_street
    with fade

    n "4월이 되자 민원이 돌아왔다."
    n "날씨가 풀리자 사람들도 밖으로 나왔고, 불편도 요구도 같이 살아났다."
    show caller default at caller_left
    caller "이거 원래 안 되는 거 아는데, 이번만 되게 해주시면 안 돼요?"
    caller "옆 건물은 해줬다던데 왜 우리만 안 돼요?"
    caller "오늘 당장 공사 차량 빼고, 소음도 없애고, 통행도 보장해주세요."

    n "안 되는 걸 되게 해달라는 말은 언제나 아주 자연스러운 얼굴로 도착했다."
    n "현장 확인을 나가면 업체는 예산과 일정 얘기를 하고, 민원인은 지금 당장 해결하라고 하고, 내부에선 절차부터 확인하라고 했다."
    show protagonist default at sprite_right
    p "다 맞는 말 같은데 동시에 다 들어줄 수는 없잖아요..."

    menu:
        "원칙대로 설명하고 욕을 먹는다":
            $ mentality -= 1
            jump spring_resolution
        "최대한 중간안을 찾아 뛰어다닌다":
            $ mentality -= 1
            $ team_bond += 1
            jump spring_resolution

label spring_resolution:
    call hide_chars
    show deputy default at sprite_left
    show manager default at sprite_right

    n "어느 쪽을 택해도 완벽한 해결은 없었다."
    n "대신 조금씩 알게 되었다."
    n "민원은 문제 하나만 담고 오는 게 아니라, 사람의 조급함과 억울함과 기대까지 같이 실려 온다는 걸."
    deputy "버티는 것도 실력이에요."
    manager "그래도 너, 처음보단 표정이 덜 놀라네."
    n "그 말이 칭찬인지 위로인지는 모르겠지만, 이상하게 오래 남았다."
    jump transfer_end

label transfer_end:
    call hide_chars
    scene bg office_evening
    with fade

    show buddy default at sprite_left

    n "그렇게 정신없이 계절이 한 바퀴 돌았다."
    n "모든 게 익숙해질 즈음, 인사이동 명단이 내려왔다."
    buddy "야, 나 다른 동으로 간다."

    hide buddy default
    show deputy default at sprite_left
    show protagonist default at sprite_right

    deputy "저도 이번에 이동이에요. 다음 담당자 오면 파일 위치부터 알려줘야겠네."
    show junior_one default at sprite_center_low
    junior_one "차석님 가시면 팀 분위기 진짜 달라지겠는데요."
    hide junior_one default
    show junior_two default at sprite_center_low
    junior_two "이제 나는 누구 뒤에 숨어야 하지..."
    p "이제 좀 알 것 같았는데, 또 바뀌네요."
    deputy "원래 그런 거예요. 남는 사람도 있고, 가는 사람도 있고."

    n "정든 사람들과 인사를 나누는 순간, 입직 첫날보다 더 이상한 기분이 들었다."
    n "도망치고 싶던 곳인데, 막상 떠난다니 아쉬웠다."
    n "1년 전의 나는 철밥통을 상상했다."
    n "지금의 나는, 사람과 현장과 민원 사이에서 겨우 버티는 법을 조금 배웠다."
    n "그리고 내일도 아마, 전화벨 소리와 함께 공무원 인생은 계속될 것이다."
    "1년 차 토목직 엔딩"
    return

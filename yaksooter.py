import tkinter as tk
from PIL import Image, ImageTk
import os
from tkinter import messagebox
import re

class YaksooterApp:
    def __init__(self, root):
        self.root = root
        self.root.title("약수터 지도")
        # 이미지 경로를 절대경로로 직접 지정
        self.map_path = os.path.join(r"C:\Users\Owner\Desktop\사진우\AI\gnudasAI\yakimages", "all.jpg")
        print("map_path:", self.map_path)
        if not os.path.exists(self.map_path):
            messagebox.showerror("오류", f"지도 이미지를 찾을 수 없습니다:\n{self.map_path}")
            return
        
        self.original_map_image = Image.open(self.map_path)
        orig_w, orig_h = self.original_map_image.size

        self.canvas = tk.Canvas(root, width=orig_w, height=orig_h)
        self.canvas.pack()

        self.bg_photo = ImageTk.PhotoImage(self.original_map_image)
        self.map_id = self.canvas.create_image(0, 0, anchor="nw", image=self.bg_photo)
        self.current_image = self.original_map_image

        self.labels = [
            {"name": "독정",     "x": 116, "y": 109},
            {"name": "영장",     "x": 121, "y": 75},
            {"name": "윗가마절", "x": 132, "y": 43},
            {"name": "약진로변", "x": 270, "y": 53},
            {"name": "단대공원", "x": 297, "y": 111},
            {"name": "능골",     "x": 49,  "y": 176},
            {"name": "중원",     "x": 438, "y": 19},
            {"name": "산성",     "x": 442, "y": 49},
            {"name": "고당",     "x": 442, "y": 82},
            {"name": "망덕",     "x": 411, "y": 122},
            {"name": "사곡천",   "x": 299, "y": 163},
            {"name": "윗사기막", "x": 451, "y": 161},
            {"name": "뫼우리",   "x": 454, "y": 223},
            {"name": "하대원",   "x": 267, "y": 263},
            {"name": "윗속말",   "x": 251, "y": 315},
            {"name": "뒷골",     "x": 239, "y": 360},
            {"name": "중앙공원", "x": 177, "y": 639},
            {"name": "대도사",   "x": 329, "y": 671},
            {"name": "매화",     "x": 262, "y": 406},
            {"name": "무지개",   "x": 132, "y": 913}
        ]
        self.label_items = {}
        self.create_label_buttons()

        self.zoom_overlay_id = None
        self.arrow_group = None
        self.zoom_folder = None
        self.zoom_images = []
        self.zoom_index = 0

        self.back_button = tk.Button(root, text="뒤로가기", command=self.go_back,
                                      bg="blue", fg="white", font=("Arial", 12, "bold"))
        self.back_button.place_forget()

    def create_label_buttons(self):
        button_width = 105
        button_height = 33
        radius = 14  # 둥근 정도
        shadow_offset = 3  # 그림자 거리
        for label in self.labels:
            x = label["x"]
            y = label["y"]
            name = label["name"]

            # 그림자(불투명 회색)
            shadow = self.create_round_rect(
                self.canvas,
                x - button_width // 2 + shadow_offset, y - button_height // 2 + shadow_offset,
                x + button_width // 2 + shadow_offset, y + button_height // 2 + shadow_offset,
                radius, fill="#888888", outline=""
            )
            # 흰색 라운드 사각형
            rect_id = self.create_round_rect(
                self.canvas,
                x - button_width // 2, y - button_height // 2,
                x + button_width // 2, y + button_height // 2,
                radius, fill="#ffffff", outline="#222", width=2
            )
            # 텍스트 그림자
            text_shadow = self.canvas.create_text(
                x+1, y+1, text=name, fill="#888888", font=("Arial", 11, "bold")
            )
            # 텍스트
            text_id = self.canvas.create_text(
                x, y, text=name, fill="#222", font=("Arial", 11, "bold")
            )
            self.canvas.tag_bind(rect_id, "<Button-1>", lambda event, n=name: self.on_label_click(n))
            self.canvas.tag_bind(text_id, "<Button-1>", lambda event, n=name: self.on_label_click(n))
            self.canvas.tag_bind(text_shadow, "<Button-1>", lambda event, n=name: self.on_label_click(n))
            self.label_items[name] = {
                "rect": rect_id,
                "text": text_id,
                "shadow": shadow,
                "text_shadow": text_shadow
            }

    def on_label_click(self, name):
        # 확대 이미지 폴더 경로도 절대경로로 지정
        self.zoom_folder = os.path.join(r"C:\Users\Owner\Desktop\사진우\AI\gnudasAI\yakimages", name)
        if not os.path.exists(self.zoom_folder):
            messagebox.showerror("오류", f"{name} 폴더를 찾을 수 없습니다:\n{self.zoom_folder}")
            return

        files = os.listdir(self.zoom_folder)
        pattern = re.compile(r'^map(\d*)\.(jpg|png)$', re.IGNORECASE)
        self.zoom_images = [f for f in files if pattern.match(f)]
        if not self.zoom_images:
            messagebox.showerror("오류", f"{name} 폴더에 확대 이미지가 없습니다.")
            return

        def sort_key(f):
            m = pattern.match(f)
            num_str = m.group(1)
            return int(num_str) if num_str.isdigit() else 0
        self.zoom_images.sort(key=sort_key)
        self.zoom_index = 0

        current_file = os.path.join(self.zoom_folder, self.zoom_images[self.zoom_index])
        print(f"Loading zoom image for '{name}' from: {current_file}")
        try:
            zoom_img = Image.open(current_file)
            self.current_image = zoom_img
            zoom_photo = ImageTk.PhotoImage(zoom_img)
            self.canvas.config(width=zoom_img.width, height=zoom_img.height)
            self.canvas.itemconfig(self.map_id, image=zoom_photo)
            self.bg_photo = zoom_photo

            for item in self.label_items.values():
                self.canvas.itemconfig(item["rect"], state="hidden")
                self.canvas.itemconfig(item["text"], state="hidden")
                # 그림자와 텍스트 그림자도 숨김
                self.canvas.itemconfig(item["shadow"], state="hidden")
                self.canvas.itemconfig(item["text_shadow"], state="hidden")

            canvas_width = self.canvas.winfo_width()
            self.zoom_overlay_id = self.canvas.create_text(
                canvas_width // 2, 30,
                text=name, fill="red", font=("Arial", 36, "bold")
            )
            self.back_button.place(x=30, y=30, width=100, height=40)

            if len(self.zoom_images) > 1:
                self.create_right_arrow()

        except Exception as e:
            messagebox.showerror("오류", f"확대 이미지 로드 중 오류:\n{str(e)}")

    def create_right_arrow(self):
        canvas_width = self.canvas.winfo_width()
        canvas_height = self.canvas.winfo_height()
        arrow_width = 80
        arrow_height = 80
        x1 = canvas_width - arrow_width - 10
        y1 = (canvas_height - arrow_height) // 2
        x2 = x1 + arrow_width
        y2 = y1 + arrow_height
        rect_id = self.canvas.create_rectangle(x1, y1, x2, y2, fill="orange", outline="red", width=3)
        text_id = self.canvas.create_text((x1+x2)//2, (y1+y2)//2,
                                           text="다음", fill="black", font=("Arial", 20, "bold"))
        self.canvas.addtag_withtag("next_btn", rect_id)
        self.canvas.addtag_withtag("next_btn", text_id)
        self.canvas.tag_bind("next_btn", "<Button-1>", lambda event: self.next_zoom_image())
        self.arrow_group = {"rect": rect_id, "text": text_id}

    def next_zoom_image(self):
        if not self.zoom_images:
            return
        self.zoom_index = (self.zoom_index + 1) % len(self.zoom_images)
        next_file = os.path.join(self.zoom_folder, self.zoom_images[self.zoom_index])
        print(f"Loading next zoom image: {next_file}")
        try:
            next_img = Image.open(next_file)
            self.current_image = next_img
            next_photo = ImageTk.PhotoImage(next_img)
            self.canvas.config(width=next_img.width, height=next_img.height)
            self.canvas.itemconfig(self.map_id, image=next_photo)
            self.bg_photo = next_photo

            canvas_width = self.canvas.winfo_width()
            canvas_height = self.canvas.winfo_height()
            arrow_width = 80
            arrow_height = 80
            x1 = canvas_width - arrow_width - 10
            y1 = (canvas_height - arrow_height) // 2
            x2 = x1 + arrow_width
            y2 = y1 + arrow_height
            self.canvas.coords(self.arrow_group["rect"], x1, y1, x2, y2)
            self.canvas.coords(self.arrow_group["text"], (x1+x2)//2, (y1+y2)//2)

        except Exception as e:
            messagebox.showerror("오류", f"다음 확대 이미지 로드 중 오류:\n{str(e)}")

    def go_back(self):
        self.current_image = self.original_map_image
        orig_photo = ImageTk.PhotoImage(self.original_map_image)
        w, h = self.original_map_image.size
        self.canvas.config(width=w, height=h)
        self.canvas.itemconfig(self.map_id, image=orig_photo)
        self.bg_photo = orig_photo

        for item in self.label_items.values():
            self.canvas.itemconfig(item["rect"], state="normal")
            self.canvas.itemconfig(item["text"], state="normal")
            # 그림자와 텍스트 그림자도 복원
            self.canvas.itemconfig(item["shadow"], state="normal")
            self.canvas.itemconfig(item["text_shadow"], state="normal")

        if self.zoom_overlay_id:
            self.canvas.delete(self.zoom_overlay_id)
            self.zoom_overlay_id = None

        if self.arrow_group:
            self.canvas.delete(self.arrow_group["rect"])
            self.canvas.delete(self.arrow_group["text"])
            self.arrow_group = None

        self.zoom_folder = None
        self.zoom_images = []
        self.zoom_index = 0

        self.back_button.place_forget()

    def create_round_rect(self, canvas, x1, y1, x2, y2, r=14, **kwargs):
        # 4개의 모서리에 타원, 4개의 변에 직선
        points = [
            (x1+r, y1), (x2-r, y1), (x2, y1), (x2, y1+r),
            (x2, y2-r), (x2, y2), (x2-r, y2), (x1+r, y2),
            (x1, y2), (x1, y2-r), (x1, y1+r), (x1, y1)
        ]
        # Tkinter 8.6 이상에서만 smooth=True로 곡선 지원
        return canvas.create_polygon(points, smooth=True, splinesteps=36, **kwargs)

if __name__ == "__main__":
    root = tk.Tk()
    app = YaksooterApp(root)
    root.mainloop()

import os
import runpy


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
main_app_path = os.path.join(BASE_DIR, "main", "app.py")

runpy.run_path(main_app_path, run_name="__main__")

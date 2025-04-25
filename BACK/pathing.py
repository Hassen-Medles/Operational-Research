import os


curent_dir = os.path.dirname(os.path.abspath(__file__))
print(curent_dir)
parent = os.path.dirname(curent_dir)
# Configuration
UPLOAD_FOLDER = os.path.join(parent,os.path.join("save","img"))
GRAPH_FOLDER = os.path.join(parent,os.path.join("save","graph"))
CONFIG_FOLDER = os.path.join(parent,"save")
print("upload dans"+UPLOAD_FOLDER)
print("graph dans"+GRAPH_FOLDER)
print("config dans"+CONFIG_FOLDER)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(GRAPH_FOLDER, exist_ok=True)

 
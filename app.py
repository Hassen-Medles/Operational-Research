from flask import Flask, jsonify, render_template, redirect, url_for, request, send_from_directory
import os
import json
import random
import networkx as nx
import glob


# Configuration
UPLOAD_FOLDER = "save/img"
GRAPH_FOLDER = "save/graph"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(GRAPH_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Génération d'un graphe pour test
random.seed(42)
num_clients = 4
depot = 0
nodes = [depot] + [i for i in range(1, num_clients + 1)]
G = nx.Graph()
for node in nodes:
    x_ratio = round(random.uniform(0, 1), 4)
    y_ratio = round(random.uniform(0, 1), 4)
    G.add_node(node, x_ratio=x_ratio, y_ratio=y_ratio)
for i in nodes:
    for j in nodes:
        if i < j:
            distance = round(random.uniform(1, 50), 2)
            cost = round(random.uniform(1, 50), 2)
            time = round(random.uniform(1, 60), 2)
            G.add_edge(i, j, distance=distance, cost=cost, time=time)



dicograph = {
    "Node": [
        {
            "id": node,
            "x_ratio": G.nodes[node]["x_ratio"],
            "y_ratio": G.nodes[node]["y_ratio"]
        } for node in G.nodes()
    ],
    "Edges": [
        {"from": u, "to": v, **attrs} for u, v, attrs in G.edges(data=True)
    ],
}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/graph")
def grap():
    response = jsonify(dicograph)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response



@app.route("/upload_image", methods=["POST", "OPTIONS"])
def upload_image():
    if request.method == "OPTIONS":
        # Réponse à la pré-requête CORS
        response = app.make_response('')
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response

    if 'files' not in request.files:
        response = jsonify({"error": "No file part"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 400

    files = request.files.getlist("files")
    saved_files = []

    for file in files:
        if file.filename == '':
            continue
        filename = file.filename  # ou secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        saved_files.append(filename)

    graph_str = request.form.get("graph")
    if not graph_str:
        return jsonify({"error": "No graph data provided"}), 400

    try:
        graph_data = json.loads(graph_str)
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON in graph data"}), 400

# Créer une nouvelle configuration à partir de l'image et du graphe envoyé
    config_name = f"config_{len(os.listdir(GRAPH_FOLDER)) + 1}.json"
    config_data = {
    "image": saved_files[0],
    "graph": graph_data,
    }

# Sauvegarder la configuration dans un fichier JSON formaté
    with open(os.path.join(GRAPH_FOLDER, config_name), "w") as f:
        json.dump(config_data, f, indent=4)  # Indentation ajoutée pour lisibilité

    response = jsonify({"status": "success", "saved": saved_files, "config_name": config_name})

    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

 
 
 
@app.route("/image/<filename>")
def serve_image(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)




@app.route("/list_configs", methods=["GET"])
def list_configs():
    # Données de configuration
    configurations = os.listdir(GRAPH_FOLDER)  # Liste des configurations sauvegardées
    response = jsonify(configurations)

    # Ajout des en-têtes CORS
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "GET, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")

    return response

@app.route("/load_config/<filename>", methods=["GET"])
def load_config(filename):
    try:
        # Charger la configuration (les données du fichier)
        with open(os.path.join(GRAPH_FOLDER, filename), "r") as f:
            config_data = json.load(f)

        response = jsonify(config_data)

        # Ajout des en-têtes CORS
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "GET, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")

        return response
    except FileNotFoundError:
        return jsonify({"error": "Configuration not found"}), 404

@app.route("/delete_config/<filename>", methods=["DELETE", "OPTIONS"])
def delete_config(filename):
    if request.method == "OPTIONS":
        # Réponse à la pré-requête CORS
        response = app.make_response('')
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "DELETE, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response

    try:
        # Construire le chemin du fichier à supprimer
        file_path = os.path.join(GRAPH_FOLDER, filename)
        
        # Vérifier si le fichier existe
        if os.path.exists(file_path):
            os.remove(file_path)  # Supprimer le fichier
            response = jsonify({"status": "success", "message": f"Configuration {filename} deleted"})
        else:
            response = jsonify({"error": "Configuration not found"}), 404

        # Ajouter les en-têtes CORS à la réponse
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "DELETE, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")

        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

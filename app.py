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


@app.route("/upload_image/<config_name>", methods=["POST", "OPTIONS"])
def upload_image(config_name):
    if request.method == "OPTIONS":
        response = app.make_response('')
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response

    if 'image' not in request.files:
        response = jsonify({"error": "No image file in request"})
        response.status_code = 400
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    image_file = request.files['image']
    if image_file.filename == '':
        response = jsonify({"error": "No selected file"}), 400
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    filename = image_file.filename
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    image_file.save(filepath)

    # Chargement de la config globale
    config_file_path = os.path.join("save", "config.json")
    try:
        with open(config_file_path, 'r') as f:
            config_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        config_data = {}

    # Mise à jour ou création de l'entrée
    if config_name not in config_data:
        config_data[config_name] = {}
    config_data[config_name]["image"] = filename
    if "graph" not in config_data[config_name]:
        config_data[config_name]["graph"] = f"{config_name}.json"

    # Sauvegarde de la config
    os.makedirs("save", exist_ok=True)
    with open(config_file_path, 'w') as f:
        json.dump(config_data, f, indent=2)

    response = jsonify({"message": f"Image saved as {filename}", "config": config_name})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/add_config/<config_name>", methods=["POST"])
def add_config(config_name):
    try:
        # Ajout des en-têtes CORS manuellement
        response = jsonify({"message": "Configuration créée avec succès", "config": config_name})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")

        # Si la requête est de type OPTIONS, on retourne juste les en-têtes CORS
        if request.method == "OPTIONS":
            return response

        # Vérifie si le nom de la configuration est valide
        if not config_name:
            return jsonify({"error": "Nom de configuration manquant"}), 400

        # Chemin vers la configuration JSON
        config_path = os.path.join(GRAPH_FOLDER, f"{config_name}.json")

        # Si le fichier de configuration existe déjà, on ne le recrée pas
        if os.path.exists(config_path):
            return jsonify({"error": f"La configuration {config_name} existe déjà"}), 400

        # Crée une configuration vide
        graph_data = {
            
            "graph": {
                        "Nodes":[],
                        "Edges":[]
            }
                        
        }
        

        # Crée le fichier de configuration
        os.makedirs(GRAPH_FOLDER, exist_ok=True)  # Assure-toi que le dossier existe
        with open(config_path, 'w') as f:
            json.dump(graph_data, f, indent=2)

        config_json_path = os.path.join("save", "config.json")
        if os.path.exists(config_json_path):
            with open(config_json_path, "r") as f:
                all_configs = json.load(f)
        else:
            all_configs = {}

        all_configs[config_name] = {
            "graph": f"{config_name}.json",
            "image": ""  # à remplir plus tard via /upload_image
        }

        with open(config_json_path, "w") as f:
            json.dump(all_configs, f, indent=2)


        return response



    except Exception as e:
        print(f"Erreur: {e}")
        return jsonify({"error": "Erreur lors de la création de la configuration"}), 500



@app.route("/upload_graph/<config_name>", methods=["POST", "OPTIONS"])
def upload_graph(config_name):
    if request.method == "OPTIONS":
        response = app.make_response('')
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response

    data = request.get_json()
    if not data:
        response = jsonify({"error": "No JSON data received"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 400

    config_json_path = os.path.join("save", "config.json")

    try:
        with open(config_json_path, "r") as f:
            config_data = json.load(f)
    except FileNotFoundError:
        return jsonify({"error": "config.json not found"}), 404

    if config_name not in config_data:
        return jsonify({"error": f"Configuration '{config_name}' not found in config.json"}), 404

    graph_filename = config_data[config_name].get("graph")
    if not graph_filename:
        return jsonify({"error": f"No graph filename defined for configuration '{config_name}'"}), 400

    graph_path = os.path.join(GRAPH_FOLDER, graph_filename)
    os.makedirs(GRAPH_FOLDER, exist_ok=True)
    print("enregistre"+str(data))
    with open(graph_path, 'w') as f:
        json.dump(data, f, indent=2)

    response = jsonify({"message": f"Graph saved under {graph_filename}"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response



    # Sauvegarde du graphe
    graph_path = os.path.join(GRAPH_FOLDER, f"{config_name}.json")
    os.makedirs(GRAPH_FOLDER, exist_ok=True)
    with open(graph_path, 'w') as f:
        json.dump(data, f, indent=2)

    response = jsonify({"message": f"Graph saved under {config_name}.json"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

 
 
 
@app.route("/image/<filename>")
def serve_image(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)



@app.route("/list_configs", methods=["GET"])
def list_configs():
    config_json_path = os.path.join("save", "config.json")

    if not os.path.exists(config_json_path):
        return jsonify([])  # retourne une liste vide si aucun fichier n'existe

    with open(config_json_path, "r") as f:
        all_configs = json.load(f)

    # On renvoie uniquement les noms de config (les clés du dict)
    response = jsonify(list(all_configs.keys()))

    # Ajout des en-têtes CORS
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "GET, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")

    return response


@app.route("/load_config/<filename>", methods=["GET"])
def load_config(filename):
    try:
        with open(os.path.join("save", "config.json"), "r") as f:
            configuration_data = json.load(f)

            image = configuration_data[filename]["image"]

        # Charger la configuration (les données du fichier)
        with open(os.path.join(GRAPH_FOLDER, configuration_data[filename]["graph"]), "r") as f:
            config_data = json.load(f)
            
        prereponse= {"graph":config_data,"image":image}

        response = jsonify(prereponse)

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


import os
import json


def litjsonfichier(GRAPH_FOLDER,filename):
    try:
        with open(os.path.join(GRAPH_FOLDER, filename), "r") as f:
            config_data = json.load(f)
            return config_data
    except FileNotFoundError:
        print("Fichier non trouvé")
        return None
    
    
def sauvegarder_json(GRAPH_FOLDER,data, filename):
    try:
        with open(os.path.join(GRAPH_FOLDER, filename), "w") as f:
            json.dump(data, f, indent=4)
    except FileNotFoundError:
        print("Fichier non trouvé")
        return None
        
        
        

def maj_config_apres_resolution(GRAPH_FOLDER,nom_fichier_resolu):
    CONFIG_PATH = os.path.join(GRAPH_FOLDER, "..", "config.json")  # ajuste si besoin

    nom_sans_ext = os.path.splitext(nom_fichier_resolu)[0]

    try:
        # Charger config.json s'il existe
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, "r") as f:
                all_configs = json.load(f)
        else:
            all_configs = {}

        # Ajouter ou mettre à jour l'entrée correspondante
        all_configs[nom_sans_ext] = {
            "graph": nom_fichier_resolu,
            "image": ""  # tu peux adapter cette ligne si une image existe déjà
        }

        # Sauvegarder la mise à jour
        with open(CONFIG_PATH, "w") as f:
            json.dump(all_configs, f, indent=2)

        print(f"✅ Configuration mise à jour dans config.json pour {nom_sans_ext}")

    except Exception as e:
        print(f"⚠️ Erreur lors de la mise à jour de config.json : {e}")
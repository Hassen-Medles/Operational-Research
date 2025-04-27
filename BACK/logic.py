from flask import  jsonify
import random
import networkx as nx
import matplotlib.pyplot as plt
from pulp import *
import os
import json


from jsoner import litjsonfichier, sauvegarder_json ,maj_config_apres_resolution
from pathing import UPLOAD_FOLDER, GRAPH_FOLDER
from color import colorier_routes, appliquer_couleurs
from VRP import robust_vrp
from graphage import construire_graphe, trouver_depot






nom_fichier = "base.json"
json_data = litjsonfichier(GRAPH_FOLDER,nom_fichier)



if json_data:
    G = construire_graphe(json_data)
    
    # ⚠️ Assure-toi d’avoir défini la fonction robust_vrp(G, depot) avant ça
    depot = trouver_depot(G)
    routes = robust_vrp(G, depot)

    print("\n🚚 Tournées optimisées :")
    for i, route in enumerate(routes):
        print(f"Camion {i+1} : {' -> '.join(map(str, route))}")

    color_map = colorier_routes(routes, G)
    json_data["graph"]["Edges"] = appliquer_couleurs(json_data["graph"]["Edges"], color_map)

    nouveau_nom = "resolved_" + nom_fichier
    nom_config = os.path.splitext(nom_fichier)[0]
    sauvegarder_json(GRAPH_FOLDER,json_data, nouveau_nom)
    print(f"\n✅ Graphe coloré enregistré dans {nouveau_nom}")
    
    maj_config_apres_resolution(GRAPH_FOLDER,nom_config,nouveau_nom)


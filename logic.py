from flask import  jsonify
import random
import networkx as nx
import matplotlib.pyplot as plt
from pulp import *
import os
import json



GRAPH_FOLDER = "save/graph"

os.makedirs(GRAPH_FOLDER, exist_ok=True)

seed = random.randint(0, 100000)
print(f"Seed : {seed}")

def generate_graph(n, seed, weight_range=(1, 10), probability=0.3):
    if seed is not None:
        random.seed(seed)
    
    G = nx.Graph()
    G.add_nodes_from(range(n))

    # Étape 1 : garantir la connexité en construisant un arbre couvrant
    nodes = list(range(n))
    random.shuffle(nodes)
    for i in range(1, n):
        u = nodes[i]
        v = random.choice(nodes[:i])
        weight = random.randint(*weight_range)
        G.add_edge(u, v, weight=weight)

    # Étape 2 : ajouter des arêtes supplémentaires aléatoires
    for i in range(n):
        for j in range(i + 1, n):
            if not G.has_edge(i, j) and random.random() < probability:  # probabilité d'ajout
                weight = random.randint(*weight_range)
                G.add_edge(i, j, weight=weight)
    return G


def draw_graph(G):
    pos = nx.spring_layout(G)
    weights = nx.get_edge_attributes(G, 'weight')
    nx.draw(G, pos, with_labels=True, node_color='lightblue', node_size=300, font_size=8)
    nx.draw_networkx_edge_labels(G, pos, edge_labels=weights, font_size=6)
    plt.show()
    
    
n = 10
G = generate_graph(n, seed, weight_range=(1, 10), probability=0.3)




def litjsonfichier(filename):
    try:
        with open(os.path.join(GRAPH_FOLDER, filename), "r") as f:
            config_data = json.load(f)
            return config_data
    except FileNotFoundError:
        print("Fichier non trouvé")
        return None
    
    
def sauvegarder_json(data, filename):
    with open(os.path.join(GRAPH_FOLDER, filename), "w") as f:
        json.dump(data, f, indent=4)

def construire_graphe(json_data):
    G = nx.Graph()

    nodes = json_data["graph"]["Node"]
    edges = json_data["graph"]["Edges"]

    # Ajout des sommets avec leurs attributs
    for node in nodes:
        G.add_node(node["id"], label=node["label"], xRatio=node["xRatio"], yRatio=node["yRatio"])

    # Ajout des arêtes avec leurs poids
    for edge in edges:
        G.add_edge(edge["from"], edge["to"],
                   weight=edge["distance"],
                #    cost=edge["cost"],
                #    time=edge["time"]
                   )

    return G

# --- Utilisation ---
data = litjsonfichier("config_6.json")
if data:
    G = construire_graphe(data)

    # Exemple d'affichage
    print("Liste des nœuds :")
    print(G.nodes(data=True))
    print("\nListe des arêtes :")
    print(G.edges(data=True))

    # Convertir en dict de listes si tu veux :
    F = nx.to_dict_of_lists(G)
    print("\nDict of lists :")
    print(F)

print(G.nodes(data=True))

depot="3"

# def solve_vrp_with_subtour_elimination(G, k, depot=0):
#     V = list(G.nodes)
#     E = [(i, j) for i in V for j in V if i != j and G.has_edge(i, j)]
#     n = len(V)

#     c = {(i, j): G[i][j]['weight'] for i, j in E}

#     # Initialisation du problème
#     prob = LpProblem("VRP", LpMinimize)
#     x = LpVariable.dicts("x", E, 0, 1, LpBinary)

#     # Fonction objectif
#     prob += lpSum(c[i, j] * x[i, j] for (i, j) in E)

#     # Contraintes de degré pour les clients
#     for j in V:
#         if j == depot:
#             continue
#         prob += lpSum(x[i, j] for i in V if (i, j) in x) == 1
#         prob += lpSum(x[j, i] for i in V if (j, i) in x) == 1

#     # Contraintes de départ/retour pour le dépôt
#     prob += lpSum(x[depot, j] for j in V if (depot, j) in x) == k
#     prob += lpSum(x[j, depot] for j in V if (j, depot) in x) == k

#     def get_subtours(selected_edges):
#         G_temp = nx.DiGraph()
#         G_temp.add_edges_from(selected_edges)
#         subtours = list(nx.strongly_connected_components(G_temp))
#         subtours = [list(s) for s in subtours if depot not in s]
#         return subtours

#     iteration = 0
#     while True:
#         iteration += 1
#         prob.solve()

#         selected_edges = [(i, j) for (i, j) in E if value(x[i, j]) > 0.5]
#         subtours = get_subtours(selected_edges)

#         if not subtours:
#             break

#         # Ajout de contraintes pour éliminer les sous-tours
#         for S in subtours:
#             prob += lpSum(x[i, j] for i in S for j in S if i != j and (i, j) in x) <= len(S) - 1

#     # Affichage des résultats
#     print("Status:", LpStatus[prob.status])
#     print("Total Cost:", value(prob.objective))
#     print("Selected Edges:", selected_edges)

#     pos = nx.spring_layout(G, seed=42)
#     edge_colors = ['red' if (i, j) in selected_edges else 'gray' for (i, j) in G.edges]
#     nx.draw(G, pos, with_labels=True, node_color='lightblue', node_size=400)
#     nx.draw_networkx_edges(G, pos, edge_color=edge_colors, width=2)
#     nx.draw_networkx_edge_labels(G, pos, edge_labels=nx.get_edge_attributes(G, 'weight'))
#     plt.title("Solution du VRP sans sous-tours")
#     plt.show()

#     return selected_edges

# solve_vrp_with_subtour_elimination(G, k=1)



def robust_vrp(graph, depot):
    unvisited = set(graph.nodes())
    print("Unvisited nodes:", unvisited)
    unvisited.remove(depot)
    routes = []

    while unvisited:
        current_route = [depot]
        visited_this_trip = set()

        # Étape 1 : trouver un point atteignable
        reachable = [node for node in unvisited if nx.has_path(graph, depot, node)]
        if not reachable:
            # Aucun chemin depuis le dépôt
            start = unvisited.pop()
            current_route = [start]
            visited_this_trip.add(start)
        else:
            closest = min(reachable, key=lambda node: nx.shortest_path_length(graph, depot, node, weight='weight'))
            path = nx.shortest_path(graph, depot, closest, weight='weight')
            current_route += path[1:]
            visited_this_trip.update(path[1:])
            unvisited -= set(path[1:])

        current = current_route[-1]

        # Étape 2 : continuer à visiter les voisins
        while True:
            next_nodes = [n for n in graph.neighbors(current) if n in unvisited]
            if not next_nodes:
                break
            next_node = min(next_nodes, key=lambda x: graph[current][x]['weight'])
            current_route.append(next_node)
            visited_this_trip.add(next_node)
            unvisited.remove(next_node)  # ⚠️ Retirer immédiatement
            current = next_node

        # Étape 3 : retour au dépôt si possible
        if current != depot and nx.has_path(graph, current, depot):
            back_path = nx.shortest_path(graph, current, depot, weight='weight')
            current_route += back_path[1:]

        routes.append(current_route)

    return routes


routes = robust_vrp(G, depot)

print("\n🚚 Tournées optimisées :")
for i, route in enumerate(routes):
    print(f"Camion {i+1} : {' -> '.join(map(str, route))}")


def generer_couleur():
    return "#{:06x}".format(random.randint(0, 0xFFFFFF))

def colorier_routes(routes, G):
    edge_color_map = {}
    for camion_index, route in enumerate(routes):
        color = generer_couleur()
        for i in range(len(route) - 1):
            n1 = route[i]
            n2 = route[i+1]
            if G.has_edge(n1, n2):
                edge_color_map[frozenset((n1, n2))] = color
    return edge_color_map

def appliquer_couleurs(edge_list, edge_color_map):
    for edge in edge_list:
        key = frozenset((edge["from"], edge["to"]))
        if key in edge_color_map:
            edge["color"] = edge_color_map[key]
    return edge_list

# --- Utilisation ---
nom_fichier = "config_6.json"
json_data = litjsonfichier(nom_fichier)


if json_data:
    G = construire_graphe(json_data)
    
    # ⚠️ Assure-toi d’avoir défini la fonction robust_vrp(G, depot) avant ça
    depot = "3"  # par exemple
    routes = robust_vrp(G, depot)

    print("\n🚚 Tournées optimisées :")
    for i, route in enumerate(routes):
        print(f"Camion {i+1} : {' -> '.join(map(str, route))}")

    color_map = colorier_routes(routes, G)
    json_data["graph"]["Edges"] = appliquer_couleurs(json_data["graph"]["Edges"], color_map)

    nouveau_nom = "resolved_" + nom_fichier
    sauvegarder_json(json_data, nouveau_nom)
    print(f"\n✅ Graphe coloré enregistré dans {nouveau_nom}")


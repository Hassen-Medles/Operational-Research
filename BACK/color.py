import random

import networkx as nx

def generer_couleur():
    return "#{:06x}".format(random.randint(0, 0xFFFFFF))

def colorier_routes(routes, G):
    edge_color_map = []  # Liste de dictionnaires pour stocker les arêtes et leur couleur
    for camion_index, route in enumerate(routes):
        color = generer_couleur()
        for edge in route:
            # Créer un dictionnaire pour chaque arête
            edge_dict = {"from": edge[0], "to": edge[1], "color": color}
            # Ajouter l'arête avec la couleur à la liste
            edge_color_map.append(edge_dict)
    return edge_color_map


def appliquer_couleurs(G, edge_list, edge_color_map):
    print("Appliquer les couleurs aux arêtes...", edge_color_map)
    graphcomplet = G.copy()
    new_edge_list = list(edge_list)  # Copie de base

    # Créer un dictionnaire de lookup pour retrouver les arêtes originales par (from, to)
    edge_lookup = {(
        edge["from"], edge["to"]): edge for edge in edge_list}  # Utiliser le tuple (from, to) comme clé

    for edge_color in edge_color_map:
        from_node = edge_color["from"]
        to_node = edge_color["to"]
        color = edge_color["color"]

        # Chercher le chemin avec Dijkstra (ou une autre méthode si besoin) et calculer les valeurs
        path = nx.shortest_path(G, source=from_node, target=to_node, weight="distance")
        print(f"Path trouvé de {from_node} à {to_node} : {path}")

        # Calculer les valeurs de distance, coût et temps en fonction des arêtes traversées
        total_distance = 0
        total_cost = 0
        total_time = 0

        # Pour chaque arête dans le chemin, additionner les poids
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            edge_data = graphcomplet[u][v]  # Récupérer les données de l'arête entre u et v

            # Ajouter la distance, le coût et le temps
            total_distance += edge_data.get("distance", 0)
            total_cost += edge_data.get("cost", 0)
            total_time += edge_data.get("time", 0)

        new_edge = {
            "from": from_node,
            "to": to_node,
            "distance": total_distance,
            "cost": total_cost,
            "time": total_time,
            "color": color,
        }

        new_edge_list.append(new_edge)


    return new_edge_list





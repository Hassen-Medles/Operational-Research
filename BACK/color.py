import random

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


def appliquer_couleurs(edge_list, edge_color_map):
    new_edge_list = []
    print("edge_list", edge_list)
    print("edge_color_map", edge_color_map)
    
    for edge in edge_list:
        # Vérifier chaque arête dans edge_color_map
        for edge_color in edge_color_map:
            # Comparer l'arête "from" et "to" avec celles dans la liste
            if edge["from"] == edge_color["from"] and edge["to"] == edge_color["to"]:
                print("edge trouvé", edge)
                new_edge = dict(edge)  # Copie propre de l'arête
                new_edge["color"] = edge_color["color"]  # Ajouter la couleur
                new_edge_list.append(new_edge)  # Ajouter l'arête colorée
                break  # Si on a trouvé l'arête, on sort du loop
        else:
            # Arête sans couleur si pas trouvée
            new_edge_list.append(edge)

    return new_edge_list

import random


def generer_couleur():
    return "#{:06x}".format(random.randint(0, 0xFFFFFF))

def colorier_routes(routes, G):
    edge_color_map = {}
    for camion_index, route in enumerate(routes):
        color = generer_couleur()
        for i in range(len(route) - 1):
            n1 = route[i]
            n2 = route[i+1]
            key = frozenset((n1, n2))
            if key not in edge_color_map:
                edge_color_map[key] = []
            edge_color_map[key].append(color)  # On accumule toutes les couleurs
    return edge_color_map


def appliquer_couleurs(edge_list, edge_color_map):
    new_edge_list = []
    for edge in edge_list:
        key = frozenset((edge["from"], edge["to"]))
        if key in edge_color_map:
            colors = edge_color_map[key]
            for color in colors:
                # DUPLIQUER l'arête pour chaque couleur
                new_edge = dict(edge)  # Copie propre
                new_edge["color"] = color
                new_edge_list.append(new_edge)
        else:
            new_edge_list.append(edge)  # Arête normale
    return new_edge_list

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
            if G.has_edge(n1, n2):
                edge_color_map[frozenset((n1, n2))] = color
    return edge_color_map

def appliquer_couleurs(edge_list, edge_color_map):
    for edge in edge_list:
        key = frozenset((edge["from"], edge["to"]))
        if key in edge_color_map:
            edge["color"] = edge_color_map[key]
    return edge_list



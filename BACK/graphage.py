import networkx as nx





    

def construire_graphe(json_data):
    G = nx.Graph()

    nodes = json_data["graph"]["Nodes"]

    edges = json_data["graph"]["Edges"]
    depot=0
    # Ajout des sommets avec leurs attributs
    for node in nodes:

        if node["estDepot"] == True:
            depot = node["id"]

        G.add_node(node["id"], label=node["label"], xRatio=node["xRatio"], yRatio=node["yRatio"], estDepot=node.get("estDepot"))

    # Ajout des arêtes avec leurs poids
    for edge in edges:
        G.add_edge(edge["from"], edge["to"],
        distance=edge["distance"],
        cout=edge["cost"],
        temps=edge["time"]
                   )

    return G, depot
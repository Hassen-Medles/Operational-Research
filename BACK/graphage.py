import networkx as nx




def trouver_depot(G):
    for node, data in G.nodes(data=True):
        if data.get("estDepot") == True:
            return node
    return None  # Aucun dépôt trouvé

    
    

def construire_graphe(json_data):
    G = nx.Graph()
    print(json_data["graph"])
    nodes = json_data["graph"]["Nodes"]
    edges = json_data["graph"]["Edges"]

    # Ajout des sommets avec leurs attributs
    for node in nodes:
        G.add_node(node["id"], label=node["label"], xRatio=node["xRatio"], yRatio=node["yRatio"], estDepot=node["estDepot"])

    # Ajout des arêtes avec leurs poids
    for edge in edges:
        G.add_edge(edge["from"], edge["to"],
                   weight=edge["distance"],
                #    cost=edge["cost"],
                #    time=edge["time"]
                   )

    return G
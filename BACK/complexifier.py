import networkx as nx


import networkx as nx

def creer_graphe_complet_depuis_dijkstra(graphe_original):
    # Crée un nouveau graphe vide
    graphe_complet = nx.Graph()

    # Récupère tous les sommets
    noeuds = list(graphe_original.nodes())

    # Pour chaque paire de sommets différents
    for i in range(len(noeuds)):
        for j in range(i + 1, len(noeuds)):
            source = noeuds[i]
            cible = noeuds[j]
            try:
                print(f"🔍 Calcul de la distance entre {source} et {cible}...")
                # Cherche la distance du chemin le plus court
                poids = nx.dijkstra_path_length(graphe_original, source, cible, weight="distance")
                # Ajoute une arête dans le graphe complet avec ce poids
                graphe_complet.add_edge(source, cible, distance=poids,aeterajouter= "true")
                print("graphe_complet",graphe_complet.edges(data=True))
            except nx.NetworkXNoPath:
                # Si aucun chemin n'existe, on ignore (ou tu peux choisir d'ajouter avec poids infini)
                print(f"⚠️ Aucun chemin entre {source} et {cible}, arête ignorée.")

    return graphe_complet

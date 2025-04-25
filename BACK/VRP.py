import networkx as nx


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
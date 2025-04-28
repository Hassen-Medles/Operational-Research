import networkx as nx
import pulp

def robust_vrp(G,num_vehicles,weight_type="distance", depot=0):

#     unvisited = set(graph.nodes())
#     print("Unvisited nodes:", unvisited)
#     unvisited.remove(depot)
#     routes = []

#     while unvisited:
#         current_route = [depot]
#         visited_this_trip = set()

#         # Étape 1 : trouver un point atteignable
#         reachable = [node for node in unvisited if nx.has_path(graph, depot, node)]
#         if not reachable:
#             # Aucun chemin depuis le dépôt
#             start = unvisited.pop()
#             current_route = [start]
#             visited_this_trip.add(start)
#         else:
#             closest = min(reachable, key=lambda node: nx.shortest_path_length(graph, depot, node, weight='weight'))
#             path = nx.shortest_path(graph, depot, closest, weight='weight')
#             current_route += path[1:]
#             visited_this_trip.update(path[1:])
#             unvisited -= set(path[1:])

#         current = current_route[-1]

#         # Étape 2 : continuer à visiter les voisins
#         while True:
#             next_nodes = [n for n in graph.neighbors(current) if n in unvisited]
#             if not next_nodes:
#                 break
#             next_node = min(next_nodes, key=lambda x: graph[current][x]['weight'])
#             current_route.append(next_node)
#             visited_this_trip.add(next_node)
#             unvisited.remove(next_node)  # ⚠️ Retirer immédiatement
#             current = next_node

#         # Étape 3 : retour au dépôt si possible
#         if current != depot and nx.has_path(graph, current, depot):
#             back_path = nx.shortest_path(graph, current, depot, weight='weight')
#             current_route += back_path[1:]

#         routes.append(current_route)
    
#     return routes


    nodes = list(G.nodes())
    customers = [node for node in nodes if node != depot]
    n = len(nodes)

    # Création de la matrice des coûts
    c = {i: {} for i in nodes}
    for i in nodes:
        for j in nodes:

            if i == j:
                c[i][j] = 999  # interdit
            else:

                c[i][j] = G[i][j][weight_type]

    # Définir le problème
    problem = pulp.LpProblem("VRP", pulp.LpMinimize)

    # Variables de décision
    x = pulp.LpVariable.dicts('x', (nodes, nodes), cat='Binary')
    u = pulp.LpVariable.dicts('u', nodes, lowBound=0, upBound=n-1, cat='Continuous')

    # Fonction objectif : minimiser la distance totale
    problem += pulp.lpSum(c[i][j] * x[i][j] for i in nodes for j in nodes if i != j)

    # Contraintes :
    for j in customers:
        problem += pulp.lpSum(x[i][j] for i in nodes if i != j) == 1
    for i in customers:
        problem += pulp.lpSum(x[i][j] for j in nodes if i != j) == 1

    problem += pulp.lpSum(x[depot][j] for j in customers) == num_vehicles
    problem += pulp.lpSum(x[i][depot] for i in customers) == num_vehicles

    for i in customers:
        for j in customers:
            if i != j:
                problem += u[i] - u[j] + (n-1) * x[i][j] <= n-2

    # Résolution
    solver = pulp.PULP_CBC_CMD(msg=0)
    problem.solve(solver)

    # Reconstruction correcte des routes
    arcs = {(i, j): pulp.value(x[i][j]) for i in nodes for j in nodes if i != j and pulp.value(x[i][j]) > 0.5}
    routes = []

    while arcs:
        route = []
        current = depot
        while True:
            next_node = None
            for (i, j) in arcs:
                if i == current:
                    next_node = j
                    break
            if next_node is None:
                break
            route.append((current, next_node))
            del arcs[(current, next_node)]
            current = next_node
            if current == depot:
                break
        routes.append(route)

    return routes



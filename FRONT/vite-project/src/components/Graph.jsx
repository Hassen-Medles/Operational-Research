import React, { useRef, useEffect, useState } from "react";
import axios from "axios";

const GraphCanvas = ({ backgroundImageUrl, isAddingNode, mode, edges,nodes,setNodes,setEdges }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isLinking, setIsLinking] = useState(false);
  const [linkStartNode, setLinkStartNode] = useState(null);
  const [firstLinkStartNode, setfirstLinkStartNode] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [imageRatio, setImageRatio] = useState(1);
  const [isEdgeFormVisible, setIsEdgeFormVisible] = useState(false);
  const [newEdgeData, setNewEdgeData] = useState({
    distance: "",
    cost: "",
    time: "",
    color: "#000", // Couleur par défaut
  });

  // Charger l'image de fond
    useEffect(() => {
      console.log("Chargement de l'image de fond :", backgroundImageUrl);
    if (!backgroundImageUrl) return;
    const img = new Image();
    img.src = backgroundImageUrl;
    img.onload = () => {
      setBackgroundImage(img);
      setImageRatio(img.height / img.width);
    };
  }, [backgroundImageUrl]);

  // Charger un graphe exemple
  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await axios.get("http://192.168.1.141:8000/graph");
        const data = response.data;

        const nodeObjects = data.Node.map((node) => ({
          id: node.id.toString(),
          label: `Node ${node.id}`,
          xRatio: node.x_ratio,
            yRatio: node.y_ratio,
            color: node.color || "#858585", // Couleur par défaut
        }));

        const edgeObjects = data.Edges.map((edge) => ({
          from: edge.from.toString(),
          to: edge.to.toString(),
          distance: edge.distance,
          cost: edge.cost,
          time: edge.time,
          color: edge.color || "#371ac7", // Couleur par défaut
        }));

        setNodes(nodeObjects);
        setEdges(edgeObjects);
      } catch (err) {
        console.error("Erreur chargement du graphe", err);
      }
    };

    fetchGraph();
  }, []);

  // Dessiner
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const parent = containerRef.current;
      const width = parent.clientWidth;
      const height = width * imageRatio;

      canvas.width = width;
      canvas.height = height;

      parent.style.height = `${height}px`;
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      }

      // Arêtes
      edges.forEach((edge) => {
        const from = nodes.find((n) => n.id === edge.from);
        const to = nodes.find((n) => n.id === edge.to);
        if (from && to) {
          const x1 = from.xRatio * canvas.width;
          const y1 = from.yRatio * canvas.height;
          const x2 = to.xRatio * canvas.width;
            const y2 = to.yRatio * canvas.height;
            console.log("x1:", x1, "y1:", y1, "x2:", x2, "y2:", y2);

          ctx.lineWidth = 3;
          // Dessiner la ligne
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = edge.color || "#371ac7"; // Couleur par défaut
          ctx.stroke();

          // Texte des pondérations
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          ctx.fillStyle = "black";
          ctx.font = "bold 12px Arial";

          const label = `d:${edge.distance} c:${edge.cost} t:${edge.time}`;
          ctx.fillText(label, midX + 5, midY - 5);
        }
      });

      // Sommets
      nodes.forEach((node) => {
        const x = node.xRatio * canvas.width;
        const y = node.yRatio * canvas.height;
        ctx.beginPath();
          ctx.arc(x, y, 25, 0, 2 * Math.PI);
          
          ctx.fillStyle = node.color || "#000";
          ctx.strokeStyle = "#1ac992";
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.fillText(node.label, x - 20, y + 5);
      });
    };

    resize();

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [nodes, edges, backgroundImage]);

    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xRatio = x / canvas.width;
            const yRatio = y / canvas.height;

        if (mode === "supprimerArrete") {
            console.log("clic arette");
            // Recherche de l'arête la plus proche du clic
            const clickedEdge = edges.find((edge) => {
                const from = nodes.find((n) => n.id === edge.from);
                const to = nodes.find((n) => n.id === edge.to);
                if (from && to) {
                    const x1 = from.xRatio * canvas.width;
                    const y1 = from.yRatio * canvas.height;
                    const x2 = to.xRatio * canvas.width;
                    const y2 = to.yRatio * canvas.height;

                    // Calculer la distance du clic à l'arête
                    const distance =
                        Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) /
                        Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
                    return distance < 10; // Tolérance de 10 pixels pour détecter l'arête
                }
                return false;
            });

            if (clickedEdge) {
                // Supprimer l'arête
                setEdges((prevEdges) =>
                    prevEdges.filter((edge) => edge !== clickedEdge)
                );
            }
        } else if (mode === "supprimerSommet") {
            console.log("clic sommet");
            // Recherche du sommet le plus proche du clic
            const clickedNode = nodes.find((node) => {
                const nodeX = node.xRatio * canvas.width;
                const nodeY = node.yRatio * canvas.height;
                return Math.hypot(nodeX - x, nodeY - y) < 30; // Rayon augmenté pour détecter le clic sur un sommet
            });

            if (clickedNode) {
                // Supprimer le sommet
                setNodes((prevNodes) =>
                    prevNodes.filter((node) => node !== clickedNode)
                );
                // Supprimer les arêtes associées
                setEdges((prevEdges) =>
                    prevEdges.filter(
                        (edge) =>
                            edge.from !== clickedNode.id && edge.to !== clickedNode.id
                    )
                );
            }
          
        }


        else if (mode === "sommet") {
          
            console.log("clic sommet");
          
const newId = (nodes.length + 1).toString();
setNodes((prev) => [
  ...prev,
  { id: newId, label: `Node ${newId}`, xRatio, yRatio, color: "#000" },
]);
    console.log("Nouveau sommet ajouté :", nodes);
        }
          
            
            
  if (mode === "arrette") {
    console.log("clic arrete");

    const clickedNode = nodes.find((node) => {
      const nodeX = node.xRatio * canvas.width;
      const nodeY = node.yRatio * canvas.height;
      return Math.hypot(nodeX - x, nodeY - y) < 15;
    });
    console.log("clickedNode", clickedNode);
      
      if (linkStartNode && clickedNode && linkStartNode.id !== clickedNode.id) {
        console.log("ouaip et", clickedNode.id, linkStartNode.id);
      // S'il y a déjà un noeud de départ, créer une arête
      setIsEdgeFormVisible(true);
      setLinkStartNode(clickedNode);
      setNewEdgeData({ ...newEdgeData, toNodeId: clickedNode.id });
    } else {
      // Sinon, initialiser le noeud de départ
      setLinkStartNode(clickedNode);
      setfirstLinkStartNode(clickedNode);
    }
  }
};

          const handleAddEdge = () => {
            const { distance, cost, time, color } = newEdgeData;



            setEdges((prev) => [
              ...prev,
              {
                from: firstLinkStartNode.id,
                to: newEdgeData.toNodeId,
                distance: parseFloat(distance) || 1,
                cost: parseFloat(cost) || 1,
                time: parseFloat(time) || 1,
                color: color || "#7d1179", // Couleur par défaut
              },
            ]);
              console.log(edges)
            setNewEdgeData({ distance: "", cost: "", time: "", color: "" });
            setIsEdgeFormVisible(false);
            setLinkStartNode(null);
          };





  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        onClick={handleCanvasClick}
      />

      {isEdgeFormVisible && (
        <div className="absolute top-0 left-0 bg-white p-4 border rounded shadow-md">
          <h3 className="font-semibold">Ajouter une arête</h3>
          <label>
            Distance:
            <input
              type="number"
              value={newEdgeData.distance}
              onChange={(e) =>
                setNewEdgeData({ ...newEdgeData, distance: e.target.value })
              }
              className="border p-1 mb-2"
            />
          </label>
          <br />
          <label>
            Coût:
            <input
              type="number"
              value={newEdgeData.cost}
              onChange={(e) =>
                setNewEdgeData({ ...newEdgeData, cost: e.target.value })
              }
              className="border p-1 mb-2"
            />
          </label>
          <br />
          <label>
            Temps:
            <input
              type="number"
              value={newEdgeData.time}
              onChange={(e) =>
                setNewEdgeData({ ...newEdgeData, time: e.target.value })
              }
              className="border p-1 mb-2"
            />
          </label>
          <br />
          <label>
            couleur(hexadecimal):
            <input
              type="text"
              value={newEdgeData.color}
              onChange={(e) =>
                setNewEdgeData({ ...newEdgeData, color: e.target.value })
              }
              className="border p-1 mb-2"
            />
          </label>
          <br />
          <button
            onClick={handleAddEdge}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Ajouter l'arête
          </button>
        </div>
      )}
    </div>
  );
};

export default GraphCanvas;

import React, { useRef, useEffect, useState } from "react";

const GraphCanvas = ({
  mode,
  config,
  edges,
  nodes,
  setNodes,
  setEdges,
  backgroundImageUrl,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [linkStartNode, setLinkStartNode] = useState(null);
  const [firstLinkStartNode, setfirstLinkStartNode] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null); // <- image chargée
  const [imageRatio, setImageRatio] = useState(1);
  const [isEdgeFormVisible, setIsEdgeFormVisible] = useState(false);
  const [newEdgeData, setNewEdgeData] = useState({
    distance: "",
    cost: "",
    time: "",
    color: "#000", // Couleur par défaut
  });


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

          ctx.lineWidth = 3;
          // Dessiner la ligne
          // Trouver toutes les arêtes entre les deux mêmes nœuds (dans les deux sens)
          const parallelEdges = edges.filter(
            (e) =>
              
              (e.from === edge.from && e.to === edge.to) ||
              (e.from === edge.to && e.to === edge.from)
          );
          
          // Trouver l'index de cette arête parmi les arêtes parallèles
          const index = parallelEdges.findIndex((e) => e === edge);

          // Vecteur directeur
          const dx = x2 - x1;
          const dy = y2 - y1;
          const length = Math.sqrt(dx * dx + dy * dy);

          // Vecteur normalisé perpendiculaire (pour décaler la ligne)
          const offsetX = dy / length;
          const offsetY = dx / length;

          // Coefficient d'espacement
          const spacing = 10; // pixels
          const offsetAmount =
            (index - (parallelEdges.length - 1) / 2) * spacing;

          // Appliquer l'offset
          const ox = offsetX * offsetAmount;
          const oy = offsetY * offsetAmount;

          ctx.beginPath();
          ctx.moveTo(x1 + ox, y1 + oy);
          ctx.lineTo(x2 + ox, y2 + oy);
          ctx.strokeStyle = edge.color || "#0000ff";
          ctx.stroke();

          // Texte des pondérations (aussi décalé)
          const midX = (x1 + x2) / 2 + ox;
          const midY = (y1 + y2) / 2 + oy;
          ctx.fillStyle = "black";
          ctx.font = "bold 12px Arial";

          const label = `d:${edge.distance}`;
          ctx.fillText(
            label,
            midX - 60 - (offsetX * offsetAmount),
            midY + 10 + offsetX * offsetAmount
          );
        }
      });

      // Sommets
      nodes.forEach((node) => {
        const x = node.xRatio * canvas.width;
        const y = node.yRatio * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, 2 * Math.PI);

        ctx.fillStyle = node.estDepot ? "#ff0000" : node.color || "#000";

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
  }, [nodes, edges, backgroundImageUrl]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xRatio = x / canvas.width;
    const yRatio = y / canvas.height;

    if (mode === "supprimerArrete") {
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
      const clickedNode = nodes.find((node) => {
        const nodeX = node.xRatio * canvas.width;
        const nodeY = node.yRatio * canvas.height;
        return Math.hypot(nodeX - x, nodeY - y) < 30;
      });

      if (clickedNode) {
        setNodes((prevNodes) =>
          prevNodes.filter((node) => node !== clickedNode)
        );
        setEdges((prevEdges) =>
          prevEdges.filter(
            (edge) => edge.from !== clickedNode.id && edge.to !== clickedNode.id
          )
        );
      }
    } else if (mode === "sommet") {
      const newId = (nodes.length + 1).toString();
      setNodes((prev) => [
        ...prev,
        { id: newId, label: `Node ${newId}`, xRatio, yRatio, color: "#000", estDepot: false },
      ]);
    } else if (mode === "selectionDepot") {
      const clickedNode = nodes.find((node) => {
        const nodeX = node.xRatio * canvas.width;
        const nodeY = node.yRatio * canvas.height;
        return Math.hypot(nodeX - x, nodeY - y) < 30;
      });

      if (clickedNode) {
        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === clickedNode.id
              ? { ...node, estDepot: true }
              : { ...node, estDepot: false }
          )
        );
      }
    }



    if (mode === "arrette") {
      const clickedNode = nodes.find((node) => {
        const nodeX = node.xRatio * canvas.width;
        const nodeY = node.yRatio * canvas.height;
        return Math.hypot(nodeX - x, nodeY - y) < 15;
      });

      if (linkStartNode && clickedNode && linkStartNode.id !== clickedNode.id) {
        setIsEdgeFormVisible(true);
        setLinkStartNode(clickedNode);
        setNewEdgeData({ ...newEdgeData, toNodeId: clickedNode.id });
      } else {
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
        color: color || "#7d1179",
      },
    ]);

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

import { useEffect, useState, useRef } from "react";
import Graph from "graphology";
import {
  SigmaContainer,
  useLoadGraph,
  useRegisterEvents,
  useSigma,
} from "@react-sigma/core";import axios from "axios";
import "@react-sigma/core/lib/style.css";

const sigmaStyle = {
  height: "500px",
  width: "inherit",
  backgroundColor: "#FF000000",
};

const graph = new Graph();

const BackgroundImageRenderer = ({ backgroundImage }) => {
  const sigma = useSigma();
  const containerRef = useRef(null);
  const backgroundRef = useRef(null);

  useEffect(() => {
    if (!backgroundImage) return;

    const renderer = sigma.getRenderer();
    const context = renderer.contexts.background;
    const camera = renderer.getCamera();

    const image = new Image();
    image.src = backgroundImage;

    image.onload = () => {
      const drawBackground = () => {
        const canvas = context.canvas;
        const ctx = context;

        const ratio = canvas.width / image.width;
        const scaledHeight = image.height * ratio;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, scaledHeight);
      };

      renderer.setSetting("renderBackground", drawBackground);
      drawBackground();
    };
  }, [backgroundImage, sigma]);

  return null;
};



// Composant pour charger le graphe depuis le backend
export const LoadGraph = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await axios.get("http://10.116.130.43:8000/graph");
        const data = response.data;
        const graph = new Graph();

        data.Node.forEach((node, index) => {
          graph.addNode(node.toString(), {
            label: `Node ${node}`,
            x: Math.cos(index * ((2 * Math.PI) / data.Node.length)) * 10,
            y: Math.sin(index * ((2 * Math.PI) / data.Node.length)) * 10,
            size: 10,
            color: "#FA4F40",
          });
        });

        data.Edges.forEach((edge) => {
          const edgeId = `${edge.from}-${edge.to}`;
          graph.addEdge(edge.from.toString(), edge.to.toString(), {
            label: `d:${edge.distance}`,
            size: 2,
            color: "#888",
          });
        });

        loadGraph(graph);
      } catch (error) {
        console.error("Erreur lors du chargement du graphe :", error);
      }
    };

    fetchGraph();
  }, [loadGraph]);

  return null;
};

const ClickHandler = ({ edgeMode }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const containerRef = useRef();
  const [nodeCount, setNodeCount] = useState(1000);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const handleNodeClick = (event) => {
      const nodeId = event.node;

      if (!edgeMode) return; // Ne rien faire si mode arête inactif

      if (selectedNode === null) {
        setSelectedNode(nodeId);
      } else {
        if (
          selectedNode !== nodeId &&
          graph.hasNode(selectedNode) &&
          graph.hasNode(nodeId)
        ) {
          const edgeId = `${selectedNode}-${nodeId}`;
          if (
            !graph.hasEdge(edgeId) &&
            !graph.hasEdge(`${nodeId}-${selectedNode}`)
          ) {
            graph.addEdge(selectedNode, nodeId, {
              label: `Edge`,
              size: 2,
              color: "#00FF00",
            });
          }
        }
        setSelectedNode(null); // reset
      }
    };

    const handleRightClick = (event) => {
      event.preventSigmaDefault();
      const nodeId = event.node;
      if (graph.hasNode(nodeId)) {
        graph.dropNode(nodeId);
        setSelectedNode(null);
      }
    };

    sigma.on("clickNode", handleNodeClick);
    sigma.on("rightClickNode", handleRightClick);

    return () => {
      sigma.off("clickNode", handleNodeClick);
      sigma.off("rightClickNode", handleRightClick);
    };
  }, [sigma, graph, edgeMode, selectedNode]);

  const handleClick = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const coord = sigma.viewportToGraph({ x, y });

    const newId = `n${nodeCount}`;
    graph.addNode(newId, {
      label: `Node ${newId}`,
      x: coord.x,
      y: coord.y,
      size: 10,
      color: "#00AAFF",
    });

    setNodeCount((prev) => prev + 1);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="absolute top-0 left-0 w-full h-full z-30 cursor-crosshair"
      style={{ backgroundColor: "transparent" }}
    />
  );
};


const DisplayGraph = ({ backgroundImage }) => {
  const [edgeMode, setEdgeMode] = useState(false);

  return (
    <div className="z-20 absolute w-full h-full">
      <div className="absolute top-2 left-2 z-40">
        <button
          className={`px-4 py-2 rounded ${
            edgeMode ? "bg-red-500 text-white" : "bg-gray-300 text-black"
          }`}
          onClick={() => setEdgeMode((prev) => !prev)}
        >
          {edgeMode ? "Quitter mode arête" : "Activer mode arête"}
        </button>
      </div>

      <SigmaContainer
        style={sigmaStyle}
        settings={{
          renderEdgeLabels: true,
        }}
      >
        <BackgroundImageRenderer backgroundImage={backgroundImage} />
        <LoadGraph />
        <ClickHandler edgeMode={edgeMode} />
      </SigmaContainer>
    </div>
  );
};

export default DisplayGraph;

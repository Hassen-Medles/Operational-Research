import { useEffect } from "react";
import Graph from "graphology";
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import axios from "axios";
import "@react-sigma/core/lib/style.css";

import NodeAdder from "@components/NodeAdder.jsx"; // Import the NodeAdder component


const sigmaStyle = {
  height: "500px",
  width: "inherit",
  backgroundColor: "#FF000000",
};




// Component that loads the graph from backend
export const LoadGraph = () => {



  

  const loadGraph = useLoadGraph();

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await axios.get("http://10.116.130.43:8000/graph");
        const data = response.data;

        const graph = new Graph();

        // Ajouter les noeuds
        data.Node.forEach((node, index) => {
          graph.addNode(node.toString(), {
            label: `Node ${node}`,
            x: Math.cos(index * ((2 * Math.PI) / data.Node.length)) * 10,
            y: Math.sin(index * ((2 * Math.PI) / data.Node.length)) * 10,
            size: 10,
            color: "#FA4F40",
          });
        });

        // Ajouter les arêtes
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


const handleClick = (e) => {
  const boundingRect = e.target.getBoundingClientRect();
  const x = e.clientX - boundingRect.left;
  const y = e.clientY - boundingRect.top;
  console.log("Click aux coordonnées : ", x, y);
};




// Component that displays the graph
const DisplayGraph = () => {
  return (
    <div className="z-20 absolute w-full h-full">
      <SigmaContainer
        style={sigmaStyle}
        settings={{
          renderEdgeLabels: true,
          defaultEdgeType: "line",
          allowWheel: false,
          allowDrag: false,
          allowZoom: false,
          allowPan: false,
          enableCameraPanning: false,
          enableCameraZooming: false,
        }}
        graphOptions={{
          nodeProgramClasses: {},
          edgeProgramClasses: {},
        }}
        overrideSettings={{
          mouseEnabled: true, // <--- Important pour clickStage
          touchEnabled: false,
          zoomEnabled: false,
          dragNodeEnabled: false,
          dragCameraEnabled: false,
        }}
      >
        <LoadGraph />

      </SigmaContainer>
      <div
        onClick={handleClick}
        className="absolute top-0 left-0 w-full h-full z-30 cursor-crosshair"
        style={{ backgroundColor: "transparent" }}
      />
    </div>
  );
};

export default DisplayGraph;

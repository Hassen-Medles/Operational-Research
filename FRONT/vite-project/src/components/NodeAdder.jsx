import { useSigma } from "@react-sigma/core";
import { useRegisterEvents } from "@react-sigma/core";

 const NodeAdder = () => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  useRegisterEvents({
    clickStage({ event }) {
      console.log("Click sur le stage", event);
      const coords = sigma.viewportToGraph(event.x, event.y);
      const id = `node-${graph.order}`;
      graph.addNode(id, {
        ...coords,
        size: 10,
        color: "#00f",
        label: id,
      });

      // Envoi au backend Flask
      fetch("http://localhost:8000/add_node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, x: coords.x, y: coords.y }),
      })
        .then((res) => res.json())
        .then((data) => console.log("Node ajouté:", data))
        .catch((err) => console.error("Erreur ajout node", err));
    },
  });

  return null;
};

export default NodeAdder;
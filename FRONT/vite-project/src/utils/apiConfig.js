// src/utils/api.js
import axios from "axios";
import { BASE_URL } from "@utils/apiURL"; // Assurez-vous que le chemin est correct

import {uploadGraph} from "@utils/api"; // Assurez-vous que le chemin est correct
import { uploadImage } from "./api";

export const cheminImage = (filename) => `${BASE_URL}/image/${filename}`;

export const fetchConfigs = async () => {
  const res = await axios.get(`${BASE_URL}/list_configs`);
  return res.data;
};

export const loadConfig = async (name) => {
  const res = await axios.get(`${BASE_URL}/load_config/${name}`);
  return res.data;
};

export const deleteConfig = async (configName) => {
  try {
    const response = await fetch(
      `${BASE_URL.replace("10.116.130.43", "localhost")}/delete_config/${configName}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      const data = await response.json();
      console.error(data.error || "Erreur lors de la suppression");
      return false;
    }
    console.log(`Configuration ${configName} supprimée avec succès.`);
    return true;
  } catch (error) {
    console.error("Erreur de réseau ou de serveur", error);
    return false;
  }
};

export const addConfig = async (configName) => {
  try {
    const response = await fetch(
      `${BASE_URL.replace("10.116.130.43", "localhost")}/add_config/${configName}`,
      {
        method: "POST", // Utilise POST pour ajouter une nouvelle configuration
      }
    );
    if (!response.ok) {
      const data = await response.json();
      console.error(data.error || "Erreur lors de la création de la configuration");
      return false;
    }
    console.log(`Configuration ${configName} créée avec succès.`);
    return true;
  } catch (error) {
    console.error("Erreur de réseau ou de serveur", error);
    return false;
  }
};


export const EcraserConfig = async (configName, data, selectedFile,setSelectedFile, nodes,edges) => {
    console.log("EcrasersdsdsdsdsdsdsdConfig",nodes);
    console.log("apiURLllllllllllllll", "EcraserConfig", "config:", configName, "graph:", data.graph, "image:", selectedFile);
    const graphaenvoyer = {
        graph: {
            Edges: edges,
            Nodes: nodes,
        },
    };
    console.log("graphaenvoyer", graphaenvoyer);
    try {
      console.log("uploadGraph", configName, graphaenvoyer);
      uploadGraph(configName, graphaenvoyer); // Passer le paramètre pour écraser
      
        console.log("uploadImage", configName, selectedFile);
        uploadImage(configName, selectedFile);
        // setSelectedFile(null); // Réinitialiser le fichier sélectionné après l'envoi

        
    return true;
  } catch (error) {
    console.error("Erreur de réseau ou de serveur", error);
    return false;
  }
};


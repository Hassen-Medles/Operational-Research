
 
import {BASE_URL } from "@utils/apiURL"; // Assurez-vous que le chemin est correct

import axios from "axios";

export const fetchConfigs = async () => {
  const res = await axios.get(`${BASE_URL}/list_configs`);
  return res.data;
};

export const loadConfig = async (configName) => {
  const res = await axios.get(`${BASE_URL}/load_config/${configName}`);
  return res.data;
};



export const uploadImage = async (configName, selectedFile) => {
  if (!selectedFile)
  {
    console.log("Aucun fichier sélectionné pour l'upload.");
  return;
}
  const formData = new FormData();
  formData.append("image", selectedFile);

  try {
    const res = await axios.post(`${BASE_URL}/upload_image/${configName}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("Image uploaded:", res.data);
  } catch (error) {
    console.error("Erreur upload image:", error);
  }
};




export const uploadGraph = async (configName, data) => {
  console.log("recu", data);
  
  try {
    // const graphData = {
    //   Node: nodes,
    //   Edges: edges,
    // };




    // Utilisation de JSON.stringify pour s'assurer que les données sont envoyées sous forme de chaîne JSON
    const res = await axios.post(`${BASE_URL}/upload_graph/${configName}`, JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });

    console.log("Graph uploaded:", res.data);
  } catch (error) {
    console.error("Erreur upload graph:", error);
  }
};


export const loadGraph = async (configName) => {
  try {
    const res = await axios.get(`${BASE_URL}/load_graph/${configName}`);
    return res.data;
  } catch (error) {
    console.error("Erreur load graph:", error);
  }
};


export const getImageUrl = (filename) => `${BASE_URL}/image/${filename}`;

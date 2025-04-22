const BASE_URL = "http://10.116.130.43:8000"; // Change ici uniquement

import axios from "axios";

export const fetchConfigs = async () => {
  const res = await axios.get(`${BASE_URL}/list_configs`);
  return res.data;
};

export const loadConfig = async (configName) => {
  const res = await axios.get(`${BASE_URL}/load_config/${configName}`);
  return res.data;
};



export const uploadImage = async (configName,selectedFiles) => {
  if (selectedFiles.length === 0) return;

  const formData = new FormData();
  formData.append("image", selectedFiles[0]); // une seule image

  try {
    const res = await axios.post(`${BASE_URL}/upload_image/${configName}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("Image uploaded:", res.data);
  } catch (error) {
    console.error("Erreur upload image:", error);
  }
};

export const uploadGraph = async (configName,nodes,edges) => {
  try {
    const graphData = {
      Node: nodes,
      Edges: edges,
    };
    const res = await axios.post(`${BASE_URL}/upload_graph/${configName}`, graphData, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("Graph uploaded:", res.data);
  } catch (error) {
    console.error("Erreur upload graph:", error);
  }
};

export const uploadFiles = async (formData) => {
  const res = await axios.post(`${BASE_URL}/upload_image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const getImageUrl = (filename) => `${BASE_URL}/image/${filename}`;

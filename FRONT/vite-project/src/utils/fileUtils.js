export const handleFileUpdate = (e, setSelectedFiles) => {
  setSelectedFiles(e.target.files);
};

export const triggerVibration = () => {
  if ("vibrate" in navigator) {
    navigator.vibrate([100]);
  }
};

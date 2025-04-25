export const toggleMode = (currentMode, setMode, targetMode) => {
  

  // Si le mode actuel est égal au mode cible, on le bascule sur "OFF" ou un autre mode
  if (currentMode === targetMode) {
    setMode(null); // Ou tout autre mode que tu souhaites comme valeur par défaut
  } else {
    setMode(targetMode); // Sinon, on passe au mode cible
  }
  console.log("currentMode", currentMode);
};
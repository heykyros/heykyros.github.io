let loopType = sessionStorage.getItem("loopType") || 0

function setLoopType(newType) {
    sessionStorage.setItem("loopType", newType);
    console.log(`loopType updated to: ${newType}`);
  }

  
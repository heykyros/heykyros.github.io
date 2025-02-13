let endGame = false;




let sounds;


async function loadAllSounds() {
    const soundFiles = {
      levelSound: "assets/sounds/littleroot-town.mp3",
      battleSound: "assets/sounds/battle-intro.mp3",
      battleLoop: "assets/sounds/battle-loop.mp3",
      clickSound: "assets/sounds/click.mp3",
      getItemSound: "assets/sounds/get-item.mp3",
      faintSound: "assets/sounds/faint.mp3",
      pokeballSound: "assets/sounds/exit-ball.mp3",
      attackSound: "assets/sounds/attack.mp3"
    };
  
    const sounds = {};
  
    // Create and load each audio element
    for (const [key, path] of Object.entries(soundFiles)) {
      sounds[key] = new Audio(path);
      // Wait for each sound to load
      await new Promise((resolve, reject) => {
        sounds[key].addEventListener('canplaythrough', resolve, { once: true });
        sounds[key].addEventListener('error', reject);
        // Start loading the audio
        sounds[key].load();
      });
    }
  
    return sounds;
  }

  // Modified initializeSounds function
async function initializeSounds() {
    try {
      const sounds = await loadAllSounds();
      // Assign the loaded sounds to your global variables
      window.levelSound = sounds.levelSound;
      window.battleSound = sounds.battleSound;
      window.battleLoop = sounds.battleLoop;
      window.clickSound = sounds.clickSound;
      window.getItemSound = sounds.getItemSound;
      window.faintSound = sounds.faintSound;
      window.pokeballSound = sounds.pokeballSound;
      window.attackSound = sounds.attackSound;
  
      console.log("All sounds loaded successfully!");
      return true;
    } catch (error) {
      console.error("Error loading sounds:", error);
      return false;
    }
  }

console.log("THE LOOP TYPE IS" + sessionStorage.getItem("loopType"))

function reloadScript() {
    console.log("IVE BEEN CALLED")
    let oldScript = document.getElementById("indexScript");
    if (oldScript) {
      oldScript.remove(); // Remove the old script
    }
  
    let newScript = document.createElement("script");
    newScript.src = "index.js"; // Reload index.js
    newScript.id = "indexScript"; // Add an ID to track
    newScript.type = "module";
    document.body.appendChild(newScript);
  
    console.log("index.js reloaded!");
  }

  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    let words = text.split(' ');
    let line = '';

    for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;

        if (testWidth > maxWidth && i > 0) {
            context.fillText(line, x, y);
            line = words[i] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}


let drainHP = false;
let lockBagArrow = false;


function initializeGameState() {


    const gameState = {
        battleAnimationTransition: {
            topSlab: { x: 0, y: 0 },
            bottomSlab: { x: 0, y: canvas.height/2 }
        },
        battle: {
            iniated: false,
            stage: 0,
            graceReleased: false,
            flashLevel: 0,
            timesWrote: 0,
            typing: false,
            currentText: "",
            textIndex: 0,
            typeInterval: null,
            dialogueFinished: false,
            zIsLocked: false,
            cursorPositions: {
                current: 1,
                active: true
            },
            battlePositions: {
                current: 1,
                active: true,
                pp: [1, 1, 1, 1]
            },
            lockBattleMenu: false,
            releaseElapsedTime: 0,
            releaseLastTime: 0
        },
        keys: {
            w: { pressed: false },
            a: { pressed: false },
            s: { pressed: false },
            d: { pressed: false },
            z: { pressed: false },
            x: { pressed: false }
        },
        timing: {
            lastTime: 0,
            deltaTime: 0,
            elapsedTime: 0,
            buttonLastTime: 0,
            buttonDeltaTime: 0,
            buttonElapsedTime: 0
        }
    };

    return gameState;
}

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width =1100;
canvas.height = 700;

function resetBattleState() {
    battle.iniated = true;
    battleStage = 0;
    graceReleased = false;
    flashLevel = 0;
    timesWrote = 0;
    // Reset any other necessary variables here
}

let firstMove = false;

async function runGame(){



    
    console.log(sounds)
    console.log("Running")

    console.log(collisions)

    c.fillStyle = 'black'
    c.fillRect(0,0, canvas.width, canvas.height)
    const collisionsMap = []
    for (let i = 0; i < collisions.length; i+=50) {
        collisionsMap.push(collisions.slice(i, i+50))
    }


    const offset = {
        x: -(window.innerWidth/2)+ window.innerWidth/4,
        y: window.innerHeight/2 - 53.6 * 28
    }

    const boundaries = []

    for(let i = 0; i < collisionsMap.length; i++){
        for(let j = 0; j < collisionsMap[i].length; j++){
            if(collisionsMap[i][j] !== 0){
                boundaries.push(new Boundary({position: {x: ((j * 53.6) + offset.x), y: ((i * 53.6) + offset.y)}}))
            }
        }
    }


    
    console.log(boundaries)


    const sprites = {
        forward: [forward1, forward2, forward3],
        back: [back1, back2, back3],
        left: [left1, left2, left3],
        right: [right1, right2, right3],
    }



    const background = new Sprite({image: bg, position: {x: offset.x, y: offset.y}})
    const player = new Player({position: {x: (canvas.width / 2) - character.width/2, y: (canvas.height/2) + character.height/2}, scale: 1.33, sprites: sprites})
    const bw2GirlSprite = new NPC({image: bw2Girl, position: {x:(20.9 * 53.6) + offset.x, y: (25.2 * 53.6) + offset.y}, scale: 1.15})
    const blueNPC = new NPC({image: blueBoi, position: {x:(31 * 53.6) + offset.x, y: (28.9 * 53.6) + offset.y}, scale: 1.4, dialogue: ["Salutations fine shyt.", "Oh..? You're already taken.", "My sincerest apologies."]})
    const suitNPC = new NPC({image: suitDude, position: {x:(25.8 * 53.6) + offset.x, y: (20.8 * 53.6) + offset.y}, scale: 1.4, dialogue: ["I heard that there's a painting up in the north.", "It's giving off some weird vibes.", "Maybe you should go check it out."]})
    const monaLisa = new Sprite({image: painting, position: {x: offset.x + (23.2 * 53.6), y: offset.y + (12.2 * 53.6)}, scale: 0.18})
    const fg = new Sprite({image: foreground, position: {x: offset.x, y: offset.y}})
    const battleBackground = new Sprite({image: arenaBG, position: {x: 0, y: 0}, scale: 2.44})
    const pathPlatform = new Sprite ({image: battlePlatform, position: {x: -515, y: 120}, scale:2})
    const playerPathPlatform = new Sprite ({image: playerBattlePlatform, position: {x: 830, y: 377}, scale:2})
    const battleDialogueBox =  new Sprite ({image: battleDialogue, position: {x: 0, y: (canvas.height - 213)}, scale: 0.463})
    const monaLisa2 = new Sprite({image: painting2, position: {x: -360, y: -10}, scale:0.45})
    const hpBox = new Sprite({image: battleDataBox, position: {x:-1500, y:50}, scale:1.7})
    const playerHPBox = new Sprite({image: playerHPOverlay, position: {x: 1100, y: 320}, scale: 1.7})
    const hpOverlay = new Sprite({image: HPOverlay, position: {x: -1500, y: 50}, scale: 1.7})
    const hpOverlayPlayer = new Sprite({image: HPOverlay, position: {x: -1250, y: 70}, scale: 1.7})
    const pookie = new Sprite({image: goGRACE, position: {x: 246, y:200}, scale:0.3})
    const pookieFlash = new Sprite({image: graceSprite, position: {x: 246, y:200}, scale:0.3})
    const battleComandSprite =  new Sprite ({image: battleCommand, position: {x: 0, y: (canvas.height - 206)}, scale: 0.538})
    const arrow =  new Sprite ({image: cursor, position: {x: 615, y: (canvas.height - 158)}, scale: 0.488})
    const arrow2 =  new Sprite ({image: cursor, position: {x: 70, y: (canvas.height - 162)}, scale: 0.488})
    const arrow3 =  new Sprite ({image: cursor2, position: {x: 518, y: (canvas.height - 620)}, scale: 2})
    const graceInfo = new Sprite ({image: pookiemonInfo, position: {x: (canvas.width-(pookiemonInfo.width * 0.92))/2, y:0}, scale: 0.92})
    const battleMoves = new Sprite({image: battleOverlay, position: {x:0, y: canvas.height - 206}, scale: 0.538})
    const bag = new Sprite({image: bagImage, position: {x:((canvas.width/2) - (2048/2 * 0.46)), y:(canvas.height/2) - (1536 * 0.23)}, scale:0.46})
    const bag1 = new Sprite({image:bagIcon, position: {x:120, y:385}, scale:0.75})



    const keys = {
        w: {
            pressed: false
        },
        a: {
            pressed: false
        },
        s: {
            pressed: false
        },
        d: {
            pressed: false
        },
        z: {
            pressed: false
        }, 
        x: {
            pressed: false
        }
    }

    const activeNPC = {
        engaged: false,
        npc: null
    }

    const npcs = [bw2GirlSprite, blueNPC, suitNPC]
    const moveables = [background, ...boundaries, fg, ...npcs, monaLisa]
function rectangularCollision({ rect1, rect2 }) {
    return (
        rect1.position.x + rect1.width >= rect2.position.x && // Player's right edge >= Boundary's left edge
        rect1.position.x <= rect2.position.x + rect2.width && // Player's left edge <= Boundary's right edge
        rect1.position.y + rect1.height >= rect2.position.y && // Player's bottom edge >= Boundary's top edge
        rect1.position.y <= rect2.position.y + rect2.height   // Player's top edge <= Boundary's bottom edge
    );
}
    
function inNPCRange({ player, npc }) {
    const distanceX = Math.abs(
        player.position.x + player.width / 2 - (npc.position.x + npc.width / 2)
    );
    const distanceY = Math.abs(
        player.position.y + player.height / 2 - (npc.position.y + npc.height / 2)
    );

    const thresholdX = player.width / 2 + npc.width / 2;
    const thresholdY = player.height / 2 + npc.height / 2;

    return distanceX <= thresholdX && distanceY <= thresholdY;
}

function inBattleRange({player, monaLisa}){
    const distanceX = Math.abs(
        player.position.x + player.width / 2 - (monaLisa.position.x + monaLisa.width / 2)
    );
    const distanceY = Math.abs(
        player.position.y + player.height / 2 - (monaLisa.position.y + monaLisa.height / 2)
    );

    const thresholdX = player.width / 2 + monaLisa.width / 2;
    const thresholdY = player.height / 2 + monaLisa.height / 2;

    return distanceX <= thresholdX && distanceY <= thresholdY;
}

    let lastFrameTime = 0;
    let buttonLocked = false;

  
const battle = {
    iniated: false,
}

function writeText(){
    c.font = "56px Pokemon Emerald"; // Set font size and style
    c.shadowColor="gray"
    c.shadowOffsetX = 4;
    c.shadowOffsetY = 4;
    c.fillStyle = "white";
    c.textAlign = "left";
    c.textBaseline="top"
    const dialogueBoxHeight = 200;
    const padding = 30;
    const textX = canvas.width / 17
    const textY = canvas.height - dialogueBoxHeight / 1.38 // Center vertically within the box
    const maxLineWidth = canvas.width - 2 * 200;
    const words = currentText.split(" ");
    let line = "";
    let lines = [];
    words.forEach((word) => {
        const testLine = line + word + " ";
        const testWidth = c.measureText(testLine).width;
        if (testWidth > maxLineWidth) {
            lines.push(line);
            line = word + " ";
        } else {
            line = testLine;
        }
    });
    lines.push(line);

    // Render each line of text
    lines.forEach((line, index) => {
        c.fillText(line, textX, textY - (lines.length / 2) * 40 + index * 60);
    });
}


let isAnimatingStart = true;
let battleAnimationTransition = {
    topSlab: {
        x: 0,
        y: 0
    },
    bottomSlab: {
        x: 0,
        y: canvas.height/2
    },
}
const timeInterval=2000
let deltaTime=0
let lastTime = 0;
let elapsedTime = 0;
let battleDialogueEngaged = true;
let zLocked = false
let battleStage = 0;
let graceReleased = false;
let releaseDeltaTime=0
let releaseLastTime = 0;
let releaseElapsedTime = 0;
let setUpPookie = true;
let flashLevel = 0;
const croppedHeight = hpOverlay.height / 6;
const timeIntervalBattle = 1000/60
const speedBattle = 675;
let showBattleOptions = false;
let inBattleOptions = false;
let typing = false;      // Whether the typewriter effect is active
let currentText = "";    // Stores the text being displayed
let textIndex = 0;       // Index of the current character being displayed
let typeInterval;        // Interval for the typewriter effect
let zIsLocked = false;
let dialogueFinished;
let timesWrote = 0;

let buttonDeltaTime=0
let buttonLastTime = 0;
let buttonElapsedTime = 0;
let lockBattleMenu = false;


let isAnimateRunning = true; // Flag to control the animate loop

    function animate(currentTime){
        if (!isAnimateRunning) return; // Exit if the loop is stopped

        const animationID = window.requestAnimationFrame(animate)


        const deltaTime = (currentTime - lastFrameTime) // deltaTime in milliseconds
        lastFrameTime = currentTime
        const speed = 160
    
        let moving = true
        movementLocked = false;
        let npcLock = false


   
        

    
        background.draw()
        boundaries.forEach(boundary => {
            boundary.draw()
        })
        bw2GirlSprite.draw()
        blueNPC.draw()
        suitNPC.draw()
        monaLisa.draw()
        player.update(deltaTime) // Pass deltaTime to the player
        player.draw()
        fg.draw()
                //what to do each frame while an NPC is engaged
                // Update drawing logic
                
    
                if (inBattleRange({ player: player, monaLisa: monaLisa })) {
                    console.log(levelSound)
                    levelSound.pause()
               

                    console.log(animationID)
                    window.cancelAnimationFrame(animationID) 
                    battle.iniated = true;
                    moving=false
                    movementLocked=true
                    gsap.to("#overlay", {
                        opacity: 1,
                        repeat: 4,
                        yoyo: true,
                        duration: 0.3,
                        onComplete(){
                            gsap.to("#overlay", {
                                opacity: 0,
                                duration: 0.3,
                            })
                            //animateBattle()
                            if(battle.iniated){
                                isAnimateRunning=false;
                                setLoopType(1)
                                location.reload()
                                return;
                            }
                        }
                    })

              
                    
                   
                    
                    }
                
               


                if (activeNPC.engaged) {
           
                    movementLocked = true;
                    moving = false;
                    const dialogueBoxHeight = 200;
                    const padding = 30;
                    const textX = canvas.width / 17
                    const textY = canvas.height - dialogueBoxHeight / 1.65 // Center vertically within the box

                
                    // Draw the dialogue box
                    c.drawImage(dialogueBox, 0, canvas.height - dialogueBoxHeight, canvas.width, dialogueBoxHeight);
                
                    // Text settings
                    c.font = "42px Pokemon Emerald"; // Set font size and style
                    c.fillStyle = "black";
                    c.textAlign = "left";
                    c.textBaseline = "middle";
                
                    // Split long text into multiple lines if necessary
                    const maxLineWidth = canvas.width - 2 * padding;
                    const words = currentText.split(" ");
                    let line = "";
                    let lines = [];
                    words.forEach((word) => {
                        const testLine = line + word + " ";
                        const testWidth = c.measureText(testLine).width;
                        if (testWidth > maxLineWidth) {
                            lines.push(line);
                            line = word + " ";
                        } else {
                            line = testLine;
                        }
                    });
                    lines.push(line);
                
                    // Render each line of text
                    lines.forEach((line, index) => {
                        c.fillText(line, textX, textY - (lines.length / 2) * 40 + index * 40);
                    });
                }

                if (keys.z.pressed && !typing) {
                    battle.iniated=true;
                    if (!activeNPC.engaged) {
                        // Engage with NPC
                        for (let i = 0; i < npcs.length; i++) {
                            if (inNPCRange({ player: player, npc: npcs[i] })) {
                                activeNPC.engaged = true;
                                activeNPC.npc = npcs[i];
                                console.log("Engaged with NPC");
                
                                // Start typing the first dialogue
                                startTypingEffect(activeNPC.npc.dialogue[activeNPC.npc.currentDialogue]);
                                clickSound.play()
                                break;
                            }
                        }
                    } else {
                        clickSound.play()
                        // Move to the next dialogue
                        if (activeNPC.npc.currentDialogue < activeNPC.npc.maxDialogue - 1) {
                            activeNPC.npc.currentDialogue++;
                        } else {
                            activeNPC.npc.currentDialogue = 0;
                            activeNPC.engaged = false;
                        }
                
                        // Start typing the next dialogue
                        startTypingEffect(activeNPC.npc.dialogue[activeNPC.npc.currentDialogue]);
                    }
                }
                
 
                if(keys.w.pressed && lastKey === 'w'){
                    for (let i = 0; i < boundaries.length; i++){
                        const boundary = boundaries[i]
                        if(rectangularCollision({rect1: player, rect2: {...boundary, position: {x: boundary.position.x, y: boundary.position.y + speed * deltaTime / 1000}}})) {
                            console.log("COLLIDE")
                            moving = false
                            break
                        }
                    }
                    if(!movementLocked){
                        player.setSpriteDirection('back')
                    }
                    if (moving) {
                        player.setSpriteFrame(player.frame, 'back')
                        moveables.forEach(moveable => {
                            moveable.position.y += speed * deltaTime / 1000
                        })
                    }
                }
                if(keys.a.pressed && lastKey === 'a'){
                    for (let i = 0; i < boundaries.length; i++){
                        const boundary = boundaries[i]
                        if(rectangularCollision({rect1: player, rect2: {...boundary, position: {x: boundary.position.x + speed * deltaTime / 1000, y: boundary.position.y}}})) {
                            console.log("COLLIDE")
                            moving = false
                            break
                        }
                    }
                    if(!movementLocked){
                    player.setSpriteDirection('left')
                    }
                    if (moving) {
                        player.setSpriteFrame(player.frame, 'left')
                        moveables.forEach(moveable => {
                            moveable.position.x += speed * deltaTime / 1000
                        })
                    }
                }
                if(keys.s.pressed && lastKey === 's'){
                    for (let i = 0; i < boundaries.length; i++){
                        const boundary = boundaries[i]
                        if(rectangularCollision({rect1: player, rect2: {...boundary, position: {x: boundary.position.x, y: boundary.position.y - speed * deltaTime / 1000}}})) {
                            console.log("COLLIDE")
                            moving = false
                            break
                        }
                    }
                    if(!movementLocked){
                    player.setSpriteDirection('forward')
                    }
                    if (moving) {
                        player.setSpriteFrame(player.frame, 'forward')
                        moveables.forEach(moveable => {
                            moveable.position.y -= speed * deltaTime / 1000
                        })
                    }
                }
                if(keys.d.pressed && lastKey === 'd'){
                    for (let i = 0; i < boundaries.length; i++){
                        const boundary = boundaries[i]
                        if(rectangularCollision({rect1: player, rect2: {...boundary, position: {x: boundary.position.x - speed * deltaTime / 1000, y: boundary.position.y}}})) {
                            console.log("COLLIDE")
                            moving = false
                            break
                        }
                    }
                    if(!movementLocked){
                        player.setSpriteDirection('right')
                    }
                    if (moving) {
                        player.setSpriteFrame(player.frame, 'right')
                        moveables.forEach(moveable => {
                            moveable.position.x -= speed * deltaTime / 1000
                        })
                    }
                }
        
    }


/* Battle Code Starts Here */

async function startBattle(){
    await initializeSounds()
    battleSound.play()
    animateBattle(0)
}

if(loopType==0){
    animate(0)
} else {
    startBattle()
}


let cursorPositions = {
    current: 1,
    active: true
}

let battlePositions = {
    current: 1,
    active: true,
    pp: [1, 1, 1, 1]
}

let bagCursorPositions = {
    current: 1,
    text: "You're a master artist, of course you have these."
}


let dialogueCounter = 0;

function animateBattle(currentTime){
    c.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    if (battleStage === 0) {
        console.log("Resetting battle state");
        graceReleased = false;
        flashLevel = 0;
        timesWrote = 0;
    }

    deltaTime = currentTime - lastTime
    lastTime = currentTime
    elapsedTime+=deltaTime;
    if(elapsedTime > timeInterval){
        elapsedTime = 0;
    }

    const animateID = window.requestAnimationFrame(animateBattle)

   

    //Battle stage 0 = sprite animation stage
    if(battleStage==0){
        if(monaLisa2.position.x <= 675){
            pathPlatform.position.x+=speedBattle * deltaTime / 1000;
            playerPathPlatform.position.x-=speedBattle * deltaTime / 1000;
            monaLisa2.position.x += speedBattle * deltaTime / 1000;
        }
        if(hpBox.position.x < 90){
            hpBox.position.x+=speedBattle * deltaTime / 1000;
            hpOverlay.position.x+=speedBattle * deltaTime / 1000;
            hpOverlayPlayer.position.x+=speedBattle * deltaTime / 1000;
        }
            
        else {
            battleStage++;
        }
        
        battleBackground.draw()
        pathPlatform.draw()
        playerPathPlatform.draw()
        battleDialogueBox.draw()
        hpBox.draw()
        c.drawImage(
            hpOverlay.image, // The image to draw
            0, // Source X (start cropping from the left edge)
            0, // Source Y (start cropping from the top edge)
            hpOverlay.width, // Source width (use the full width of the image)
            croppedHeight, // Source height (only the first 1/6th of the image height)
            hpOverlay.position.x + 201, // Destination X (where to draw on the canvas)
            hpOverlay.position.y + 68, // Destination Y (where to draw on the canvas)
            hpOverlay.width * hpOverlay.scale, // Destination width (same as source width to avoid scaling)
            croppedHeight * hpOverlay.scale // Destination height (same as cropped height to avoid scaling)
        );

        c.fillStyle = "rgb(78, 78, 78)"
        c.font = "35px Pokemon Emerald"; // Set font size and style
        c.fillText("CHOPPED MONA LISA          Lv69", hpBox.position.x + 20, hpBox.position.y + hpBox.height/2 - 10)
        monaLisa2.draw()

        battleAnimationTransition.topSlab.y-=2.2;
        battleAnimationTransition.bottomSlab.y+=2.2;
        c.fillStyle = "black"
        c.fillRect(battleAnimationTransition.topSlab.x,battleAnimationTransition.topSlab.y,canvas.width,canvas.height/2)
        c.fillRect(battleAnimationTransition.bottomSlab.x,battleAnimationTransition.bottomSlab.y, canvas.width,canvas.height/2)
        return;

        //Battle stage 1 = Releasing Grace
    } else if (battleStage==1){
        console.log(elapsedTime)
        if(elapsedTime>820){
            battleLoop.play();
        }
        c.reset()
        battleBackground.draw()
        pathPlatform.draw()
        
        playerPathPlatform.draw()
        hpBox.draw()
    
        monaLisa2.draw()
        c.fillStyle = "rgb(78, 78, 78)"
        c.font = "35px Pokemon Emerald"; // Set font size and style
        c.fillText("CHOPPED MONA LISA          Lv69", hpBox.position.x + 20, hpBox.position.y + hpBox.height/2 - 10)
        c.drawImage(
            hpOverlay.image, // The image to draw
            0, // Source X (start cropping from the left edge)
            0, // Source Y (start cropping from the top edge)
            hpOverlay.width, // Source width (use the full width of the image)
            croppedHeight, // Source height (only the first 1/6th of the image height)
            hpOverlay.position.x + 201, // Destination X (where to draw on the canvas)
            hpOverlay.position.y + 68, // Destination Y (where to draw on the canvas)
            hpOverlay.width * hpOverlay.scale, // Destination width (same as source width to avoid scaling)
            croppedHeight * hpOverlay.scale // Destination height (same as cropped height to avoid scaling)
        );
        
        releaseDeltaTime = currentTime - releaseLastTime
        releaseLastTime = currentTime
        releaseElapsedTime+=releaseDeltaTime;
        if(graceReleased){
            pokeballSound.play()
            if(releaseElapsedTime <= 200){
                c.globalAlpha = flashLevel;
                pookieFlash.draw()
                flashLevel+=0.06;
                c.globalAlpha = 1;
            } else {
                pookie.draw()
                battleStage++;
            }
        }
        battleDialogueBox.draw()

        if(!typing && (timesWrote == 0)){
            startTypingEffect("Wild CHOPPED MONA LISA appeared!")
            timesWrote++;
            console.log(timesWrote)
        }
        writeText()
/*
    if(showBattleOptions){
        inBattleOptions=true;
        window.addEventListener("keydown", (e)=>{
            if(e.key==="d" && (cursorPositions.current==1 || cursorPositions.current==3)){
                arrow.position.x+= 240 
                if(cursorPositions.current==1){
                    cursorPositions.current=2;
                } else {
                    cursorPositions.current=4;
                }
                
            }
            if(e.key=="s" && (cursorPositions.current==1 || cursorPositions.current==2)){
                arrow.position.y+= 70 
                if(cursorPositions.current==1){
                    cursorPositions.current=3;
                } else {
                    cursorPositions.current = 4;
                }
                
            }
            if(e.key==="w" && (cursorPositions.current==3 || cursorPositions.current==4)){
                arrow.position.y-=70 
                if(cursorPositions.current==3){
                    cursorPositions.current=1;
                } else {
                    cursorPositions.current=2;
                }
                
            }
            if(e.key=="a" && (cursorPositions.current==2 || cursorPositions.current==4)){
                arrow.position.x-= 240 
                if(cursorPositions.current==2){
                    cursorPositions.current=1;
                } else {
                    cursorPositions.current = 3;
                }
                
            } else {
                if(e.key=="z" && cursorPositions.current==4 && cursorPositions.active){
                    dialogueFinished=false;
                    showBattleOptions=false;
                }
            }
        })
        const cropWidth = (battleComandSprite.width * 2) / 5;
        console.log(showBattleOptions)
        // Calculate the starting x-coordinate for the crop (3/5ths from the left)
        const cropStartX = battleComandSprite.width - cropWidth;
        
        // Draw the cropped portion of the image
        battleComandSprite.draw()
        console.log(arrow.position.x)
        arrow.draw()
    } else {
        battleDialogueBox.draw()
    }

*/

    

} else if(battleStage==2){
    c.reset()
    battleBackground.draw()
    pathPlatform.draw()
    playerPathPlatform.draw()
    if(playerHPBox.position.x > 550){
        playerHPBox.position.x -= speedBattle * deltaTime / 1000;
        hpOverlayPlayer.position.x -= speedBattle * deltaTime / 1000;
    }
    playerHPBox.draw()
    pookie.draw()
    hpBox.draw()
    monaLisa2.draw()

    battleDialogueBox.draw()
    c.drawImage(
        hpOverlay.image, // The image to draw
        0, // Source X (start cropping from the left edge)
        0, // Source Y (start cropping from the top edge)
        hpOverlay.width, // Source width (use the full width of the image)
        croppedHeight, // Source height (only the first 1/6th of the image height)
        hpOverlay.position.x + 201, // Destination X (where to draw on the canvas)
        hpOverlay.position.y + 68, // Destination Y (where to draw on the canvas)
        hpOverlay.width * hpOverlay.scale, // Destination width (same as source width to avoid scaling)
        croppedHeight * hpOverlay.scale // Destination height (same as cropped height to avoid scaling)
    );

    
    c.drawImage(
        hpOverlayPlayer.image, // The image to draw
        0, // Source X (start cropping from the left edge)
        0, // Source Y (start cropping from the top edge)
        hpOverlayPlayer.width, // Source width (use the full width of the image)
        croppedHeight, // Source height (only the first 1/6th of the image height)
        hpOverlayPlayer.position.x + 990, // Destination X (where to draw on the canvas)
        hpOverlayPlayer.position.y + 318, // Destination Y (where to draw on the canvas)
        hpOverlayPlayer.width * hpOverlayPlayer.scale, // Destination width (same as source width to avoid scaling)
        croppedHeight * hpOverlayPlayer.scale // Destination height (same as cropped height to avoid scaling)
    );
    
    c.fillStyle = "rgb(78, 78, 78)"
    c.font = "35px Pokemon Emerald"; // Set font size and style
    c.fillText("GRACE                             Lv100", playerHPBox.position.x + 60, playerHPBox.position.y + playerHPBox.height/2 - 10)


        
    c.fillText("CHOPPED MONA LISA          Lv69", hpBox.position.x + 20, hpBox.position.y + hpBox.height/2 - 10)

/*
    window.addEventListener("keydown", (e)=> {
        if(e.key==="z"){
            if(!inBattleOptions){
                showBattleOptions=true;
            } else {
               if(cursorPositions.current==4 && !zIsLocked && !dialogueFinished){
                                zIsLocked=true;
                    startTypingEffect("You can't run away silly!")
                    dialogueFinished=true
               } else {

                if(dialogueFinished){
                    showBattleOptions=true;
                    
                    
                }
               }
            }
        }
    })

    */
    writeText()
} else if(battleStage == 3){
    buttonDeltaTime = currentTime - buttonLastTime
    buttonLastTime = currentTime
    buttonElapsedTime+=buttonDeltaTime;
    c.reset()
    battleBackground.draw()
    pathPlatform.draw()
    playerPathPlatform.draw()
    if(playerHPBox.position.x > 550){
        playerHPBox.position.x -= speedBattle * deltaTime / 1000;
        hpOverlayPlayer.position.x -= speedBattle * deltaTime / 1000;
    }
    playerHPBox.draw()
    pookie.draw()
    hpBox.draw()
    monaLisa2.draw()

    battleComandSprite.draw()
    c.drawImage(
        hpOverlay.image, // The image to draw
        0, // Source X (start cropping from the left edge)
        0, // Source Y (start cropping from the top edge)
        hpOverlay.width, // Source width (use the full width of the image)
        croppedHeight, // Source height (only the first 1/6th of the image height)
        hpOverlay.position.x + 201, // Destination X (where to draw on the canvas)
        hpOverlay.position.y + 68, // Destination Y (where to draw on the canvas)
        hpOverlay.width * hpOverlay.scale, // Destination width (same as source width to avoid scaling)
        croppedHeight * hpOverlay.scale // Destination height (same as cropped height to avoid scaling)
    );

    
    c.drawImage(
        hpOverlayPlayer.image, // The image to draw
        0, // Source X (start cropping from the left edge)
        0, // Source Y (start cropping from the top edge)
        hpOverlayPlayer.width, // Source width (use the full width of the image)
        croppedHeight, // Source height (only the first 1/6th of the image height)
        hpOverlayPlayer.position.x + 990, // Destination X (where to draw on the canvas)
        hpOverlayPlayer.position.y + 318, // Destination Y (where to draw on the canvas)
        hpOverlayPlayer.width * hpOverlayPlayer.scale, // Destination width (same as source width to avoid scaling)
        croppedHeight * hpOverlayPlayer.scale // Destination height (same as cropped height to avoid scaling)
    );
    
    c.fillStyle = "rgb(78, 78, 78)"
    c.font = "35px Pokemon Emerald"; // Set font size and style
    c.fillText("GRACE                             Lv100", playerHPBox.position.x + 60, playerHPBox.position.y + playerHPBox.height/2 - 10)


        
    c.fillText("CHOPPED MONA LISA          Lv69", hpBox.position.x + 20, hpBox.position.y + hpBox.height/2 - 10)
    arrow.draw()
    writeText()

    if(keys.d.pressed && (cursorPositions.current==1 || cursorPositions.current==3)){
        arrow.position.x+= 240 
        if(cursorPositions.current==1){
            cursorPositions.current=2;
        } else {
            cursorPositions.current=4;
        }
    } 
    
    if(keys.s.pressed && (cursorPositions.current==1 || cursorPositions.current==2)){
        arrow.position.y+= 70 
        if(cursorPositions.current==1){
            cursorPositions.current=3;
        } else {
            cursorPositions.current = 4;
        }
    }
    
    if(keys.w.pressed && (cursorPositions.current==3 || cursorPositions.current==4)){
        arrow.position.y-=70 
        if(cursorPositions.current==3){
            cursorPositions.current=1;
        } else {
            cursorPositions.current=2;
        }
    }
    
    if(keys.a.pressed && (cursorPositions.current==2 || cursorPositions.current==4)){
        arrow.position.x-= 240 
        if(cursorPositions.current==2){
            cursorPositions.current=1;
        } else {
            cursorPositions.current = 3;
        }
    }
    

} else if (battleStage == 4){
    c.reset()
    battleBackground.draw()
    pathPlatform.draw()
    playerPathPlatform.draw()
    if(playerHPBox.position.x > 550){
        playerHPBox.position.x -= speedBattle * deltaTime / 1000;
        hpOverlayPlayer.position.x -= speedBattle * deltaTime / 1000;
    }
    playerHPBox.draw()
    pookie.draw()
    hpBox.draw()
    monaLisa2.draw()

    battleDialogueBox.draw()
    c.drawImage(
        hpOverlay.image, // The image to draw
        0, // Source X (start cropping from the left edge)
        0, // Source Y (start cropping from the top edge)
        hpOverlay.width, // Source width (use the full width of the image)
        croppedHeight, // Source height (only the first 1/6th of the image height)
        hpOverlay.position.x + 201, // Destination X (where to draw on the canvas)
        hpOverlay.position.y + 68, // Destination Y (where to draw on the canvas)
        hpOverlay.width * hpOverlay.scale, // Destination width (same as source width to avoid scaling)
        croppedHeight * hpOverlay.scale // Destination height (same as cropped height to avoid scaling)
    );

    
    c.drawImage(
        hpOverlayPlayer.image, // The image to draw
        0, // Source X (start cropping from the left edge)
        0, // Source Y (start cropping from the top edge)
        hpOverlayPlayer.width, // Source width (use the full width of the image)
        croppedHeight, // Source height (only the first 1/6th of the image height)
        hpOverlayPlayer.position.x + 990, // Destination X (where to draw on the canvas)
        hpOverlayPlayer.position.y + 318, // Destination Y (where to draw on the canvas)
        hpOverlayPlayer.width * hpOverlayPlayer.scale, // Destination width (same as source width to avoid scaling)
        croppedHeight * hpOverlayPlayer.scale // Destination height (same as cropped height to avoid scaling)
    );
    
    c.fillStyle = "rgb(78, 78, 78)"
    c.font = "35px Pokemon Emerald"; // Set font size and style
    c.fillText("GRACE                             Lv100", playerHPBox.position.x + 60, playerHPBox.position.y + playerHPBox.height/2 - 10)


        
    c.fillText("CHOPPED MONA LISA          Lv69", hpBox.position.x + 20, hpBox.position.y + hpBox.height/2 - 10)
    writeText()
} else if(battleStage==5){
    c.reset()
    battleBackground.draw()
    graceInfo.draw()
} else if(battleStage==6){
    c.reset()
    battleBackground.draw()
    pathPlatform.draw()
    playerPathPlatform.draw()
    if(playerHPBox.position.x > 550){
        playerHPBox.position.x -= speedBattle * deltaTime / 1000;
        hpOverlayPlayer.position.x -= speedBattle * deltaTime / 1000;
    }
    playerHPBox.draw()
    pookie.draw()
    hpBox.draw()
    monaLisa2.draw()

    battleMoves.draw()
    c.drawImage(
        hpOverlay.image, // The image to draw
        0, // Source X (start cropping from the left edge)
        0, // Source Y (start cropping from the top edge)
        hpOverlay.width, // Source width (use the full width of the image)
        croppedHeight, // Source height (only the first 1/6th of the image height)
        hpOverlay.position.x + 201, // Destination X (where to draw on the canvas)
        hpOverlay.position.y + 68, // Destination Y (where to draw on the canvas)
        hpOverlay.width * hpOverlay.scale, // Destination width (same as source width to avoid scaling)
        croppedHeight * hpOverlay.scale // Destination height (same as cropped height to avoid scaling)
    );

    
    c.drawImage(
        hpOverlayPlayer.image, // The image to draw
        0, // Source X (start cropping from the left edge)
        0, // Source Y (start cropping from the top edge)
        hpOverlayPlayer.width, // Source width (use the full width of the image)
        croppedHeight, // Source height (only the first 1/6th of the image height)
        hpOverlayPlayer.position.x + 990, // Destination X (where to draw on the canvas)
        hpOverlayPlayer.position.y + 318, // Destination Y (where to draw on the canvas)
        hpOverlayPlayer.width * hpOverlayPlayer.scale, // Destination width (same as source width to avoid scaling)
        croppedHeight * hpOverlayPlayer.scale // Destination height (same as cropped height to avoid scaling)
    );
    
    c.fillStyle = "rgb(78, 78, 78)"
    c.font = "35px Pokemon Emerald"; // Set font size and style
    c.fillText("GRACE                             Lv100", playerHPBox.position.x + 60, playerHPBox.position.y + playerHPBox.height/2 - 10)



    c.fillText("CHOPPED MONA LISA          Lv69", hpBox.position.x + 20, hpBox.position.y + hpBox.height/2 - 10)
    c.font = "56px Pokemon Emerald"; // Set font size and style
    arrow2.draw()
    c.fillStyle = "rgb(59, 59, 59)"
    c.shadowColor="gray"
    c.shadowOffsetX = 0.1;
    c.shadowOffsetY = 0.1;
    c.fillText("EXAMINE", 110, canvas.height - 120)
    if(battlePositions.pp[battlePositions.current-1] == 0){
        c.fillStyle = "red"
    }
    c.fillText((battlePositions.pp[battlePositions.current-1] + "/1"), 950, canvas.height - 45)
    c.fillStyle = "rgb(59, 59, 59)"
    c.fillText("SHOW CYRUS", 110, canvas.height - 50)
    c.fillText("TWERK'O LISA", 400, canvas.height - 50)
    c.fillText("PAINT", 400, canvas.height - 120)


    if(keys.d.pressed && (battlePositions.current==1 || battlePositions.current==3)){
        arrow2.position.x+= 290
        if(battlePositions.current==1){
            battlePositions.current=2;
        } else {
            battlePositions.current=4;
        }
    } 
    
    if(keys.s.pressed && (battlePositions.current==1 || battlePositions.current==2)){
        arrow2.position.y+= 70 
        if(battlePositions.current==1){
            battlePositions.current=3;
        } else {
            battlePositions.current = 4;
        }
    }
    
    if(keys.w.pressed && (battlePositions.current==3 || battlePositions.current==4)){
        arrow2.position.y-=70 
        if(battlePositions.current==3){
            battlePositions.current=1;
        } else {
            battlePositions.current=2;
        }
    }
    
    if(keys.a.pressed && (battlePositions.current==2 || battlePositions.current==4)){
        arrow2.position.x-= 290 
        if(battlePositions.current==2){
            battlePositions.current=1;
        } else {
            battlePositions.current = 3;
        }
    }

} else if(battleStage == 7){
    if(drainHP && hpOverlay.scale > 0){
        hpOverlay.scale-=0.01;
    }
    c.reset()
    battleBackground.draw()
    pathPlatform.draw()
    playerPathPlatform.draw()
    if(playerHPBox.position.x > 550){
        playerHPBox.position.x -= speedBattle * deltaTime / 1000;
        hpOverlayPlayer.position.x -= speedBattle * deltaTime / 1000;
    }
    playerHPBox.draw()
    pookie.draw()
    hpBox.draw()
    monaLisa2.draw()

    battleMoves.draw()
    c.drawImage(
        hpOverlay.image, // The image to draw
        0, // Source X (start cropping from the left edge)
        0, // Source Y (start cropping from the top edge)
        hpOverlay.width, // Source width (use the full width of the image)
        croppedHeight, // Source height (only the first 1/6th of the image height)
        hpOverlay.position.x + 201, // Destination X (where to draw on the canvas)
        hpOverlay.position.y + 68, // Destination Y (where to draw on the canvas)
        hpOverlay.width * hpOverlay.scale, // Destination width (same as source width to avoid scaling)
        croppedHeight * hpOverlay.scale // Destination height (same as cropped height to avoid scaling)
    );

    
    c.drawImage(
        hpOverlayPlayer.image, // The image to draw
        0, // Source X (start cropping from the left edge)
        0, // Source Y (start cropping from the top edge)
        hpOverlayPlayer.width, // Source width (use the full width of the image)
        croppedHeight, // Source height (only the first 1/6th of the image height)
        hpOverlayPlayer.position.x + 990, // Destination X (where to draw on the canvas)
        hpOverlayPlayer.position.y + 318, // Destination Y (where to draw on the canvas)
        hpOverlayPlayer.width * hpOverlayPlayer.scale, // Destination width (same as source width to avoid scaling)
        croppedHeight * hpOverlayPlayer.scale // Destination height (same as cropped height to avoid scaling)
    );
    
    c.fillStyle = "rgb(78, 78, 78)"
    c.font = "35px Pokemon Emerald"; // Set font size and style
    c.fillText("GRACE                             Lv100", playerHPBox.position.x + 60, playerHPBox.position.y + playerHPBox.height/2 - 10)



    c.fillText("CHOPPED MONA LISA          Lv69", hpBox.position.x + 20, hpBox.position.y + hpBox.height/2 - 10)
    c.font = "56px Pokemon Emerald"; // Set font size and style
    arrow2.draw()
    c.fillStyle = "rgb(59, 59, 59)"
    c.shadowColor="gray"
    c.shadowOffsetX = 0.1;
    c.shadowOffsetY = 0.1;
    battleDialogueBox.draw()
    writeText()
} else if(battleStage==8){
   

    battleBackground.draw()
    bag.draw()
    bag1.draw()
    arrow3.draw()
    c.fillStyle = "rgb(59, 59, 59)"
    c.shadowColor="gray"
    c.shadowOffsetX = 0.1;
    c.shadowOffsetY = 0.1;
    c.fillText("ITEMS", 245, 28)
    c.fillText("Paint Brush            X 2", 554, 70)
    c.fillText("Old Racket            X 12", 554, 130)
    c.fillText("Mysterious Fish     X 1", 554, 190)
    c.fillText("Cheese Burger    X 100", 554, 250)
    c.fillText("Colored Pencil      X 42", 554, 310)
    c.fillText("Watercolor Paper   X 5", 554, 370)
    c.lineWidth = 1;
    wrapText(c, bagCursorPositions.text, 120, 520, 800, 50)

    if(!keys.s.pressed && !keys.w.pressed){
        lockBagArrow=false;
    }


    

    if((keys.s.pressed) && !lockBagArrow){
        clickSound.play()
        
      
        switch(bagCursorPositions.current){
        case 1: {
            lockBagArrow=true;
            arrow3.position.y+=60;
            bagCursorPositions.current++;
            bagCursorPositions.text="Used to destroy Cyrus on the tennis court."
            return;
        }

        case 2: {
            lockBagArrow=true;
            arrow3.position.y+=60;
            bagCursorPositions.current++;
            bagCursorPositions.text="Um hello.. It says MYSTERIOUS. That means you will NEVER know what it is."
            return;
        }

        case 3: {
            lockBagArrow=true;
            arrow3.position.y+=60;
            bagCursorPositions.current++;
            bagCursorPositions.text="It's okay. We know you're fat."
            return;
        }

        case 4: {
            lockBagArrow=true;
            arrow3.position.y+=60;
            bagCursorPositions.current++;
            bagCursorPositions.text="Dont worry, its the fancy kind."
            return;
        }

        case 5: {
            lockBagArrow=true;
            arrow3.position.y+=60;
            bagCursorPositions.current++;
            bagCursorPositions.text="For creating watercolor paintings."
            return;
        } case 6: {
            lockBagArrow=true;
            arrow3.position.y-=300;
            bagCursorPositions.current=1;
            bagCursorPositions.text="You're a master artist, of course you have these."
        }
        
        }
    }

    if((keys.w.pressed) && !lockBagArrow){
        clickSound.play()
        switch(bagCursorPositions.current){
        case 1: {
            lockBagArrow=true;
            arrow3.position.y+=300;
            bagCursorPositions.current=6;
            bagCursorPositions.text="For creating watercolor paintings."
            console.log("BRUIH")
            return;
        }

        case 2: {
            lockBagArrow=true;
            arrow3.position.y-=60;
            bagCursorPositions.current--;
            bagCursorPositions.text="You're a master artist, of course you have these."
            return;
        }

        case 3: {
            lockBagArrow=true;
            arrow3.position.y-=60;
            bagCursorPositions.current--;
            bagCursorPositions.text="Used to destroy Cyrus on the tennis court."
            return;
        }

        case 4: {
            lockBagArrow=true;
            arrow3.position.y-=60;
            bagCursorPositions.current--;
            bagCursorPositions.text="Um hello.. It says MYSTERIOUS. That means you will NEVER know what it is."
            return;
        }

        case 5: {
            lockBagArrow=true;
            arrow3.position.y-=60;
            bagCursorPositions.current--;
            bagCursorPositions.text="It's okay. We know you're fat."
            return;
        }

        case 6:{
            lockBagArrow=true;
            arrow3.position.y-=60;
            bagCursorPositions.current--;
            bagCursorPositions.text="Dont worry, its the fancy kind."
            return;
        }
        
        }
    }

    if(keys.x.pressed){
        lockBattleMenu=true;
        battleStage=5;
    }
}

if(keys.z.pressed == false){
    lockBattleMenu=false;
}

if(keys.z.pressed && !typing){
    if(endGame==true){
        gsap.to("#overlay", {
            opacity: 1,
            duration: 1,
            onComplete(){
                window.cancelAnimationFrame(animateID)
                document.getElementById("game-container").style.display='none';
                document.getElementById("ending").style.display='block';
                return;
            }
        })
        
    

    
    }
    console.log("STAGE: " + battleStage)
    switch (battleStage){
        case 1: {
            if(!graceReleased){
                releaseElapsedTime = 0;
                graceReleased=true;
                startTypingEffect("Go! GRACE!")
            }
            break;
        }
        case 2: {
            clickSound.play()
            startTypingEffect("What will GRACE do?")
            battleStage++;
            break;
        }
        case 3: {
            clickSound.play()
                if(!lockBattleMenu){
                    if(cursorPositions.current == 4){
                        battleStage++;
                        startTypingEffect("You can't run away silly!")
                        
                    } else if(cursorPositions.current == 3){
                        battleStage = 5;
                      
                    } else if(cursorPositions.current == 1){
                        lockBattleMenu = true;
                        battleStage = 6;
                       
                    }
                else if(cursorPositions.current==2){
                    battleStage = 8;
                   
                }
            }
            break;
        }
        case 4: {
            clickSound.play()
                lockBattleMenu=true;
                currentText="What will GRACE do?"
                battleStage--;
            break;
        }
        case 6: {
            clickSound.play()
            if(!lockBattleMenu){
                if(battlePositions.current==1 && battlePositions.pp[0] > 0){
                    if(dialogueCounter == 0){
                        startTypingEffect("GRACE used EXAMINE!")
                        battleStage++;
                        dialogueCounter++;
                        battlePositions.pp[0]=0;
                    }
                } else if(battlePositions.current==3 && battlePositions.pp[2] > 0){
                    if(dialogueCounter==0){
                        startTypingEffect("GRACE used SHOW CYRUS!")
                        battleStage++;
                        dialogueCounter++;
                        battlePositions.pp[2]=0;
                    }
                } else if(battlePositions.current==4 && battlePositions.pp[3] > 0){
                    if(dialogueCounter==0){
                        startTypingEffect("GRACE used TWERK'O LISA!")
                        battleStage++;
                        dialogueCounter++;
                        battlePositions.pp[3]=0;
                    }
                } else if(battlePositions.current==2 && battlePositions.pp[1] > 0){
                    if(battlePositions.pp[0] < 1 && battlePositions.pp[2] < 1 && battlePositions.pp[3] < 1){
                    if(dialogueCounter==0){
                        startTypingEffect("GRACE used PAINT!")
                        battleStage++;
                        dialogueCounter++;
                        battlePositions.pp[1]=0;
                    }
                } else {
                    startTypingEffect("Use your other moves first!")
                    lockBattleMenu=true;
                    battleStage++;
                }
                }
            }
                break;
        }
        case 7: {
            clickSound.play()
            if(battlePositions.current==1){
                if(dialogueCounter == 1){
                    startTypingEffect("It's the Mona Lisa! A piece Da Vinci created to rival artist Grace Wang.")
                    dialogueCounter++;
                } else if (dialogueCounter == 2){
                    startTypingEffect("It's not very effective...")
                    dialogueCounter = 0;
                } else {
                    lockBattleMenu=true;
                    battleStage--;
                }
            } else if(battlePositions.current==3){
                if(dialogueCounter == 1){
                    startTypingEffect("❝Hi pookie check this weird ass Mona Lisa out.❞")
                    dialogueCounter++;
                } else if (dialogueCounter == 2){
                    startTypingEffect("It's not very effective...")
                    dialogueCounter = 0;
                } else {
                    lockBattleMenu=true;
                    battleStage--;
                }
            } else if(battlePositions.current==4){
                if(dialogueCounter == 1){
                    startTypingEffect("Grace starts twerking...")
                    dialogueCounter++;
                } else if (dialogueCounter==2){
                    startTypingEffect("The Mona Lisa twerks back...")
                    dialogueCounter++;
                } else if (dialogueCounter==3){
                    startTypingEffect("It's not very effective...")
                    dialogueCounter++;
                } else if(dialogueCounter==4){
                    startTypingEffect("You've been out twerked.")
                    dialogueCounter=0;
                } else {
                    lockBattleMenu=true;
                    battleStage--;
                }
            } else if(battlePositions.current==2){
                 if(dialogueCounter == 1){
                    startTypingEffect("Grace brushes ferociously using acrylic paint.")
                    dialogueCounter++;
                } else if (dialogueCounter==2){
                    startTypingEffect("Holy shit dude, your brushing skills are next level.")
                    dialogueCounter++;
                } else if (dialogueCounter==3){
                    startTypingEffect("Thanks dude, I've been on the art class grind.")
                    dialogueCounter++;
                } else if(dialogueCounter==4){
                    startTypingEffect("It's super effective!")
                    dialogueCounter++;
                } else if(dialogueCounter==5){
                    startTypingEffect("MONA LISA has fainted.")
                    drainHP=true;
                    attackSound.play()
                    dialogueCounter=0;
                    let intensity = 3; // Adjust intensity of the shake
                    let duration = 500; // Shake duration in milliseconds
                    let startTime = Date.now();
                
                    function shake() {
                      let elapsed = Date.now() - startTime;
                      if (elapsed > duration) {
                        canvas.style.transform = "translate(0px, 0px)";
                        return;
                      }
                
                      let offsetX = (Math.random() * 2 - 1) * intensity;
                      let offsetY = (Math.random() * 2 - 1) * intensity;
                      canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                
                      requestAnimationFrame(shake);
                    }
                
                    shake();
                    battleLoop.pause()
                    endGame=true;
                } else {
                    lockBattleMenu=true;
                    battleStage--;
                }
            }
                
        } case 8: {
            clickSound.play()
            console.log("THIS IS CASE 8")
            return;
        }
    }
}

if(keys.x.pressed && !typing){
    if(battleStage == 5 || battleStage == 6) {
        clickSound.play()
        currentText="What will GRACE do?"
        battleStage=3;
    }
}



/*

if(e.key=="a" && (cursorPositions.current==2 || cursorPositions.current==4)){
    arrow.position.x-= 240 
    if(cursorPositions.current==2){
        cursorPositions.current=1;
    } else {
        cursorPositions.current = 3;
    }
    
} else {
    if(e.key=="z" && cursorPositions.current==4 && cursorPositions.active){
        dialogueFinished=false;
        showBattleOptions=false;
    }
}
    

*/










    

/*
    if(battleDialogueEngaged){
    zLocked = true;
    startTypingEffect("Wild CHOPPED MONA LISA appeared!")
    battleDialogueEngaged = false;
    } 

    c.font = "56px Pokemon Emerald"; // Set font size and style
    c.shadowColor="gray"
    c.shadowOffsetX = 4;
    c.shadowOffsetY = 4;
    c.fillStyle = "white";
    c.textAlign = "left";
    c.textBaseline = "middle";


    const dialogueBoxHeight = 200;
    const padding = 30;
    const textX = canvas.width / 17
    const textY = canvas.height - dialogueBoxHeight / 1.65 // Center vertically within the box

    const maxLineWidth = canvas.width - 2 * padding;
    const words = currentText.split(" ");
    let line = "";
    let lines = [];
    words.forEach((word) => {
        const testLine = line + word + " ";
        const testWidth = c.measureText(testLine).width;
        if (testWidth > maxLineWidth) {
            lines.push(line);
            line = word + " ";
        } else {
            line = testLine;
        }
    });
    lines.push(line);

    // Render each line of text
    lines.forEach((line, index) => {
        c.fillText(line, textX, textY - (lines.length / 2) * 40 + index * 40);
    });
    window.addEventListener("keydown", (e) => {
        if(e.key=="z" && typing==false){
        if(!inBattleOptions){
            if(!graceReleased){
                startTypingEffect("Go! GRACE!")
                releaseElapsedTime = 0;
                graceReleased=true;
            } else {
                startTypingEffect("What will GRACE do?")
            }
        } 
            
        }
        
    }
)



*/

    

}










function startTypingEffect(dialogue, onComplete) {
    typing = true;       // Lock the Z key during typing
    currentText = "";    // Reset the displayed text
    textIndex = 0;

    // Clear any existing interval
    if (typeInterval) clearInterval(typeInterval);

    // Start the typewriter effect
    typeInterval = setInterval(() => {
        if (textIndex < dialogue.length) {
            currentText += dialogue[textIndex];
            textIndex++;
        } else {

            zIsLocked = false;
            clearInterval(typeInterval); // Stop typing when complete
            typing = false;              // Unlock the Z key
            onComplete?.();              // Call the optional callback
        }
    }, 25); // Adjust typing speed here (50ms per character)
}




    let lastKey = ''
    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'w': 
                keys.w.pressed = true
                lastKey = 'w'
                break
            case 'a': 
                keys.a.pressed = true
                lastKey = 'a'
                break
            case 's': 
                keys.s.pressed = true
                lastKey = 's'
                break
            case 'd': 
                keys.d.pressed = true
                lastKey = 'd'
                break
            case 'z':
                keys.z.pressed = true
                break
            case 'x':
                keys.x.pressed = true
                break
        }
    })

    window.addEventListener('keyup', (e) => {
        switch (e.key) {
            case 'w': 
                keys.w.pressed = false
                break
            case 'a': 
                keys.a.pressed = false
                break
            case 's': 
                keys.s.pressed = false
                break
            case 'd': 
                keys.d.pressed = false
                break
            case 'z':
                keys.z.pressed = false
                break
            case 'x':
                keys.x.pressed = false
                break
            }
    })

















    
}











let blink_speed = 1350 
let t = setInterval(function () {
    let ele = document.getElementById('anytostart');
    if (ele.classList.contains('hidden')) {
        ele.classList.remove('hidden');
    } else {
        ele.classList.add('hidden');
    }
}, blink_speed);

/*
remove this
*/


initializeSounds()

if(loopType==0){
window.addEventListener('keydown', () => {
    document.getElementById("instructions").style.display = "none";
    document.getElementById("game-container").style.display = "flex"
    runGame();
    levelSound.play()
}, {once: true})
} else {
    document.getElementById("instructions").style.display = "none";
    document.getElementById("game-container").style.display = "flex"
    runGame();
}


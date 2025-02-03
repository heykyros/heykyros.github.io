
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

function runGame(){
    console.log("Running")

    console.log(collisions)
    canvas.width =1100;
    canvas.height = 700;

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




    function animate(currentTime){
        const animationID = window.requestAnimationFrame(animate)
        console.log(animationID)
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
                
        if (battle.iniated) return

                if (inBattleRange({ player: player, monaLisa: monaLisa })) {
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
                                opacity: 1,
                                duration: 0.3,
                            })
                        }
                    })

                    window.cancelAnimationFrame(animationID)
                    animateBattle()
                   
                    
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
                    if (!activeNPC.engaged) {
                        // Engage with NPC
                        for (let i = 0; i < npcs.length; i++) {
                            if (inNPCRange({ player: player, npc: npcs[i] })) {
                                activeNPC.engaged = true;
                                activeNPC.npc = npcs[i];
                                console.log("Engaged with NPC");
                
                                // Start typing the first dialogue
                                startTypingEffect(activeNPC.npc.dialogue[activeNPC.npc.currentDialogue]);
                                break;
                            }
                        }
                    } else {
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
animate(0)



function animateBattle(){
    window.requestAnimationFrame(animateBattle)

}






let typing = false;      // Whether the typewriter effect is active
let currentText = "";    // Stores the text being displayed
let textIndex = 0;       // Index of the current character being displayed
let typeInterval;        // Interval for the typewriter effect

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
window.onload = () => {
    runGame();
}


//uncomment this
//window.addEventListener('keydown', () => {
   // document.getElementById("instructions").style.display = "none";
    //document.getElementById("game-container").style.display = "flex"
   // runGame();
//}, {once: true})


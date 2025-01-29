class Boundary {
    constructor({position}){
        this.position = position
        this.width = 53.6
        this.height = 53.6
    }

    draw(){
        c.fillStyle = 'rgb(255, 0, 0, 0)'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

class Sprite {
    constructor({image, position, scale = 1}) {
        this.image = image
        this.position = position     
        this.scale = scale;  
        this.width = this.image.width * this.scale
        this.height = this.image.height * this.scale
     }
    draw(){
        c.drawImage(this.image, this.position.x, this.position.y, this.image.width * this.scale, this.image.height * this.scale)
    }
}

class Player {
    constructor({position, scale = 1, sprites}) {
        console.log(sprites)
        this.position = position
        this.scale = scale
        this.sprites = sprites
        this.sprite = this.sprites.forward[0]
        this.frame = 0
        this.frameCount = 2
        this.width = 34 * this.scale
        this.height = 49 * this.scale

        // Animation timing properties
        this.frameTimer = 0
        this.frameInterval = 120// Adjust this to control animation speed (in milliseconds)
    }

    draw(){
        c.drawImage(this.sprite, this.position.x, this.position.y, this.width, this.height)
    }

    update(deltaTime){
        // Increment the frame timer
        this.frameTimer += deltaTime

        // If enough time has passed, update the frame
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0
            this.frame = (this.frame + 1) % (this.frameCount + 1) // Cycle through frames
        }
    }

    setSpriteDirection(direction) {
        this.sprite = this.sprites[direction][0]
    }
    setSpriteFrame(frame, direction){ {
        this.sprite = this.sprites[direction][frame]
    }
}
}

//dialogue is an array of Strings
class NPC extends Sprite {
    constructor({image, position, scale = 1, dialogue = ["Pst... I heard Cyrus really loves you.", "Thats why he spent hours and hours making this game for you.", "Enjoy your time here!"]}){
        super({image, position, scale})
        this.dialogue = dialogue
        this.currentDialogue = 0
        this.maxDialogue = dialogue.length

    }
}


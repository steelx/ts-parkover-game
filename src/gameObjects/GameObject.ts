import { Mesh } from "@babylonjs/core"
import Game from "../Game"

export default class GameObject extends Mesh {
    game: Game

    constructor(name: string, game: Game) {
        super(name, game.scene)
        this.game = game
    }
}

import { ArcRotateCamera, CannonJSPlugin, Engine, HemisphericLight, Scene, Vector3 } from "@babylonjs/core";
import Player from "./gameObjects/Player";
import GameObject from "./gameObjects/GameObject";
import { createUnevenGround } from "./meshes/unevenGround";

import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import Ground from "./gameObjects/Ground";
import CharacterInputController from "./CharacterInputController";

export default class Game {
    engine: Engine
    scene: Scene
    player: GameObject | null = null

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true)
        this.scene = Game.createScene(this.engine)

        this.initGame()

        this.engine.runRenderLoop(() => {
            this.scene.render()
        })

        window.addEventListener("resize", () => {
            this.engine.resize()
        })
    }

    public static createScene(engine: Engine): Scene {
        const scene = new Scene(engine);

        const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 5, Vector3.Zero(), scene);
        camera.attachControl(engine.getRenderingCanvas(), true);
        // camera.setTarget(this.player.position);

        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.intensity = 0.7;


        const gravityVector = new Vector3(0, -9.81, 0);
        const physicsPlugin = new CannonJSPlugin();
        scene.enablePhysics(gravityVector, physicsPlugin);

        return scene;
    }

    /**
     * everything that will update during the game
    */
    initGame() {
        this.player = new Player("player", new Vector3(0, 2, 0), this)
        new CharacterInputController(this.player, this)

        new Ground("ground", this)

        // this.scene.debugLayer.show()
    }
}
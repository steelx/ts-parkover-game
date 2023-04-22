import { ArcRotateCamera, CannonJSPlugin, Color3, DirectionalLight, Engine, HemisphericLight, Scene, ShadowGenerator, Vector3 } from "@babylonjs/core";
import Player from "./gameObjects/Player";
import GameObject from "./gameObjects/GameObject";

import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import Ground from "./gameObjects/Ground";
import CharacterInputController from "./CharacterInputController";

export default class Game {
    engine: Engine
    scene: Scene
    player: GameObject | null = null
    static shadowGenerator: ShadowGenerator;

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

        const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 10, Vector3.Zero(), scene);
        camera.attachControl(engine.getRenderingCanvas(), true);
        camera.setPosition(new Vector3(0, 3, 5))
        // camera.setTarget(this.player.position);

        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.intensity = 0.25;
        scene.ambientColor = Color3.Blue()

        const dlight = new DirectionalLight("directionalLight", new Vector3(-1, -2, -1), scene);
        dlight.intensity = 0.5;

        const shadowGenerator = new ShadowGenerator(1024, dlight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.useKernelBlur = true;
        shadowGenerator.blurKernel = 64;
        shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_LOW;
        this.shadowGenerator = shadowGenerator;


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

        const camera = this.scene.activeCamera as ArcRotateCamera;

        // Update the camera's target on every frame
        this.scene.onBeforeRenderObservable.add(() => {
            camera.setTarget(this.player.position)
        });

        new Ground("ground", this)
        Game.shadowGenerator.addShadowCaster(this.player)

        // this.scene.debugLayer.show()
    }
}
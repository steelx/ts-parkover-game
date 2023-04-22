import { ArcFollowCamera, CannonJSPlugin, Color3, DirectionalLight, Engine, HemisphericLight, Quaternion, Scene, ShadowGenerator, Vector3 } from "@babylonjs/core";
import Player from "./gameObjects/Player";

import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import Ground from "./gameObjects/Ground";
import CharacterInputController from "./CharacterInputController";

export default class Game {
    engine: Engine
    scene: Scene
    player: Player | null = null
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

        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.intensity = 0.25;
        scene.ambientColor = Color3.Blue()

        const dlight = new DirectionalLight("directionalLight", new Vector3(0, -10, 10), scene);
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

        engine.enterPointerlock();
        scene.onPointerDown = (e) => {
            if (e.button === 1) { engine.exitPointerlock(); }
        };

        return scene;
    }

    /**
     * everything that will update during the game
    */
    initGame() {
        new Ground("ground", this)
        this.player = new Player("player", new Vector3(0, 2, 0), this)

        const camera = new ArcFollowCamera("camera", Math.PI, Math.PI / 4, 10, this.player, this.scene);
        camera.computeWorldMatrix();

        new CharacterInputController(this.player, this)
        Game.shadowGenerator.addShadowCaster(this.player)

        // this.scene.debugLayer.show()
    }
}
import { ArcFollowCamera, Color3, DirectionalLight, Engine, HavokPlugin, HemisphericLight, Scene, ShadowGenerator, Vector3 } from "@babylonjs/core";
import Player from "./gameObjects/Player";
import Ground from "./gameObjects/Ground";
import CharacterInputController from "./CharacterInputController";
import LightningBolt from "./gameObjects/LightningBolt";
import KamakaziRocket from "./gameObjects/KamakaziRocket";
import HomingMissile from "./gameObjects/HomingMissile";

import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";

export default class Game {
    static shadowGenerator: ShadowGenerator;
    engine: Engine;
    scene: Scene;
    player: Player | null = null;
    characterInputController: CharacterInputController | null = null;

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
        dlight.intensity = 0.7;

        const shadowGenerator = new ShadowGenerator(1024, dlight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.useKernelBlur = true;
        shadowGenerator.blurKernel = 64;
        shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_LOW;
        this.shadowGenerator = shadowGenerator;


        const gravityVector = new Vector3(0, -9.81, 0);
        const physicsPlugin = new HavokPlugin();
        scene.enablePhysics(gravityVector, physicsPlugin);

        scene.onPointerDown = (e) => {
            if (e.button === 0) { engine.enterPointerlock(); }
            if (e.button === 1) { engine.exitPointerlock(); }
        };

        return scene;
    }

    /**
     * everything that will update during the game
    */
    initGame() {
        new Ground(this)
        this.player = new Player("player", new Vector3(0, 2, 0), this)

        // 140 degrees in radians
        const angle = 150 * Math.PI / 180;
        const camera = new ArcFollowCamera("camera", Math.PI, angle, 10, this.player, this.scene);
        camera.computeWorldMatrix();

        this.characterInputController = new CharacterInputController(this.player, this)
        Game.shadowGenerator.addShadowCaster(this.player)

        // explosives
        if (this.player === undefined) { return; }

        const lightningBolt = new LightningBolt(this);
        const strikeInterval = 5000; // Strike every 2000ms
        const strikeDuration = 500; // Each strike lasts for 500ms

        const minX = -9.5;
        const maxX = 9.5;
        const minZ = -9.5;
        const maxZ = 9.5;
        // new KamakaziRocket(new Vector3(Math.random() * 5, 1, Math.random() * -5), this, 5000)

        setInterval(() => {
            lightningBolt.strikeRandomPosition(minX, maxX, minZ, maxZ, strikeDuration);
            console.log("struck ? ", lightningBolt.struckPlayer());
            new HomingMissile(new Vector3(-10, 2, 0), this, 3000)
            new KamakaziRocket(new Vector3(Math.random() * 5, 1, Math.random() * -5), this, 5000)
        }, strikeInterval);

        // this.scene.debugLayer.show()
    }
}
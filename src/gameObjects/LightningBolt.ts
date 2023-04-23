import { CreateDashedLinesVertexData, Vector3, LinesMesh, ShaderMaterial, Effect, Color3, CreateLines, MeshBuilder } from "@babylonjs/core";
import GameObject from "./GameObject";
import Game from "../Game";

// shaders
import { lightningBoltVertexShader, lightningBoltFragmentShader } from '../shaders/lightingBolt.fx';

export default class LightningBolt extends GameObject {
    isVisible: boolean;
    lightningBolt: LinesMesh;

    constructor(game: Game) {
        super("lightningBolt", game);

        const points = LightningBolt.generateLightningPoints()

        this.lightningBolt = CreateLines("lightningBolt", { points, updatable: true });
        this.addChild(this.lightningBolt);

        // materials
        Effect.ShadersStore["lightningBoltVertexShader"] = lightningBoltVertexShader;
        Effect.ShadersStore["lightningBoltFragmentShader"] = lightningBoltFragmentShader;
        const boltMat = new ShaderMaterial("boltMat", this.getScene(), {
            vertex: "lightningBolt",
            fragment: "lightningBolt",
        }, {
            attributes: ["position"],
            uniforms: ["worldViewProjection", "color"],
        });

        boltMat.setVector3("color", new Vector3(0, 0, 1));
        boltMat.backFaceCulling = true;
        this.lightningBolt.material = boltMat;

        this.position.y = 2;
        this.setEnabled(false);
        this.isVisible = false;
    }

    public strikeRandomPosition(minX: number, maxX: number, minZ: number, maxZ: number, duration: number) {
        if (!this.isVisible) {
            const x = Math.random() * (maxX - minX) + minX;
            const z = Math.random() * (maxZ - minZ) + minZ;

            this.position.set(x, 1.5, z);
            this.setEnabled(true);
            this.isVisible = true;

            // Start the animation
            const animationInterval = setInterval(() => this.updateLightningPoints(), 50);

            setTimeout(() => {
                // Stop the animation
                clearInterval(animationInterval);

                this.setEnabled(false);
                this.isVisible = false;
            }, duration);
        }
    }

    public struckPlayer(): boolean {
        const player = this.game.player!;
        if (!this.isVisible || player.rotationQuaternion == null) {
            return false;
        }

        // Rotate the player collision mesh temporarily to match the bolt's orientation.
        // const originalRotation = player.rotationQuaternion.clone();
        // player.rotate(Axis.X, Math.PI / 2, Space.LOCAL);

        const intersecting = this.lightningBolt.intersectsMesh(player, true);

        // Reset the player collision mesh rotation.
        // player.rotationQuaternion.copyFrom(originalRotation);

        return intersecting;
    }

    static generateLightningPoints(): Vector3[] {
        const numSegments = 5;
        const yOffset = 4;
        const deviation = 0.5;
        const points: Vector3[] = [new Vector3(0, 0, 0)];

        for (let i = 1; i <= numSegments; i++) {
            const x = Math.random() * deviation - deviation / 2;
            const z = Math.random() * deviation - deviation / 2;
            points.push(new Vector3(x, yOffset * (i / numSegments), z));
        }

        return points;
    }

    public updateLightningPoints(): void {
        const points = LightningBolt.generateLightningPoints();
        this.lightningBolt = CreateLines("lightningBolt", { points, updatable: true, instance: this.lightningBolt });
    }
}

import { Vector3, LinesMesh, CreateLines, CreateTube, Mesh, StandardMaterial, Color3, Space, Axis } from "@babylonjs/core";
import GameObject from "./GameObject";
import Game from "../Game";

export default class LightningBolt extends GameObject {
    isVisible: boolean;
    lightningBolt: Mesh;
    lightningBolt0: LinesMesh;

    constructor(game: Game) {
        super("lightningBolt", game);

        this.lightningBolt0 = this.createLineBolts();
        this.lightningBolt = this.createLightningPoints();
        this.addChild(this.lightningBolt);
        this.addChild(this.lightningBolt0);

        // materials
        const boltMat = new StandardMaterial("mat", this.getScene());
        boltMat.emissiveColor = Color3.White();
        boltMat.diffuseColor = Color3.Yellow();
        this.lightningBolt.material = boltMat;

        const mat = new StandardMaterial("mat", this.getScene());
        mat.emissiveColor = Color3.Yellow();
        this.lightningBolt0.material = mat;

        this.position.y = 2;
        this.setEnabled(false);
        this.isVisible = false;
    }

    public strikeRandomPosition(minX: number, maxX: number, minZ: number, maxZ: number, duration: number) {
        if (!this.isVisible) {
            const x = Math.random() * (maxX - minX) + minX;
            const z = Math.random() * (maxZ - minZ) + minZ;

            this.position.set(x, 0.5, z);
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
        const originalRotation = player.rotationQuaternion.clone();
        player.rotate(Axis.X, Math.PI / 2, Space.LOCAL);

        const intersecting = this.lightningBolt.intersectsMesh(player);

        // Reset the player collision mesh rotation.
        player.rotationQuaternion.copyFrom(originalRotation);

        return intersecting;
    }

    static generateLightningPoints(): Vector3[] {
        const numSegments = 7;
        const yOffset = 6;
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
        this.createLightningPoints();
        this.createLineBolts();
    }
    createLightningPoints(): Mesh {
        const path = LightningBolt.generateLightningPoints();

        return CreateTube("lightningBolt", {
            path, updatable: true, instance: this.lightningBolt,
            tessellation: 8, radius: 0.05,
            sideOrientation: Mesh.FRONTSIDE,
        });
    }

    createLineBolts() {
        const points = LightningBolt.generateLightningPoints();
        return CreateLines("lightningBolt0", { points, updatable: true, instance: this.lightningBolt0 })
    }
}

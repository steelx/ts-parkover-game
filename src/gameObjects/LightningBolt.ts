import { StandardMaterial, Color3, CreateDashedLinesVertexData, Vector3, LinesMesh, Axis, Space } from "@babylonjs/core";
import GameObject from "./GameObject";
import Game from "../Game";
import Player from "./Player";

export default class LightningBolt extends GameObject {
    isVisible: boolean;
    lightningBolt: LinesMesh;

    constructor(game: Game) {
        super("lightningBolt", game);

        const points = [
            new Vector3(0, 0, -1),
            new Vector3(1, 2, 0),
            new Vector3(-1, 4, 0),
        ];

        const lightningBolt = new LinesMesh("lightningBolt", this.getScene());
        const vertexData = CreateDashedLinesVertexData({ points });
        vertexData.applyToMesh(lightningBolt);

        this.lightningBolt = lightningBolt;
        this.addChild(this.lightningBolt);

        const boltMat = new StandardMaterial("boltMat", this.getScene());
        boltMat.emissiveColor = Color3.Yellow();
        boltMat.disableLighting = true;
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

            setTimeout(() => {
                this.setEnabled(false);
                this.isVisible = false;
            }, duration);
        }
    }

    public struckPlayer(player: Player): boolean {
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
}

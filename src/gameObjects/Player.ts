import { Color3, CreateCapsuleVertexData, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Character } from "./types";
import type Game from "../Game";
import GameObject from "./GameObject";
import Ground from "./Ground";

export default class Player extends GameObject implements Character {
    public readonly speed = 15;
    public readonly maxSpeed = 50;
    name: string
    health: number = 100
    moveDirection: Vector3 = Vector3.Zero();

    constructor(name: string, position: Vector3, game: Game) {
        super(name, game)
        this.name = name;
        const vertexData = CreateCapsuleVertexData({ radius: 0.5, subdivisions: 8, tessellation: 8, height: 1.5 });
        vertexData.applyToMesh(this)

        this.position = position;

        const mat = new StandardMaterial("playerMat", game.scene);
        mat.diffuseColor = new Color3(0, 0, 1);
        this.material = mat;
    }

    interact() {
        console.log("Interacting with the main character");
    }

    public isOnGround(): boolean {
        const ground = this.getScene().getMeshByName("ground") as Ground;
        const groundHeight = ground.getGroundHeight(this.position);
        const threshold = 1; // Tolerance for small variations in height
        return Math.abs(this.position.y - groundHeight) <= threshold;
    }

    _dispose(): void {
        this.dispose();
    }
}
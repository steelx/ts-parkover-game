import { Color3, CreateSphereVertexData, PhysicsAggregate, PhysicsShapeType, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Character } from "./types";
import type Game from "../Game";
import GameObject from "./GameObject";
import Ground from "./Ground";

export default class Player extends GameObject implements Character {
    name: string
    health: number = 100
    moveDirection: Vector3 = Vector3.Zero();
    aggregate: PhysicsAggregate;

    constructor(name: string, position: Vector3, game: Game) {
        super(name, game)
        this.name = name;
        const vertexData = CreateSphereVertexData({ diameter: 1, segments: 32 })
        vertexData.applyToMesh(this)

        this.position = position;
        this.aggregate = new PhysicsAggregate(this, PhysicsShapeType.SPHERE, { mass: 1 }, this.getScene());

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
}
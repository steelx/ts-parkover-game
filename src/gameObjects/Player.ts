import { Color3, CreateSphereVertexData, PhysicsImpostor, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Character } from "./types";
import type Game from "../Game";
import GameObject from "./GameObject";

export default class Player extends GameObject implements Character {
    name: string
    moveDirection: Vector3 = Vector3.Zero();

    constructor(name: string, position: Vector3, game: Game) {
        super(name, game)
        this.name = name;
        const vertexData = CreateSphereVertexData({ diameter: 1, segments: 32 })
        vertexData.applyToMesh(this)

        this.position = position;
        this.physicsImpostor = new PhysicsImpostor(this, PhysicsImpostor.SphereImpostor, { mass: 1, friction: 10 }, this.getScene());

        const mat = new StandardMaterial("playerMat", game.scene);
        mat.diffuseColor = Color3.Blue();
        this.material = mat;
    }

    interact() {
        console.log("Interacting with the main character");
    }
}
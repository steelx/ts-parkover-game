import { Color3, CreateBoxVertexData, CreateIcoSphereVertexData, PhysicsImpostor, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Character } from "./types";
import type Game from "../Game";
import GameObject from "./GameObject";

export default class Player extends GameObject implements Character {
    name: string

    constructor(name: string, position: Vector3, game: Game) {
        super(name, game)
        this.name = name;
        const vertexData = CreateIcoSphereVertexData({ radius: 0.5, flat: true, subdivisions: 3 })
        vertexData.applyToMesh(this)

        this.position = position;
        this.physicsImpostor = new PhysicsImpostor(this, PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.2 }, this._scene);

        const mat = new StandardMaterial("playerMaterial", game.scene)
        mat.diffuseColor = Color3.Magenta()
        this.material = mat
    }

    interact() {
        console.log("Interacting with the main character");
    }
}
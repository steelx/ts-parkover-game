import { CreateSphereVertexData, Effect, PhysicsImpostor, ShaderMaterial, Vector3 } from "@babylonjs/core";
import { Character } from "./types";
import type Game from "../Game";
import GameObject from "./GameObject";
import { jellyFragmentShader, jellyVertexShader } from "../shaders/jellyMaterial";

export default class Player extends GameObject implements Character {
    name: string
    moveDirection: Vector3 = Vector3.Zero();

    constructor(name: string, position: Vector3, game: Game) {
        super(name, game)
        this.name = name;
        const vertexData = CreateSphereVertexData({ diameter: 1, segments: 32 })
        vertexData.applyToMesh(this)

        this.position = position;
        this.physicsImpostor = new PhysicsImpostor(this, PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.5 }, this._scene);


        // Jelly Material
        Effect.ShadersStore["jellyVertexShader"] = jellyVertexShader;
        Effect.ShadersStore["jellyFragmentShader"] = jellyFragmentShader;
        const jellyMaterial = new ShaderMaterial("jellyMaterial", game.scene, {
            vertex: "jelly",
            fragment: "jelly",
        }, {
            attributes: ["position", "normal", "uv"],
            uniforms: ["worldViewProjection", "cameraPosition", "time", "moveDirection"],
        });

        jellyMaterial.setVector3("moveDirection", this.moveDirection);
        jellyMaterial.setFloat("time", 0);
        jellyMaterial.setVector3("diffuseColor", new Vector3(1, 0, 1));
        this.material = jellyMaterial;
    }

    interact() {
        console.log("Interacting with the main character");
    }
}
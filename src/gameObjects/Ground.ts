// src/gameObjects/Ground.ts
import { Color3, PhysicsImpostor, StandardMaterial, Vector3, VertexData } from "@babylonjs/core";
import Game from "../Game";
import { createUnevenGround } from "../meshes/unevenGround";
import GameObject from "./GameObject"

export default class Ground extends GameObject {
    constructor(name: string, game: Game) {
        super(name, game)

        const vertexData = createUnevenGround(20, 20, 10);
        vertexData.applyToMesh(this)
        this.flipFaces(true)
        this.position = Vector3.Zero();

        const heightmapData = this.getHeightmapData(vertexData);
        this.physicsImpostor = new PhysicsImpostor(this, PhysicsImpostor.HeightmapImpostor, { mass: 0, restitution: 0.9, heightmapData, friction: 1 }, game.scene);

        const groundMaterial = new StandardMaterial("groundMaterial", game.scene);
        groundMaterial.diffuseColor = Color3.Green();
        this.receiveShadows = true;
        this.material = groundMaterial;
    }

    getHeightmapData(vertexData: VertexData): number[][] {
        const positions = vertexData.positions as number[];
        const subdivisions = Math.sqrt(positions.length / 3) - 1;
        const heightmapData = [];

        for (let z = 0; z <= subdivisions; z++) {
            const row = [];
            for (let x = 0; x <= subdivisions; x++) {
                const index = (x + z * (subdivisions + 1)) * 3;
                const height = positions[index + 1];
                row.push(height);
            }
            heightmapData.push(row);
        }

        return heightmapData;
    }
}
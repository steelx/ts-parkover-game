// src/gameObjects/Ground.ts
import { Color3, PhysicsAggregate, PhysicsShapeType, Ray, StandardMaterial, Vector3, VertexData } from "@babylonjs/core";
import Game from "../Game";
import { createUnevenGround } from "../meshes/unevenGround";
import GameObject from "./GameObject"

export default class Ground extends GameObject {
    aggregate: PhysicsAggregate;
    constructor(game: Game) {
        super("ground", game)

        const vertexData = createUnevenGround(30, 30, 10);
        vertexData.applyToMesh(this)
        this.flipFaces(true)
        this.position = Vector3.Zero();

        // const heightmapData = this.getHeightmapData(vertexData);
        this.aggregate = new PhysicsAggregate(this, PhysicsShapeType.MESH, { mass: 0, restitution: 0.01, friction: 1 }, game.scene);
        // this.aggregate = new PhysicsAggregate(this, PhysicsShapeType.BOX, { mass: 0 }, game.scene);

        const groundMaterial = new StandardMaterial("groundMaterial", game.scene);
        groundMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
        this.receiveShadows = true;
        this.material = groundMaterial;
    }

    getHeightmapData(vertexData: VertexData): number[][] {
        const positions = vertexData.positions!;
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

    public getGroundHeight(position: Vector3): number {
        const ray = new Ray(position.add(new Vector3(0, 100, 0)), new Vector3(0, -1, 0), 200);
        const hit = this.getScene().pickWithRay(ray, (mesh) => mesh.name === "ground");

        if (hit?.pickedPoint) {
            return hit.pickedPoint.y;
        } else {
            return position.y;
        }
    }
}
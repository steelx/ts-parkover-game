// src/meshes/unevenGround.ts

import { VertexData, Vector3 } from "@babylonjs/core";

export function createUnevenGround(width: number, depth: number, subdivisions: number): VertexData {
    const positions: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];

    const stepX = width / subdivisions;
    const stepZ = depth / subdivisions;

    // Generate positions and indices
    for (let z = 0; z <= subdivisions; z++) {
        for (let x = 0; x <= subdivisions; x++) {
            const height = Math.random(); // Replace this with your desired height values
            const position = new Vector3(x * stepX - width / 2, height, z * stepZ - depth / 2);
            positions.push(position.x, position.y, position.z);

            if (x < subdivisions && z < subdivisions) {
                const vertexIndex = x + z * (subdivisions + 1);
                indices.push(vertexIndex, vertexIndex + subdivisions + 1, vertexIndex + 1);
                indices.push(vertexIndex + 1, vertexIndex + subdivisions + 1, vertexIndex + subdivisions + 2);
            }
        }
    }

    // Generate normals
    VertexData.ComputeNormals(positions, indices, normals);

    // Create vertexData object
    const vertexData = new VertexData();
    vertexData.positions = new Float32Array(positions);
    vertexData.indices = indices;
    vertexData.normals = new Float32Array(normals);

    return vertexData;
}

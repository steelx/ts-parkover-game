import { Vector3, VertexData } from "@babylonjs/core";

export function simpleBoxCharacterData(): VertexData {
    const boxSize = new Vector3(0.5, 0.5, 0.5);

    const vertexData = new VertexData();
    vertexData.positions = [
        // Front face
        -boxSize.x, -boxSize.y, boxSize.z,
        boxSize.x, -boxSize.y, boxSize.z,
        boxSize.x, boxSize.y, boxSize.z,
        -boxSize.x, boxSize.y, boxSize.z,

        // Back face
        -boxSize.x, -boxSize.y, -boxSize.z,
        -boxSize.x, boxSize.y, -boxSize.z,
        boxSize.x, boxSize.y, -boxSize.z,
        boxSize.x, -boxSize.y, -boxSize.z,

        // Top face
        -boxSize.x, boxSize.y, -boxSize.z,
        -boxSize.x, boxSize.y, boxSize.z,
        boxSize.x, boxSize.y, boxSize.z,
        boxSize.x, boxSize.y, -boxSize.z,

        // Bottom face
        -boxSize.x, -boxSize.y, -boxSize.z,
        boxSize.x, -boxSize.y, -boxSize.z,
        boxSize.x, -boxSize.y, boxSize.z,
        -boxSize.x, -boxSize.y, boxSize.z,

        // Right face
        boxSize.x, -boxSize.y, -boxSize.z,
        boxSize.x, boxSize.y, -boxSize.z,
        boxSize.x, boxSize.y, boxSize.z,
        boxSize.x, -boxSize.y, boxSize.z,

        // Left face
        -boxSize.x, -boxSize.y, -boxSize.z,
        -boxSize.x, -boxSize.y, boxSize.z,
        -boxSize.x, boxSize.y, boxSize.z,
        -boxSize.x, boxSize.y, -boxSize.z,
    ];
    vertexData.indices = [
        0, 1, 2, 0, 2, 3, // Front face
        4, 5, 6, 4, 6, 7, // Back face
        8, 9, 10, 8, 10, 11, // Top face
        12, 13, 14, 12, 14, 15, // Bottom face
        16, 17, 18, 16, 18, 19, // Right face
        20, 21, 22, 20, 22, 23, // Left face
    ];
    vertexData.normals = [];
    VertexData.ComputeNormals(vertexData.positions, vertexData.indices, vertexData.normals);
    return vertexData;
}


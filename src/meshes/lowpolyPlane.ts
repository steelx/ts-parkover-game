import { VertexData } from "@babylonjs/core";

export function createLowPolyButterfly(): VertexData {
    // Create positions, normals, indices, and uvs for the low poly plane
    const positions = [
        // Body (front to back)
        0, 0, -0.5, // A
        -0.1, 0, 0, // B
        0.1, 0, 0, // C
        0, 0, 0.5, // D

        // Left wing
        -0.1, 0, 0, // E
        -0.5, 0, 0.5, // F

        // Right wing
        0.1, 0, 0, // G
        0.5, 0, 0.5, // H
    ];

    const normals = [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
    ];

    const indices = [
        0, 1, 2,
        1, 3, 2,
        1, 4, 3,
        2, 3, 6,
        3, 5, 4,
        3, 7, 6,
    ];

    const uvs = [
        0.5, 0,
        0, 0.5,
        1, 0.5,
        0.5, 1,
        0, 0.5,
        0, 1,
        1, 0.5,
        1, 1,
    ];

    // Create and apply the vertex data to the mesh
    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.normals = normals;
    vertexData.indices = indices;
    vertexData.uvs = uvs;

    return vertexData;
}

import { Mesh, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders"; // Import the FBX loader

export async function loadBombModel(scene: Scene, parentMesh: Mesh) {

    try {
        const result = await SceneLoader.ImportMeshAsync(null, "./_assets/", "bomb_shading_v005.obj", scene);
        // Scale down the model
        const scalingFactor = 0.01;
        for (const mesh of result.meshes) {
            mesh.scaling = new Vector3(scalingFactor, scalingFactor, scalingFactor);
            mesh.parent = parentMesh;
        }
    } catch (error) {
        console.error("Failed to load model:", error);
    }
};
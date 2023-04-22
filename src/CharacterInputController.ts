import { Scene, UniversalCamera, Vector3, KeyboardEventTypes, ShaderMaterial, float } from "@babylonjs/core";
import Game from "./Game";
import Player from "./gameObjects/Player";

export default class CharacterInputController {
    scene: Scene;
    camera: UniversalCamera;
    inputMap: any;
    time: float = 0;

    constructor(private character: Player, game: Game) {
        this.scene = game.scene;
        this.camera = game.scene.getCameraByName("camera") as UniversalCamera;
        this.inputMap = {};

        this.setupInput();
    }

    setupInput() {
        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    this.inputMap[kbInfo.event.key] = true;
                    break;
                case KeyboardEventTypes.KEYUP:
                    this.inputMap[kbInfo.event.key] = false;
                    break;
            }
        });

        let lastUpdateTime = performance.now();
        this.scene.onBeforeRenderObservable.add(() => {
            const currentTime = performance.now();
            const elapsedTime = currentTime - lastUpdateTime;
            const moveSpeed = 0.005 * elapsedTime;
            const strafeJumpSpeed = 5;
            this.time += elapsedTime * 0.001;

            if (this.inputMap["w"] || this.inputMap["W"]) {
                // this.character.moveWithCollisions(this.camera.getDirection(new Vector3(0, 0, 1)).scale(moveSpeed));
                this.character
                    .physicsImpostor?.applyImpulse(
                        this.camera.getDirection(new Vector3(0, 0, 1)).scale(moveSpeed),
                        this.character.getAbsolutePosition()
                    );
            }
            if (this.inputMap["s"] || this.inputMap["S"]) {
                // this.character.moveWithCollisions(this.camera.getDirection(new Vector3(0, 0, -1)).scale(moveSpeed));
                this.character
                    .physicsImpostor?.applyImpulse(
                        this.camera.getDirection(new Vector3(0, 0, -1)).scale(moveSpeed),
                        this.character.getAbsolutePosition()
                    );
            }
            if (this.inputMap["a"] || this.inputMap["A"]) {
                // this.character.moveWithCollisions(this.camera.getDirection(new Vector3(-1, 0, 0)).scale(moveSpeed));
                this.character
                    .physicsImpostor?.applyImpulse(
                        this.camera.getDirection(new Vector3(0, 0, 1)).scale(moveSpeed),
                        this.character.getAbsolutePosition()
                    );
            }
            if (this.inputMap["d"] || this.inputMap["D"]) {
                // this.character.moveWithCollisions(this.camera.getDirection(new Vector3(1, 0, 0)).scale(moveSpeed));
                this.character
                    .physicsImpostor?.applyImpulse(
                        this.camera.getDirection(new Vector3(1, 0, 0)).scale(moveSpeed),
                        this.character.getAbsolutePosition()
                    );
            }

            if (this.inputMap[" "]) { // Space key for strafe jump
                const jumpImpulse = new Vector3(0, strafeJumpSpeed, 0);
                this.character.physicsImpostor?.applyImpulse(jumpImpulse, this.character.getAbsolutePosition());
                this.inputMap[" "] = false;
            }


            // Update shader time and moveDirection uniforms
            this.character.moveDirection = this.camera.getDirection(new Vector3(0, 0, 1)).scale(moveSpeed);
            const jellyMaterial = this.character.material as ShaderMaterial;
            jellyMaterial.setFloat("time", this.time);
            jellyMaterial.setVector3("moveDirection", this.character.moveDirection);

            // Reset the moveDirection vector
            this.character.moveDirection = Vector3.Zero();
            lastUpdateTime = currentTime;
        });
    }
}

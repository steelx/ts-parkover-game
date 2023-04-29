import { Scene, ArcFollowCamera, Vector3, KeyboardEventTypes } from "@babylonjs/core";
import Game from "./Game";
import Player from "./gameObjects/Player";
import CharacterMovement from "./CharacterMovement";

export default class CharacterInputController {
    scene: Scene;
    readonly camera: ArcFollowCamera;
    inputMap: any;
    characterMovement: CharacterMovement;

    constructor(private character: Player, game: Game) {
        this.scene = game.scene;
        this.camera = game.scene.getCameraByName("camera") as ArcFollowCamera;
        this.inputMap = {};
        this.characterMovement = new CharacterMovement(character, this.scene);

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
            const moveSpeed = this.character.speed * elapsedTime;
            const strafeJumpSpeed = 5;

            const cameraDirection = this.camera.target.subtract(this.camera.position).normalize().multiplyByFloats(1, 0, 1).normalize();

            if (this.inputMap["w"] || this.inputMap["W"]) {
                this.characterMovement.move(cameraDirection.scale(moveSpeed));
            }
            if (this.inputMap["s"] || this.inputMap["S"]) {
                this.characterMovement.move(cameraDirection.scale(-moveSpeed));
            }
            if (this.inputMap["a"] || this.inputMap["A"]) {
                const leftDirection = Vector3.Cross(this.camera.upVector, cameraDirection).normalize();
                this.characterMovement.move(leftDirection.scale(-moveSpeed));
            }
            if (this.inputMap["d"] || this.inputMap["D"]) {
                const rightDirection = Vector3.Cross(this.camera.upVector, cameraDirection).normalize();
                this.characterMovement.move(rightDirection.scale(moveSpeed));
            }

            if (this.inputMap[" "]) { // Space key for strafe jump
                const jumpImpulse = new Vector3(0, strafeJumpSpeed, 0);
                this.characterMovement.jump(jumpImpulse);
                this.inputMap[" "] = false;
            }

            const gravity = this.characterMovement.getGravityOffset(elapsedTime * 0.001);
            this.characterMovement.handleGroundCollision(gravity);

            lastUpdateTime = currentTime;
        });
    }
}

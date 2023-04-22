import { Scene, ArcFollowCamera, Vector3, KeyboardEventTypes, float } from "@babylonjs/core";
import Game from "./Game";
import Player from "./gameObjects/Player";

const STOP_FORCE_KEY: string = "f";
export default class CharacterInputController {
    scene: Scene;
    readonly camera: ArcFollowCamera;
    inputMap: any;
    time: float = 0;
    private forceApplied: boolean = false;

    constructor(private character: Player, game: Game) {
        this.scene = game.scene;
        this.camera = game.scene.getCameraByName("camera") as ArcFollowCamera;
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

            if (this.inputMap[STOP_FORCE_KEY]) { // key to stop movement
                this.character.aggregate.body.setLinearVelocity(Vector3.Zero());
                this.character.aggregate.body.setAngularVelocity(Vector3.Zero());
            }
        });

        let lastUpdateTime = performance.now();
        this.scene.onBeforeRenderObservable.add(() => {
            const currentTime = performance.now();
            const elapsedTime = currentTime - lastUpdateTime;
            const moveSpeed = 0.025 * elapsedTime;
            const strafeJumpSpeed = 5;
            this.time += elapsedTime * 0.001;
            this.character.moveDirection = this.camera.getDirection(new Vector3(0, 0, 1)).scale(moveSpeed);

            // Apply force only while keys are pressed
            this.forceApplied = false;

            const cameraDirection = this.camera.target.subtract(this.camera.position).normalize().multiplyByFloats(1, 0, 1).normalize();

            if (this.inputMap["w"] || this.inputMap["W"]) {
                this.applyForce(cameraDirection.scale(moveSpeed));
            }
            if (this.inputMap["s"] || this.inputMap["S"]) {
                this.applyForce(cameraDirection.scale(-moveSpeed));
            }
            if (this.inputMap["a"] || this.inputMap["A"]) {
                const leftDirection = Vector3.Cross(this.camera.upVector, cameraDirection).normalize();
                this.applyForce(leftDirection.scale(-moveSpeed));
            }
            if (this.inputMap["d"] || this.inputMap["D"]) {
                const rightDirection = Vector3.Cross(this.camera.upVector, cameraDirection).normalize();
                this.applyForce(rightDirection.scale(moveSpeed));
            }

            if (this.inputMap[" "]) { // Space key for strafe jump
                const jumpImpulse = new Vector3(0, strafeJumpSpeed, 0);
                this.applyForce(jumpImpulse)
                this.inputMap[" "] = false;
            }

            if (!this.forceApplied) {
                this.character.moveDirection = Vector3.Zero();
            }

            // Reset the moveDirection vector
            this.character.moveDirection = Vector3.Zero();
            lastUpdateTime = currentTime;
        });
    }

    private applyForce(force: Vector3) {
        if (this.character.aggregate) {
            this.character.aggregate.body.applyImpulse(force, this.character.getAbsolutePosition());
            this.character.moveDirection.addInPlace(force);
            this.forceApplied = true;
        }
    }
}

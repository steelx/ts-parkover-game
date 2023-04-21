import { Scene, UniversalCamera, Vector3, KeyboardEventTypes } from "@babylonjs/core";
import GameObject from "./gameObjects/GameObject";
import Game from "./Game";

export default class CharacterInputController {
    scene: Scene;
    camera: UniversalCamera;
    inputMap: any;

    constructor(private character: GameObject, game: Game) {
        this.scene = game.scene;
        this.camera = game.scene.getCameraByName("camera") as UniversalCamera;
        this.camera.setTarget(character.position);
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

        this.scene.onBeforeRenderObservable.add(() => {
            const deltaTimeInMillis = this.scene.getEngine().getDeltaTime();
            const moveSpeed = 0.005 * deltaTimeInMillis;
            const strafeJumpSpeed = 5;

            if (this.inputMap["w"] || this.inputMap["W"]) {
                this.character.moveWithCollisions(this.camera.getDirection(new Vector3(0, 0, 1)).scale(moveSpeed));
                // this.character
                //     .physicsImpostor?.applyImpulse(
                //         this.camera.getDirection(new Vector3(0, 0, 1)).scale(moveSpeed),
                //         this.character.getAbsolutePosition()
                //     );
            }
            if (this.inputMap["s"] || this.inputMap["S"]) {
                this.character.moveWithCollisions(this.camera.getDirection(new Vector3(0, 0, -1)).scale(moveSpeed));
            }
            if (this.inputMap["a"] || this.inputMap["A"]) {
                this.character.moveWithCollisions(this.camera.getDirection(new Vector3(-1, 0, 0)).scale(moveSpeed));
            }
            if (this.inputMap["d"] || this.inputMap["D"]) {
                this.character.moveWithCollisions(this.camera.getDirection(new Vector3(1, 0, 0)).scale(moveSpeed));
            }

            if (this.inputMap[" "]) { // Space key for strafe jump
                const jumpImpulse = new Vector3(0, strafeJumpSpeed, 0);
                this.character.physicsImpostor?.applyImpulse(jumpImpulse, this.character.getAbsolutePosition());
                this.inputMap[" "] = false;
            }
        });
    }
}

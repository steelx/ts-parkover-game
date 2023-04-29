import { Scene, Vector3, Ray, AbstractMesh } from "@babylonjs/core";
import GameObject from "./gameObjects/GameObject";

export default class CharacterMovement {
    private gravity: number = -9.81;

    constructor(private character: GameObject, private scene: Scene) { }

    move(direction: Vector3) {
        this.character.position.addInPlace(direction);
    }

    jump(jumpImpulse: Vector3) {
        const [isOnGround] = this.getIsOnGround();
        if (isOnGround) {
            this.character.position.addInPlace(jumpImpulse);
        }
    }

    getIsOnGround(): [boolean, number] {
        const origin = this.character.position.clone();
        const direction = new Vector3(0, -1, 0);
        const length = 1.1;
        const ray = new Ray(origin, direction, length);

        // AbstractMesh is a base class for all Mesh types in Babylon.js which extend AbractMesh
        const predicate = (mesh: AbstractMesh) => {
            return mesh !== this.character;
        };

        const hit = this.scene.pickWithRay(ray, predicate);

        const isOnGround = hit !== null && hit.hit;
        const hitDistance = hit?.distance ?? 0;

        return [isOnGround, hitDistance]
    }

    getGravityOffset(deltaTime: number): number {
        const [isOnGround] = this.getIsOnGround();
        return !isOnGround ? this.gravity * deltaTime : 0;
    }

    handleGroundCollision(gravityOffset: number) {
        const [isOnGround, hitDistance] = this.getIsOnGround();

        if (isOnGround) {
            const halfPlayerHeight = 0.5;
            const distanceToGround = hitDistance - halfPlayerHeight;

            // If the distance to the ground is positive, move the character down
            // If the distance to the ground is negative, move the character up
            this.character.position.y -= distanceToGround;
        } else {
            this.character.position.y += gravityOffset;
        }
    }
}

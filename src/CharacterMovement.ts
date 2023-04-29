import { Scene, Vector3, Ray, AbstractMesh } from "@babylonjs/core";
import GameObject from "./gameObjects/GameObject";
import Ground from "./gameObjects/Ground";

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
        if (!isOnGround) {
            return this.gravity * deltaTime;
        } else {
            return 0;
        }
    }

    handleGroundCollision(gravityOffset: number) {
        const [isOnGround, hitDistance] = this.getIsOnGround();

        if (isOnGround) {
            const distanceToGround = hitDistance - 1; // Subtract 1 since that's the length of the ray

            if (distanceToGround > 0.1) {
                // If the distance to the ground is more than 0.1, move the character down
                this.character.position.y -= distanceToGround;
            } else if (distanceToGround < -0.1) {
                // If the distance to the ground is less than -0.1, move the character up
                this.character.position.y += Math.abs(distanceToGround);
            }
        } else {
            this.character.position.y += gravityOffset;
        }
    }
}

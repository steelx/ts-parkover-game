import {
    StandardMaterial, Color3, SphereParticleEmitter, ParticleSystem,
    Texture, Vector3, Quaternion,
    Animation, CreateCapsuleVertexData, ActionManager, ExecuteCodeAction, CircleEase, Matrix, PhysicsAggregate, PhysicsShapeType
} from "@babylonjs/core";
import Game from "../Game";
import GameObject from "./GameObject";
import Ground from "./Ground";

export default class HomingMissile extends GameObject {
    explosionParticleSystem: ParticleSystem;
    private _collisionTriggered: boolean;
    private _timer: number;
    aggregate: PhysicsAggregate;

    constructor(pos: Vector3, game: Game, explosionTime: number) {
        super("homingMissile", game);

        // Create a mesh
        const vertexData = CreateCapsuleVertexData({ radius: 0.1, capSubdivisions: 1, height: 1.2, tessellation: 4, topCapSubdivisions: 8 });
        vertexData.applyToMesh(this, true);

        // Set plane material
        const mat = new StandardMaterial("planeMaterial", this.getScene());
        mat.diffuseColor = Color3.Red();
        this.material = mat;
        Game.shadowGenerator.addShadowCaster(this);

        // Create an explosion particle system
        this.explosionParticleSystem = this.createExplosionParticleSystem();

        this.position = pos;
        this.rotationQuaternion = Quaternion.RotationYawPitchRoll(0, Math.PI / 2, 0);
        this.aggregate = new PhysicsAggregate(this, PhysicsShapeType.CAPSULE, { mass: 2, friction: 0, mesh: this }, this.getScene());
        this.targetLockPhysics(game.player!);

        // Set a timer for the plane to explode
        this._collisionTriggered = false;

        // Set a timer for the plane to explode
        this._timer = setTimeout(() => {
            this.explode();
        }, explosionTime);

        // Detect collision with the player
        this.actionManager = new ActionManager(this.getScene());
        this.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: game.player,
                },
                () => {
                    console.log('its a hit!');

                    this._collisionTriggered = true;
                    window.clearTimeout(this._timer);
                    this.explode();
                }
            )
        );
    }

    explode() {
        if (!this._collisionTriggered) {
            clearTimeout(this._timer);
        }
        // Trigger the explosion particle system
        this.isVisible = false;
        this.explosionParticleSystem.start();

        // Dispose the plane after the explosion
        setTimeout(() => {
            this.explosionParticleSystem.dispose();
            this.dispose();
        }, this.explosionParticleSystem.maxLifeTime * 1000);
    }

    private createExplosionParticleSystem(): ParticleSystem {
        const explosionParticleSystem = new ParticleSystem("explosionParticles", 2000, this.getScene());
        explosionParticleSystem.particleTexture = new Texture("./_assets/flare-red.png", this.getScene());
        explosionParticleSystem.emitter = this;
        explosionParticleSystem.minEmitBox = new Vector3(-1, 0, -1);
        explosionParticleSystem.maxEmitBox = new Vector3(1, 0, 1);
        explosionParticleSystem.direction1 = new Vector3(-1, 1, -1);
        explosionParticleSystem.direction2 = new Vector3(1, 1, 1);
        explosionParticleSystem.minLifeTime = 0.3;
        explosionParticleSystem.maxLifeTime = 1;
        explosionParticleSystem.minSize = 0.1;
        explosionParticleSystem.maxSize = 0.5;
        explosionParticleSystem.emitRate = 500;
        explosionParticleSystem.manualEmitCount = 2000;
        explosionParticleSystem.blendMode = ParticleSystem.BLENDMODE_STANDARD;

        const sphereEmitter = new SphereParticleEmitter(0.5);
        explosionParticleSystem.particleEmitterType = sphereEmitter;
        return explosionParticleSystem;
    }

    targetLock(player: GameObject) {
        const playerPosition = player.position.clone();

        // Move the pivot point to the base of the cylinder
        const pivotMatrix = Matrix.Translation(0, -1, 0);
        this.setPivotMatrix(pivotMatrix);

        // Create a quaternion representing a 90-degree pitch rotation
        const pitch = Math.PI / 2; // 90 degrees in radians
        const yaw = Math.PI / 2; // 90 degrees in radians
        const roll = 0;
        const rotationQuaternion = Quaternion.RotationYawPitchRoll(yaw, pitch, roll);


        // Assign the quaternion to the cylinder's rotationQuaternion property
        this.rotationQuaternion = rotationQuaternion;

        // Define animation for position
        const positionAnimation = new Animation("positionAnimation", "position", 100, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        const [a, b, c] = this.getMissilePath(playerPosition)
        this.lookAt(b);
        // Define position keyframes
        const positionKeys = [
            { frame: 0, value: a },
            { frame: 25, value: b.add(new Vector3(1, -3, 0)) },
            { frame: 50, value: b },
            { frame: 75, value: b.add(new Vector3(-1, -3, 0)) },
            { frame: 100, value: c },
        ];

        // Assign keyframes to position animation
        positionAnimation.setKeys(positionKeys);

        // Define easing function for curved path
        const easingFunction = new CircleEase();
        positionAnimation.setEasingFunction(easingFunction);

        // Define animation for rotation
        const rotationAnimation = new Animation("rotationAnimation", "rotationQuaternion", 100, Animation.ANIMATIONTYPE_QUATERNION, Animation.ANIMATIONLOOPMODE_CONSTANT);

        // Define rotation keyframes
        const rotationKeys = [
            { frame: 0, value: rotationQuaternion },
            { frame: 25, value: Quaternion.RotationYawPitchRoll(yaw, pitch + Math.PI / 2, roll) },
            { frame: 50, value: Quaternion.RotationYawPitchRoll(yaw, pitch + Math.PI, roll) },
            { frame: 75, value: Quaternion.RotationYawPitchRoll(yaw, pitch + 1.5 * Math.PI, roll) },
            { frame: 100, value: Quaternion.RotationYawPitchRoll(yaw, pitch + 2 * Math.PI, roll) },
        ];

        // Assign keyframes to rotation animation
        rotationAnimation.setKeys(rotationKeys);

        this.getScene().beginDirectAnimation(this, [positionAnimation, rotationAnimation], 0, 100, false);
    }

    targetLockPhysics(player: GameObject) {
        const followSpeed = 20;
        const targetHeight = 2;

        // remove gravity from Mesh body
        this.aggregate.body.setLinearVelocity(new Vector3(0, -1, 0));

        this.getScene().onBeforeRenderObservable.add(() => {
            if (!this.isDisposed() && this.aggregate.body) {
                // change capsule Pivot to the head of the capsule

                // head/face the direction of the velocity

            }
        });

        this.getScene().registerBeforeRender(() => {
            if (!this.isDisposed() && this.aggregate.body) {
                const ground = this.getScene().getMeshByName("ground") as Ground;
                const groundHeight = ground.getGroundHeight(this.position);
                this.position.y = targetHeight;

                const playerPositionWithGroundHeight = player.position.clone();
                playerPositionWithGroundHeight.y = groundHeight;

                const direction = playerPositionWithGroundHeight.subtract(this.position).normalize();
                const force = direction.scale(followSpeed);
                this.aggregate.body.applyForce(force, this.aggregate.body.computeMassProperties().centerOfMass!);

                // Align plane with the direction of the force
                const forward = new Vector3(0, 0, 1);
                const directionFlat = new Vector3(direction.x, 0, direction.z);

                const angleBetween = Math.acos(Vector3.Dot(forward, directionFlat.normalize()));
                const rotationAxis = Vector3.Cross(forward, directionFlat).normalize();
                const q = Quaternion.RotationAxis(rotationAxis, angleBetween);
                this.rotationQuaternion = q;
            }
        });
    }


    getMissilePath(destination: Vector3) {
        const initialPosition = this.position.clone(); // starting position

        // Calculate median position between initial and final positions
        const medianPosition = Vector3.Lerp(initialPosition, destination, 0.5);
        return [initialPosition, medianPosition, destination]
    }

}

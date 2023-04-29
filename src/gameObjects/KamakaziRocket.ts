import { StandardMaterial, Color3, SphereParticleEmitter, ParticleSystem, Texture, Vector3, PhysicsAggregate, PhysicsShapeType, Quaternion, MeshBuilder, PhysicsMotionType, CreateCapsuleVertexData, ActionManager, ExecuteCodeAction, Matrix, BoxParticleEmitter, Particle } from "@babylonjs/core";
import Game from "../Game";
import GameObject from "./GameObject";
import Ground from "./Ground";

export default class KamakaziRocket extends GameObject {
    aggregate: PhysicsAggregate;
    explosionParticleSystem: ParticleSystem;
    _smokeTrailParticleSystem: ParticleSystem;
    _collisionTriggered: boolean;
    _timer: number;

    constructor(pos: Vector3, game: Game, explosionTime: number) {
        super("kamakaziRocket", game);

        // Create a mesh
        const vertexData = CreateCapsuleVertexData({ radius: 0.2, capSubdivisions: 1, height: 0.75, tessellation: 8, topCapSubdivisions: 12 });
        vertexData.applyToMesh(this, true);

        // Set plane material
        const mat = new StandardMaterial("planeMaterial", this.getScene());
        mat.diffuseColor = Color3.Black();
        this.material = mat;
        Game.shadowGenerator.addShadowCaster(this);

        // Create an explosion particle system
        this.explosionParticleSystem = this.createExplosionParticleSystem();
        this._smokeTrailParticleSystem = this.createSmokeTrailParticleSystem();

        this.position = pos;
        this.aggregate = new PhysicsAggregate(this, PhysicsShapeType.CAPSULE, { mass: 1, friction: 0, mesh: this }, this.getScene());

        this.followPlayer(game.player!);

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
                    parameter: game.player!,
                },
                () => {
                    console.log('Kaboom!');

                    this._collisionTriggered = true;
                    clearTimeout(this._timer);
                    this.explode();
                }
            )
        );
    }

    followPlayer(player: GameObject) {
        const speed = 20;
        const maxSpeed = 10;
        const targetHeight = 1;

        // Move the pivot point to the base of the cylinder
        const pivotMatrix = Matrix.Translation(0, 0, 0);
        this.setPivotMatrix(pivotMatrix);

        this.getScene().onBeforeRenderObservable.add(() => {
            if (!this.isDisposed() && this.aggregate.body) {
                this.lookAt(player.position);
                this._smokeTrailParticleSystem.start();

                // rotate the body to face the direction of the velocity
                const velocity = new Vector3()
                this.aggregate.body.getLinearVelocityToRef(velocity);

                if (velocity.length() > 0) {
                    // Create a quaternion representing a 90-degree pitch rotation
                    const pitch = 90 * Math.PI / 180; // 90 degrees in radians
                    const yaw = 0;
                    const roll = 0;
                    const rotationQuaternion = Quaternion.RotationYawPitchRoll(yaw, pitch, roll);

                    // Assign the quaternion to the cylinder's rotationQuaternion property
                    this.rotationQuaternion = rotationQuaternion;
                }

            }
        });

        this.getScene().registerBeforeRender(() => {
            if (!this.isDisposed() && this.aggregate.body) {
                const ground = this.getScene().getMeshByName("ground") as Ground;
                const groundHeight = ground.getGroundHeight(this.position);
                this.position.y = targetHeight + groundHeight;

                const playerPositionWithGroundHeight = player.position.clone();
                playerPositionWithGroundHeight.y = groundHeight;

                const direction = playerPositionWithGroundHeight.subtract(this.position).normalize();
                const force = direction.scale(speed);
                this.aggregate.body.applyForce(force, this.aggregate.body.computeMassProperties().centerOfMass!);

                // Align plane with the direction of the force
                const forward = new Vector3(0, 0, 1); // Forward direction
                const directionFlat = new Vector3(direction.x, 0, direction.z);

                // Calculate rotation quaternion between forward direction and the projected direction
                const angleBetween = Math.acos(Vector3.Dot(forward, directionFlat.normalize()));
                const rotationAxis = Vector3.Cross(forward, directionFlat).normalize();
                const q = Quaternion.RotationAxis(rotationAxis, angleBetween);
                this.rotationQuaternion = Quaternion.Slerp(this.rotationQuaternion!, q, 0.1); // Smooth rotation


                // Check if the rocket's speed exceeds the maximum allowed speed
                const currentSpeed = new Vector3()
                this.aggregate.body.getLinearVelocityToRef(currentSpeed);
                if (currentSpeed.length() > maxSpeed) {
                    // If the speed is too high, normalize the velocity and scale it to the maximum allowed speed
                    const clampedVelocity = currentSpeed.normalize().scale(maxSpeed);
                    this.aggregate.body.setLinearVelocity(clampedVelocity);
                }
            }
        });
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

    private createSmokeTrailParticleSystem(): ParticleSystem {
        const smokeTrailParticleSystem = new ParticleSystem("smokeTrailParticles", 2000, this.getScene());
        smokeTrailParticleSystem.particleTexture = new Texture("https://www.babylonjs-playground.com/textures/flare.png", this.getScene());
        smokeTrailParticleSystem.emitter = this;
        smokeTrailParticleSystem.minEmitBox = new Vector3(0, 0, -0.5);
        smokeTrailParticleSystem.maxEmitBox = new Vector3(0, 0, -1.5);
        smokeTrailParticleSystem.direction1 = new Vector3(-0.5, 0.5, -0.5);
        smokeTrailParticleSystem.direction2 = new Vector3(0.5, 0.5, 0.5);
        smokeTrailParticleSystem.minLifeTime = 0.5;
        smokeTrailParticleSystem.maxLifeTime = 1.5;
        smokeTrailParticleSystem.minSize = 0.05;
        smokeTrailParticleSystem.maxSize = 0.1;
        smokeTrailParticleSystem.emitRate = 50;
        smokeTrailParticleSystem.gravity = new Vector3(0, -9.81, 0);
        smokeTrailParticleSystem.blendMode = ParticleSystem.BLENDMODE_STANDARD;

        const boxEmitter = new BoxParticleEmitter();

        /**
         * startDirectionFunction:
         * By assigning your custom startDirectionFunction to the boxEmitter,
         * the particle system will use it automatically when needed.
         * You don't need to call it yourself with arguments in the code.
        */
        boxEmitter.startDirectionFunction = (worldMatrix: Matrix, directionToUpdate: Vector3, particle: Particle, isLocal: boolean): void => {
            // Calculate a random direction with components between -0.5 and 0.5
            const randX = Math.random() - 0.5;
            const randY = Math.random() - 0.5;
            const randZ = Math.random() - 0.5;

            // Set the direction using the random components
            directionToUpdate.copyFromFloats(randX, randY, randZ);

            // Apply the world matrix if necessary
            if (!isLocal) {
                Vector3.TransformNormalToRef(directionToUpdate, worldMatrix, directionToUpdate);
            }
        };
        smokeTrailParticleSystem.particleEmitterType = boxEmitter;

        return smokeTrailParticleSystem;
    }

}

import { StandardMaterial, Color3, SphereParticleEmitter, ParticleSystem, Texture, Vector3, PhysicsAggregate, PhysicsShapeType, Quaternion, MeshBuilder, PhysicsMotionType, CreateCapsuleVertexData, ActionManager, ExecuteCodeAction, Matrix } from "@babylonjs/core";
import Game from "../Game";
import GameObject from "./GameObject";
import Ground from "./Ground";

export default class KamakaziRocket extends GameObject {
    aggregate: PhysicsAggregate;
    explosionParticleSystem: ParticleSystem;
    private _collisionTriggered: boolean;
    private _timer: number;

    constructor(pos: Vector3, game: Game, explosionTime: number) {
        super("kamakaziRocket", game);

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
        this.aggregate = new PhysicsAggregate(this, PhysicsShapeType.MESH, { mass: 2, friction: 0, mesh: this }, this.getScene());

        // Lock Y movement and Y rotation
        // this.aggregate.body.setAngularVelocity(new Vector3(0.5, 0.5, 0.5));

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
                    parameter: game.player,
                },
                () => {
                    this._collisionTriggered = true;
                    window.clearTimeout(this._timer);
                    this.explode();
                }
            )
        );
    }

    followPlayer(player: GameObject) {
        const followSpeed = 20;
        const targetHeight = 2;

        // remove gravity from Mesh body
        this.aggregate.body.setLinearVelocity(new Vector3(0, -1, 0));

        this.getScene().onBeforeRenderObservable.add(() => {
            if (!this.isDisposed() && this.aggregate.body) {

                // rotate the body to face the direction of the velocity
                const velocity = new Vector3()
                this.aggregate.body.getLinearVelocityToRef(velocity);
                if (velocity.length() > 0.1) {
                    // Create a quaternion representing a 90-degree pitch rotation
                    const pitch = Math.PI / 2; // 90 degrees in radians
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
                this.position.y = targetHeight;

                const playerPositionWithGroundHeight = player.position.clone();
                playerPositionWithGroundHeight.y = groundHeight;

                const direction = playerPositionWithGroundHeight.subtract(this.position).normalize();
                const force = direction.scale(followSpeed);
                this.aggregate.body.applyForce(force, this.aggregate.body.computeMassProperties().centerOfMass!);

                // Align plane with the direction of the force
                const forward = new Vector3(0, 0, 1); // Forward direction
                const directionFlat = new Vector3(direction.x, 0, direction.z); // Direction projected on XZ plane

                // Calculate rotation quaternion between forward direction and the projected direction
                const angleBetween = Math.acos(Vector3.Dot(forward, directionFlat.normalize()));
                const rotationAxis = Vector3.Cross(forward, directionFlat).normalize();
                const q = Quaternion.RotationAxis(rotationAxis, angleBetween);
                this.rotationQuaternion = Quaternion.Slerp(this.rotationQuaternion!, q, 0.1); // Smooth rotation
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

}

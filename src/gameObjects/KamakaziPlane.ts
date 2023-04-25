import { StandardMaterial, Color3, SphereParticleEmitter, ParticleSystem, Texture, Vector3, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";
import Game from "../Game";
import GameObject from "./GameObject";
import Ground from "./Ground";
import { createLowPolyPlaneMesh } from "../meshes/lowpolyPlane";

export default class KamakaziPlane extends GameObject {
    aggregate: PhysicsAggregate;
    explosionParticleSystem: ParticleSystem;

    constructor(pos: Vector3, game: Game, explosionTime: number) {
        super("explosiveSphere", game);

        // Create a plane
        const plane = createLowPolyPlaneMesh();
        plane.applyToMesh(this, true);

        // Set sphere material
        const mat = new StandardMaterial("planeMaterial", this.getScene());
        mat.diffuseColor = Color3.Red();
        this.material = mat;
        Game.shadowGenerator.addShadowCaster(this);

        // Create an explosion particle system
        this.explosionParticleSystem = this.createExplosionParticleSystem();

        this.position = pos;
        this.aggregate = new PhysicsAggregate(this, PhysicsShapeType.MESH, { mass: 1, friction: 0, mesh: this }, this.getScene());

        // Lock Y movement and Y rotation
        this.aggregate.body.setAngularVelocity(new Vector3(1, 1, 0));
        // this.aggregate.body.setLinearVelocity(new Vector3(1, -1, 1));

        this.followPlayer(game.player!);

        // Set a timer for the sphere to explode
        setTimeout(() => {
            this.explode();
        }, explosionTime);
    }

    followPlayer(player: GameObject) {
        const followSpeed = 10;


        this.getScene().registerBeforeRender(() => {
            if (!this.isDisposed() && this.aggregate.body) {
                const ground = this.getScene().getMeshByName("ground") as Ground;
                const groundHeight = ground.getGroundHeight(player.position);
                const playerPositionWithGroundHeight = player.position.clone();
                playerPositionWithGroundHeight.y = groundHeight;

                const direction = playerPositionWithGroundHeight.subtract(this.position).normalize();
                const force = direction.scale(followSpeed);
                this.aggregate.body.applyForce(force, this.aggregate.body.computeMassProperties().centerOfMass!);
            }
        });
    }

    explode() {
        // Trigger the explosion particle system
        this.explosionParticleSystem.start();

        // Dispose the sphere after the explosion
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
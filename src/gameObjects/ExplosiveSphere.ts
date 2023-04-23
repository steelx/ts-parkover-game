import { MeshBuilder, StandardMaterial, Color3, SphereParticleEmitter, ParticleSystem, Texture, Vector3, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";
import Game from "../Game";
import GameObject from "./GameObject";

export default class ExplosiveSphere extends GameObject {
    aggregate: PhysicsAggregate;
    explosionParticleSystem: ParticleSystem;

    constructor(pos: Vector3, game: Game, explosionTime: number) {
        super("explosiveSphere", game);

        // Create a sphere
        const sphere = MeshBuilder.CreateSphere("explosiveSphereMesh", { diameter: 0.5 }, this.getScene());
        this.addChild(sphere);

        // Set sphere material
        const sphereMaterial = new StandardMaterial("sphereMaterial", this.getScene());
        sphereMaterial.diffuseColor = Color3.Red();
        sphere.material = sphereMaterial;

        // Create an explosion particle system
        this.explosionParticleSystem = this.createExplosionParticleSystem();

        this.position = pos;
        this.aggregate = new PhysicsAggregate(this, PhysicsShapeType.SPHERE, { mass: 1, friction: 1 }, this.getScene());
        // Apply an impulse to roll the sphere towards player
        const force = new Vector3(0, 0, 5);
        this.aggregate.body.applyImpulse(force, game.player?.position, this.getAbsolutePosition());

        // Set a timer for the sphere to explode
        setTimeout(() => {
            this.explode();
        }, explosionTime);
    }

    explode() {
        // Trigger the explosion particle system
        this.explosionParticleSystem.start();

        // Disable the sphere after the explosion
        // this.setEnabled(false);

        // Dispose the sphere after the explosion
        setTimeout(() => {
            this.explosionParticleSystem.dispose();
            this.dispose();
        }, this.explosionParticleSystem.maxLifeTime * 1000);
    }

    private createExplosionParticleSystem(): ParticleSystem {
        const explosionParticleSystem = new ParticleSystem("explosionParticles", 2000, this.getScene());
        explosionParticleSystem.particleTexture = new Texture("textures/flare.png", this.getScene());
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

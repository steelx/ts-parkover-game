import { Color3, CreateSphereVertexData, PhysicsAggregate, PhysicsShapeType, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Character } from "./types";
import type Game from "../Game";
import GameObject from "./GameObject";
import Ground from "./Ground";

export default class Player extends GameObject implements Character {
    name: string
    health: number = 100
    moveDirection: Vector3 = Vector3.Zero();
    aggregate: PhysicsAggregate;

    constructor(name: string, position: Vector3, game: Game) {
        super(name, game)
        this.name = name;
        const vertexData = CreateSphereVertexData({ diameter: 1, segments: 32 })
        vertexData.applyToMesh(this)

        this.position = position;
        this.aggregate = new PhysicsAggregate(this, PhysicsShapeType.SPHERE, { mass: 1 }, this.getScene());
        this.initPhysics();

        const mat = new StandardMaterial("playerMat", game.scene);
        mat.diffuseColor = new Color3(0, 0, 1);
        this.material = mat;
    }

    interact() {
        console.log("Interacting with the main character");
    }

    public isOnGround(): boolean {
        const ground = this.getScene().getMeshByName("ground") as Ground;
        const groundHeight = ground.getGroundHeight(this.position);
        const threshold = 1; // Tolerance for small variations in height
        return Math.abs(this.position.y - groundHeight) <= threshold;
    }

    private initPhysics() {
        this.getScene().onBeforeRenderObservable.add(this.handleVelocity.bind(this));
    }

    private handleVelocity() {
        if (!this.isDisposed && this.aggregate.body) {
            this.aggregate.body.setAngularVelocity(Vector3.Zero());
            this.aggregate.body.setLinearVelocity(new Vector3(1, 0.5, 1));
        }
    }

    _dispose(): void {
        this.getScene().onBeforeRenderObservable.removeCallback(this.handleVelocity);
        this.dispose();
    }
}